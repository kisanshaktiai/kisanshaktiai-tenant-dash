#!/usr/bin/env python3
"""
Land Clipper Worker for KisanShakti AI
Clips tile-level satellite rasters to individual land boundaries
Computes NDVI, EVI, NDWI, SAVI vegetation indices and generates preview images
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
    """Worker to clip satellite rasters to land boundaries and compute vegetation indices"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        """Initialize the worker with Supabase credentials"""
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.storage_bucket = "satellite-tiles"
        self.preview_bucket = "land-previews"
        
    def compute_vegetation_indices(
        self,
        red: np.ndarray,
        nir: np.ndarray,
        blue: Optional[np.ndarray] = None,
        swir: Optional[np.ndarray] = None
    ) -> Dict[str, np.ndarray]:
        """
        Compute various vegetation indices from satellite bands
        
        Args:
            red: Red band array
            nir: Near-infrared band array
            blue: Blue band array (optional, for EVI)
            swir: Short-wave infrared band array (optional, for NDWI)
            
        Returns:
            Dictionary with computed indices arrays
        """
        indices = {}
        
        # Avoid division by zero
        epsilon = 1e-10
        
        # NDVI = (NIR - Red) / (NIR + Red)
        ndvi_num = nir - red
        ndvi_denom = nir + red + epsilon
        indices['ndvi'] = np.divide(ndvi_num, ndvi_denom, where=ndvi_denom!=0)
        
        # SAVI = (1.5 * (NIR - Red)) / (NIR + Red + 0.5)
        L = 0.5  # Soil brightness correction factor
        savi_num = (1 + L) * (nir - red)
        savi_denom = nir + red + L + epsilon
        indices['savi'] = np.divide(savi_num, savi_denom, where=savi_denom!=0)
        
        # EVI = 2.5 * (NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1)
        if blue is not None:
            evi_num = 2.5 * (nir - red)
            evi_denom = nir + 6 * red - 7.5 * blue + 1 + epsilon
            indices['evi'] = np.divide(evi_num, evi_denom, where=evi_denom!=0)
            # Clip EVI to reasonable range
            indices['evi'] = np.clip(indices['evi'], -1, 1)
        
        # NDWI = (NIR - SWIR) / (NIR + SWIR)
        if swir is not None:
            ndwi_num = nir - swir
            ndwi_denom = nir + swir + epsilon
            indices['ndwi'] = np.divide(ndwi_num, ndwi_denom, where=ndwi_denom!=0)
        
        # Clip all indices to [-1, 1] range
        for key in indices:
            indices[key] = np.clip(indices[key], -1, 1)
            
        return indices
    
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
    ) -> Tuple[Optional[Dict[str, np.ndarray]], Dict]:
        """Clip raster to land boundary and compute vegetation indices statistics"""
        stats = {
            "min_ndvi": None,
            "max_ndvi": None,
            "mean_ndvi": None,
            "ndvi_value": None,
            "evi_value": None,
            "ndwi_value": None,
            "savi_value": None,
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
                
                # Determine what bands we have
                band_count = src.count
                band_descriptions = [src.descriptions[i] if src.descriptions else f"Band_{i+1}" 
                                   for i in range(band_count)]
                
                logger.info(f"Processing {band_count} bands: {band_descriptions}")
                
                # Try to identify bands or use them directly for indices
                bands = {}
                indices_arrays = {}
                
                if band_count >= 4:
                    # Assume bands are in order: Blue, Green, Red, NIR (common for Sentinel-2)
                    # Or check if it's already processed NDVI
                    if 'NDVI' in str(band_descriptions[0]).upper() and band_count == 1:
                        # Single NDVI band
                        ndvi_array = clipped[0]
                        indices_arrays['ndvi'] = ndvi_array
                    else:
                        # Multi-band raster - extract bands
                        # Common Sentinel-2 band order after processing
                        blue = clipped[0] if band_count > 0 else None
                        green = clipped[1] if band_count > 1 else None  
                        red = clipped[2] if band_count > 2 else None
                        nir = clipped[3] if band_count > 3 else None
                        swir = clipped[4] if band_count > 4 else None
                        
                        # Compute vegetation indices if we have the required bands
                        if red is not None and nir is not None:
                            indices_arrays = self.compute_vegetation_indices(
                                red=red,
                                nir=nir,
                                blue=blue,
                                swir=swir
                            )
                        else:
                            logger.warning("Insufficient bands for vegetation index calculation")
                elif band_count == 1:
                    # Single band - assume it's NDVI
                    ndvi_array = clipped[0]
                    indices_arrays['ndvi'] = ndvi_array
                
                # Compute statistics for each index
                for index_name, index_array in indices_arrays.items():
                    valid_mask = (index_array != -9999) & (~np.isnan(index_array)) & (index_array != 0)
                    valid_pixels = np.sum(valid_mask)
                    total_pixels = index_array.size
                    
                    if valid_pixels > 0:
                        valid_data = index_array[valid_mask]
                        
                        if index_name == 'ndvi':
                            stats["min_ndvi"] = float(np.min(valid_data))
                            stats["max_ndvi"] = float(np.max(valid_data))
                            stats["mean_ndvi"] = float(np.mean(valid_data))
                            stats["ndvi_value"] = stats["mean_ndvi"]
                        elif index_name == 'evi':
                            stats["evi_value"] = float(np.mean(valid_data))
                        elif index_name == 'ndwi':
                            stats["ndwi_value"] = float(np.mean(valid_data))
                        elif index_name == 'savi':
                            stats["savi_value"] = float(np.mean(valid_data))
                        
                        # Update overall pixel stats
                        stats["valid_pixels"] = max(stats["valid_pixels"], int(valid_pixels))
                        stats["total_pixels"] = max(stats["total_pixels"], int(total_pixels))
                
                if stats["total_pixels"] > 0:
                    stats["coverage_percentage"] = float(stats["valid_pixels"] / stats["total_pixels"] * 100)
                
                if stats["valid_pixels"] > 0:
                    logger.info(f"Computed indices - NDVI: {stats.get('ndvi_value', 'N/A'):.3f}, "
                              f"EVI: {stats.get('evi_value', 'N/A'):.3f}, "
                              f"NDWI: {stats.get('ndwi_value', 'N/A'):.3f}, "
                              f"SAVI: {stats.get('savi_value', 'N/A'):.3f}, "
                              f"Coverage: {stats['coverage_percentage']:.1f}%")
                    
                    return indices_arrays, stats
                else:
                    logger.warning("No valid pixels found in clipped area")
                    return None, stats
                    
        except Exception as e:
            logger.error(f"Error clipping raster: {e}")
            return None, stats
            
    def generate_preview_image(
        self, 
        indices_arrays: Dict[str, np.ndarray], 
        land_id: str, 
        date: str
    ) -> Optional[str]:
        """Generate PNG preview of vegetation indices and upload to storage"""
        try:
            import matplotlib
            matplotlib.use('Agg')
            import matplotlib.pyplot as plt
            from matplotlib.colors import LinearSegmentedColormap
            import matplotlib.gridspec as gridspec
            
            # Create vegetation index colormap (red -> yellow -> green)
            colors = ['#8B0000', '#FF0000', '#FFA500', '#FFFF00', '#90EE90', '#228B22', '#006400']
            n_bins = 100
            cmap = LinearSegmentedColormap.from_list('vegetation', colors, N=n_bins)
            
            # Determine which indices we have
            available_indices = list(indices_arrays.keys())
            num_indices = len(available_indices)
            
            if num_indices == 0:
                logger.warning("No indices available for preview generation")
                return None
            
            # Create figure with subplots for each index
            if num_indices == 1:
                fig, ax = plt.subplots(figsize=(8, 8))
                axes = [ax]
            elif num_indices == 2:
                fig, axes = plt.subplots(1, 2, figsize=(12, 6))
            elif num_indices <= 4:
                fig, axes = plt.subplots(2, 2, figsize=(12, 12))
                axes = axes.flatten()
            else:
                # For more than 4 indices, still use 2x2 grid and show first 4
                fig, axes = plt.subplots(2, 2, figsize=(12, 12))
                axes = axes.flatten()
                available_indices = available_indices[:4]
            
            # Plot each index
            for idx, (index_name, index_array) in enumerate(indices_arrays.items()):
                if idx >= len(axes):
                    break
                    
                ax = axes[idx]
                
                # Mask invalid values
                masked_array = np.ma.masked_where(
                    (index_array == -9999) | np.isnan(index_array) | (index_array == 0), 
                    index_array
                )
                
                # Determine appropriate value range for each index
                if index_name in ['ndvi', 'evi', 'savi']:
                    vmin, vmax = -0.2, 0.8
                elif index_name == 'ndwi':
                    vmin, vmax = -0.5, 0.5
                else:
                    vmin, vmax = -1, 1
                
                # Plot index
                im = ax.imshow(masked_array, cmap=cmap, vmin=vmin, vmax=vmax)
                ax.set_title(f'{index_name.upper()} - {date}', fontsize=12)
                ax.axis('off')
                
                # Add colorbar
                cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
                cbar.set_label(index_name.upper(), rotation=270, labelpad=15)
            
            # Hide any unused subplots
            if num_indices < len(axes):
                for idx in range(num_indices, len(axes)):
                    axes[idx].axis('off')
            
            plt.suptitle(f'Vegetation Indices - Land {land_id}', fontsize=14, y=1.02)
            plt.tight_layout()
            
            # Save to bytes
            buf = BytesIO()
            plt.savefig(buf, format='png', dpi=120, bbox_inches='tight')
            buf.seek(0)
            plt.close()
            
            # Upload to storage
            file_path = f"{land_id}/{date}/vegetation_indices_preview.png"
            
            # Check if file already exists and delete it first
            try:
                existing = self.supabase.storage.from_(self.preview_bucket).list(f"{land_id}/{date}")
                if any(f['name'] == 'vegetation_indices_preview.png' for f in existing):
                    self.supabase.storage.from_(self.preview_bucket).remove([file_path])
            except:
                pass  # File might not exist
            
            response = self.supabase.storage.from_(self.preview_bucket).upload(
                file_path,
                buf.read(),
                {"content-type": "image/png", "upsert": "true"}
            )
            
            if response:
                logger.info(f"Preview uploaded to {file_path}")
                
                # Generate public URL
                public_url = self.supabase.storage.from_(self.preview_bucket).get_public_url(file_path)
                return public_url
            
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
        """Insert or update vegetation indices data in database"""
        try:
            # Prepare data with all vegetation indices
            ndvi_record = {
                "tenant_id": tenant_id,
                "land_id": land_id,
                "date": date,
                "ndvi_value": stats.get("ndvi_value") or stats.get("mean_ndvi"),
                "min_ndvi": stats.get("min_ndvi"),
                "max_ndvi": stats.get("max_ndvi"),
                "mean_ndvi": stats.get("mean_ndvi"),
                "evi_value": stats.get("evi_value"),
                "ndwi_value": stats.get("ndwi_value"),
                "savi_value": stats.get("savi_value"),
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
                
            # Clip raster to land boundary and compute indices
            indices_arrays, stats = self.clip_raster_to_land(raster_data, land_boundary)
            
            if stats["valid_pixels"] == 0:
                raise ValueError("No valid pixels in clipped area (possibly fully cloudy)")
                
            # Generate preview image with all indices
            preview_url = None
            if indices_arrays is not None and len(indices_arrays) > 0:
                preview_url = self.generate_preview_image(
                    indices_arrays, 
                    land_id, 
                    acquisition_date
                )
                
            # Update vegetation indices data
            success = self.update_ndvi_data(
                tenant_id=tenant_id,
                land_id=land_id,
                date=acquisition_date,
                stats=stats,
                tile_id=tile_id,
                scene_id=params.get("scene_id"),
                image_url=preview_url
            )
            
            if success:
                # Update job status to completed
                self.update_job_status(
                    job["id"],
                    "completed",
                    result={
                    "stats": stats,
                    "preview_url": preview_url
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