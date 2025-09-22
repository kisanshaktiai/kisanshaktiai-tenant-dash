#!/usr/bin/env python3
"""
Land Clipper Worker for KisanShakti AI
Clips tile-level NDVI rasters to individual land boundaries
"""

import os
import sys
import json
import logging
import hashlib
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, Any
import tempfile
from io import BytesIO

import click
import numpy as np
import rasterio
from rasterio.mask import mask
from rasterio.warp import transform_bounds, calculate_default_transform, reproject, Resampling
from rasterio.crs import CRS
from shapely.geometry import shape, mapping
from shapely.ops import transform as shapely_transform
import pyproj
from tenacity import retry, stop_after_attempt, wait_exponential
from supabase import create_client, Client
import httpx

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class LandClipperWorker:
    """Worker to clip NDVI rasters to land boundaries"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        """Initialize the worker with Supabase credentials"""
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.storage_bucket = "satellite-tiles"
        self.preview_bucket = "land-previews"
        
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def fetch_pending_job(self) -> Optional[Dict]:
        """Fetch one pending land_clipping job and lock it"""
        try:
            # Fetch a pending job and immediately update to running
            response = self.supabase.table("system_jobs").select("*").eq(
                "job_type", "land_clipping"
            ).eq("status", "pending").order("created_at").limit(1).execute()
            
            if not response.data:
                return None
                
            job = response.data[0]
            
            # Lock the job by setting status to running
            update_response = self.supabase.table("system_jobs").update({
                "status": "running",
                "started_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", job["id"]).eq("status", "pending").execute()
            
            # Check if we successfully locked the job
            if not update_response.data:
                logger.info(f"Job {job['id']} was already taken by another worker")
                return None
                
            logger.info(f"Locked job {job['id']} for processing")
            return job
            
        except Exception as e:
            logger.error(f"Error fetching pending job: {e}")
            return None
            
    def get_land_boundary(self, land_id: str, tenant_id: str) -> Optional[Dict]:
        """Fetch land boundary from database"""
        try:
            response = self.supabase.rpc(
                "st_asgeojson",
                {"geom": self.supabase.table("lands").select("boundary").eq(
                    "id", land_id
                ).eq("tenant_id", tenant_id).single().execute().data["boundary"]}
            ).execute()
            
            if response.data:
                return json.loads(response.data)
            
            # Fallback: get raw boundary
            response = self.supabase.table("lands").select(
                "boundary, center_lat, center_lon, area_acres"
            ).eq("id", land_id).eq("tenant_id", tenant_id).single().execute()
            
            if response.data:
                land = response.data
                # Try to parse boundary as GeoJSON
                if land.get("boundary"):
                    return land["boundary"]
                    
            return None
            
        except Exception as e:
            logger.error(f"Error fetching land boundary: {e}")
            return None
            
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def download_ndvi_raster(self, ndvi_path: str) -> Optional[bytes]:
        """Download NDVI raster from Supabase Storage"""
        try:
            # Get signed URL for the file
            response = self.supabase.storage.from_(self.storage_bucket).create_signed_url(
                ndvi_path, 
                expires_in=3600  # 1 hour expiry
            )
            
            if not response or 'signedURL' not in response:
                logger.error(f"Failed to get signed URL for {ndvi_path}")
                return None
                
            # Download the file
            with httpx.Client() as client:
                download_response = client.get(response['signedURL'])
                download_response.raise_for_status()
                return download_response.content
                
        except Exception as e:
            logger.error(f"Error downloading NDVI raster: {e}")
            return None
            
    def clip_raster_to_land(
        self, 
        raster_data: bytes, 
        land_geojson: Dict
    ) -> Tuple[Optional[np.ndarray], Dict]:
        """Clip raster to land boundary and compute statistics"""
        stats = {
            "min_ndvi": None,
            "max_ndvi": None,
            "mean_ndvi": None,
            "valid_pixels": 0,
            "total_pixels": 0,
            "coverage_percentage": 0.0
        }
        
        try:
            # Create geometry from GeoJSON
            geom = shape(land_geojson['geometry'] if 'geometry' in land_geojson else land_geojson)
            
            with rasterio.open(BytesIO(raster_data)) as src:
                # Check if we need to reproject the geometry
                src_crs = src.crs
                
                # Transform geometry to raster CRS if needed
                if src_crs and src_crs != CRS.from_epsg(4326):
                    project = pyproj.Transformer.from_crs(
                        CRS.from_epsg(4326), 
                        src_crs, 
                        always_xy=True
                    ).transform
                    geom = shapely_transform(project, geom)
                
                # Clip the raster
                clipped, transform_clip = mask(
                    src, 
                    [geom], 
                    crop=True,
                    nodata=-9999,
                    all_touched=True
                )
                
                # Get the first band (NDVI)
                ndvi_array = clipped[0]
                
                # Compute statistics
                valid_mask = (ndvi_array != -9999) & (~np.isnan(ndvi_array))
                valid_pixels = np.sum(valid_mask)
                total_pixels = ndvi_array.size
                
                if valid_pixels > 0:
                    valid_data = ndvi_array[valid_mask]
                    stats["min_ndvi"] = float(np.min(valid_data))
                    stats["max_ndvi"] = float(np.max(valid_data))
                    stats["mean_ndvi"] = float(np.mean(valid_data))
                    stats["valid_pixels"] = int(valid_pixels)
                    stats["total_pixels"] = int(total_pixels)
                    stats["coverage_percentage"] = float(valid_pixels / total_pixels * 100)
                    
                    logger.info(f"Clipped raster stats: mean={stats['mean_ndvi']:.3f}, "
                              f"coverage={stats['coverage_percentage']:.1f}%")
                    
                    return ndvi_array, stats
                else:
                    logger.warning("No valid pixels found in clipped area")
                    return None, stats
                    
        except Exception as e:
            logger.error(f"Error clipping raster: {e}")
            return None, stats
            
    def generate_preview_image(
        self, 
        ndvi_array: np.ndarray, 
        land_id: str, 
        date: str
    ) -> Optional[str]:
        """Generate PNG preview of clipped NDVI and upload to storage"""
        try:
            import matplotlib
            matplotlib.use('Agg')
            import matplotlib.pyplot as plt
            from matplotlib.colors import LinearSegmentedColormap
            
            # Create NDVI colormap (red -> yellow -> green)
            colors = ['#8B0000', '#FF0000', '#FFA500', '#FFFF00', '#90EE90', '#228B22', '#006400']
            n_bins = 100
            cmap = LinearSegmentedColormap.from_list('ndvi', colors, N=n_bins)
            
            # Create figure
            fig, ax = plt.subplots(figsize=(8, 8))
            
            # Mask invalid values
            masked_array = np.ma.masked_where(
                (ndvi_array == -9999) | np.isnan(ndvi_array), 
                ndvi_array
            )
            
            # Plot NDVI
            im = ax.imshow(masked_array, cmap=cmap, vmin=-0.2, vmax=0.8)
            ax.set_title(f'NDVI - {date}', fontsize=12)
            ax.axis('off')
            
            # Add colorbar
            cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
            cbar.set_label('NDVI', rotation=270, labelpad=15)
            
            # Save to bytes
            buf = BytesIO()
            plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
            buf.seek(0)
            plt.close()
            
            # Upload to storage
            file_path = f"{land_id}/{date}/ndvi_preview.png"
            response = self.supabase.storage.from_(self.preview_bucket).upload(
                file_path,
                buf.read(),
                {"content-type": "image/png"}
            )
            
            if response:
                logger.info(f"Preview uploaded to {file_path}")
                return file_path
            
        except ImportError:
            logger.warning("Matplotlib not available, skipping preview generation")
        except Exception as e:
            logger.error(f"Error generating preview: {e}")
            
        return None
        
    def update_ndvi_data(
        self,
        tenant_id: str,
        land_id: str,
        date: str,
        stats: Dict,
        tile_id: str,
        scene_id: Optional[str] = None,
        image_url: Optional[str] = None
    ) -> bool:
        """Insert or update NDVI data in database"""
        try:
            # Prepare data
            ndvi_record = {
                "tenant_id": tenant_id,
                "land_id": land_id,
                "date": date,
                "ndvi_value": stats.get("mean_ndvi"),
                "min_ndvi": stats.get("min_ndvi"),
                "max_ndvi": stats.get("max_ndvi"),
                "mean_ndvi": stats.get("mean_ndvi"),
                "valid_pixels": stats.get("valid_pixels"),
                "total_pixels": stats.get("total_pixels"),
                "coverage_percentage": stats.get("coverage_percentage"),
                "tile_id": tile_id,
                "scene_id": scene_id,
                "satellite_source": "Sentinel-2",
                "processing_level": "L2A",
                "spatial_resolution": 10,
                "computed_at": datetime.now(timezone.utc).isoformat(),
                "image_url": image_url
            }
            
            # Upsert the record
            response = self.supabase.table("ndvi_data").upsert(
                ndvi_record,
                on_conflict="tenant_id,land_id,date"
            ).execute()
            
            if response.data:
                logger.info(f"NDVI data saved for land {land_id} on {date}")
                return True
            
        except Exception as e:
            logger.error(f"Error updating NDVI data: {e}")
            
        return False
        
    def update_job_status(
        self,
        job_id: str,
        status: str,
        result: Optional[Dict] = None,
        error_message: Optional[str] = None
    ):
        """Update job status in database"""
        try:
            update_data = {
                "status": status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            if status == "completed":
                update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
                if result:
                    update_data["result"] = result
                    
            elif status == "failed":
                update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
                if error_message:
                    update_data["error_message"] = error_message
                    
            self.supabase.table("system_jobs").update(update_data).eq(
                "id", job_id
            ).execute()
            
            logger.info(f"Job {job_id} status updated to {status}")
            
        except Exception as e:
            logger.error(f"Error updating job status: {e}")
            
    def process_job(self, job: Dict) -> bool:
        """Process a single land clipping job"""
        try:
            # Extract parameters
            params = job.get("parameters", {})
            tenant_id = job["tenant_id"]
            land_id = params.get("land_id")
            tile_id = params.get("tile_id")
            acquisition_date = params.get("acquisition_date")
            ndvi_path = params.get("ndvi_path")
            
            if not all([land_id, tile_id, acquisition_date, ndvi_path]):
                raise ValueError("Missing required job parameters")
                
            logger.info(f"Processing land {land_id} for tile {tile_id} on {acquisition_date}")
            
            # Get land boundary
            land_boundary = self.get_land_boundary(land_id, tenant_id)
            if not land_boundary:
                raise ValueError(f"Could not fetch boundary for land {land_id}")
                
            # Download NDVI raster
            raster_data = self.download_ndvi_raster(ndvi_path)
            if not raster_data:
                raise ValueError(f"Could not download NDVI raster from {ndvi_path}")
                
            # Clip raster to land boundary
            clipped_ndvi, stats = self.clip_raster_to_land(raster_data, land_boundary)
            
            if stats["valid_pixels"] == 0:
                raise ValueError("No valid pixels in clipped area (possibly fully cloudy)")
                
            # Generate preview image (optional)
            preview_path = None
            if clipped_ndvi is not None:
                preview_path = self.generate_preview_image(
                    clipped_ndvi, 
                    land_id, 
                    acquisition_date
                )
                
            # Update NDVI data
            success = self.update_ndvi_data(
                tenant_id=tenant_id,
                land_id=land_id,
                date=acquisition_date,
                stats=stats,
                tile_id=tile_id,
                scene_id=params.get("scene_id"),
                image_url=preview_path
            )
            
            if success:
                # Update job status to completed
                self.update_job_status(
                    job["id"],
                    "completed",
                    result={
                        "stats": stats,
                        "preview_path": preview_path
                    }
                )
                return True
            else:
                raise ValueError("Failed to update NDVI data")
                
        except Exception as e:
            logger.error(f"Error processing job {job['id']}: {e}")
            self.update_job_status(
                job["id"],
                "failed",
                error_message=str(e)
            )
            return False
            
    def run(self, max_jobs: int = 1):
        """Main worker loop"""
        logger.info("Land Clipper Worker started")
        jobs_processed = 0
        
        while jobs_processed < max_jobs:
            # Fetch a pending job
            job = self.fetch_pending_job()
            
            if not job:
                logger.info("No pending jobs found")
                break
                
            # Process the job
            success = self.process_job(job)
            
            if success:
                logger.info(f"Successfully processed job {job['id']}")
            else:
                logger.error(f"Failed to process job {job['id']}")
                
            jobs_processed += 1
            
        logger.info(f"Land Clipper Worker completed. Processed {jobs_processed} jobs")


@click.command()
@click.option('--supabase-url', envvar='SUPABASE_URL', required=True, help='Supabase URL')
@click.option('--supabase-key', envvar='SUPABASE_SERVICE_KEY', required=True, help='Supabase service key')
@click.option('--max-jobs', default=1, help='Maximum number of jobs to process')
@click.option('--continuous', is_flag=True, help='Run continuously')
def main(supabase_url: str, supabase_key: str, max_jobs: int, continuous: bool):
    """Land Clipper Worker CLI"""
    worker = LandClipperWorker(supabase_url, supabase_key)
    
    if continuous:
        logger.info("Running in continuous mode")
        import time
        while True:
            worker.run(max_jobs=max_jobs)
            time.sleep(30)  # Wait 30 seconds before checking for more jobs
    else:
        worker.run(max_jobs=max_jobs)


if __name__ == "__main__":
    main()