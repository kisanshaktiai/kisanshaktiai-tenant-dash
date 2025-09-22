#!/usr/bin/env python3
"""
NDVI Harvest Worker for Multi-tenant SaaS AgriTech Platform
Fetches Sentinel-2 data from Microsoft Planetary Computer and computes NDVI
"""

import os
import sys
import json
import hashlib
import logging
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import tempfile
from pathlib import Path

import numpy as np
import rasterio
from rasterio.warp import calculate_default_transform, reproject, Resampling
from rasterio.io import MemoryFile
import pystac_client
import planetary_computer
from supabase import create_client, Client
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
import click

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')
STORAGE_BUCKET = os.getenv('STORAGE_BUCKET', 'satellite-tiles')
MPC_STAC_URL = "https://planetarycomputer.microsoft.com/api/stac/v1"
CLOUD_COVER_THRESHOLD = float(os.getenv('CLOUD_COVER_THRESHOLD', '20'))
MAX_TILES_PER_RUN = int(os.getenv('MAX_TILES_PER_RUN', '10'))
RETENTION_DAYS = int(os.getenv('RETENTION_DAYS', '30'))

class NDVIHarvestWorker:
    """Worker for harvesting and processing NDVI data from Sentinel-2"""
    
    def __init__(self):
        """Initialize the worker with Supabase client and STAC catalog"""
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        self.catalog = pystac_client.Client.open(MPC_STAC_URL, modifier=planetary_computer.sign_inplace)
        self.http_client = httpx.AsyncClient(timeout=300.0)
        
    async def __aenter__(self):
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.http_client.aclose()
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=60))
    async def fetch_tile_scenes(self, tile_id: str, days_back: int = 7) -> List[Dict]:
        """
        Fetch available Sentinel-2 scenes for a tile from MPC STAC
        
        Args:
            tile_id: MGRS tile ID (e.g., "43RFN")
            days_back: Number of days to look back for scenes
            
        Returns:
            List of scene metadata sorted by cloud cover
        """
        try:
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days_back)
            
            # Search for Sentinel-2 L2A items
            search = self.catalog.search(
                collections=["sentinel-2-l2a"],
                datetime=f"{start_date.isoformat()}Z/{end_date.isoformat()}Z",
                query={
                    "s2:mgrs_tile": {"eq": tile_id},
                    "eo:cloud_cover": {"lt": CLOUD_COVER_THRESHOLD}
                },
                sortby=[{"field": "properties.eo:cloud_cover", "direction": "asc"}],
                max_items=10
            )
            
            scenes = []
            for item in search.items():
                scenes.append({
                    'id': item.id,
                    'datetime': item.datetime.isoformat(),
                    'cloud_cover': item.properties.get('eo:cloud_cover', 0),
                    'tile_id': item.properties.get('s2:mgrs_tile'),
                    'assets': {
                        'red': item.assets['B04'].href if 'B04' in item.assets else None,
                        'nir': item.assets['B08'].href if 'B08' in item.assets else None,
                        'scl': item.assets['SCL'].href if 'SCL' in item.assets else None
                    },
                    'metadata': item.properties
                })
            
            logger.info(f"Found {len(scenes)} scenes for tile {tile_id}")
            return scenes
            
        except Exception as e:
            logger.error(f"Error fetching scenes for tile {tile_id}: {str(e)}")
            raise
    
    async def download_band(self, url: str) -> np.ndarray:
        """
        Stream download a band from URL
        
        Args:
            url: Signed URL for the band
            
        Returns:
            Numpy array of band data
        """
        try:
            response = await self.http_client.get(url)
            response.raise_for_status()
            
            with MemoryFile(response.content) as memfile:
                with memfile.open() as dataset:
                    band_data = dataset.read(1)
                    transform = dataset.transform
                    crs = dataset.crs
                    
            return band_data, transform, crs
            
        except Exception as e:
            logger.error(f"Error downloading band from {url}: {str(e)}")
            raise
    
    def compute_ndvi(self, red: np.ndarray, nir: np.ndarray) -> np.ndarray:
        """
        Compute NDVI from red and NIR bands
        
        Args:
            red: Red band array
            nir: NIR band array
            
        Returns:
            NDVI array with values from -1 to 1
        """
        # Avoid division by zero
        denominator = nir.astype(float) + red.astype(float)
        denominator[denominator == 0] = np.nan
        
        # Calculate NDVI
        ndvi = (nir.astype(float) - red.astype(float)) / denominator
        
        # Clip to valid range
        ndvi = np.clip(ndvi, -1, 1)
        
        return ndvi
    
    async def create_median_composite(self, scenes: List[Dict], tile_id: str) -> Tuple[np.ndarray, Dict]:
        """
        Create a median composite from multiple scenes to reduce clouds
        
        Args:
            scenes: List of scene metadata
            tile_id: MGRS tile ID
            
        Returns:
            Median NDVI array and metadata
        """
        ndvi_stack = []
        valid_dates = []
        
        for scene in scenes[:5]:  # Use top 5 scenes with lowest cloud cover
            try:
                # Download bands
                red_data, transform, crs = await self.download_band(scene['assets']['red'])
                nir_data, _, _ = await self.download_band(scene['assets']['nir'])
                
                # Compute NDVI
                ndvi = self.compute_ndvi(red_data, nir_data)
                
                # Add to stack
                ndvi_stack.append(ndvi)
                valid_dates.append(scene['datetime'])
                
            except Exception as e:
                logger.warning(f"Failed to process scene {scene['id']}: {str(e)}")
                continue
        
        if not ndvi_stack:
            raise ValueError(f"No valid scenes found for tile {tile_id}")
        
        # Calculate median
        ndvi_median = np.nanmedian(np.stack(ndvi_stack), axis=0)
        
        metadata = {
            'composite_type': 'median',
            'num_scenes': len(ndvi_stack),
            'scene_dates': valid_dates,
            'tile_id': tile_id
        }
        
        return ndvi_median, metadata, transform, crs
    
    def save_ndvi_to_bytes(self, ndvi: np.ndarray, transform, crs) -> bytes:
        """
        Save NDVI array as GeoTIFF bytes
        
        Args:
            ndvi: NDVI array
            transform: Affine transform
            crs: Coordinate reference system
            
        Returns:
            GeoTIFF file as bytes
        """
        profile = {
            'driver': 'GTiff',
            'dtype': 'float32',
            'width': ndvi.shape[1],
            'height': ndvi.shape[0],
            'count': 1,
            'crs': crs,
            'transform': transform,
            'compress': 'lzw',
            'tiled': True,
            'blockxsize': 512,
            'blockysize': 512
        }
        
        with MemoryFile() as memfile:
            with memfile.open(**profile) as dataset:
                dataset.write(ndvi.astype('float32'), 1)
                # Set NDVI color interpretation
                dataset.write_colorinterp(1, rasterio.enums.ColorInterp.gray)
                # Add metadata
                dataset.update_tags(
                    LAYER_TYPE='NDVI',
                    VALID_RANGE='-1,1',
                    SCALE_FACTOR='1.0'
                )
            
            return memfile.read()
    
    async def upload_to_storage(self, file_bytes: bytes, path: str) -> str:
        """
        Upload file to Supabase Storage
        
        Args:
            file_bytes: File content as bytes
            path: Storage path
            
        Returns:
            Public URL of uploaded file
        """
        try:
            # Upload to storage
            response = self.supabase.storage.from_(STORAGE_BUCKET).upload(
                path,
                file_bytes,
                {
                    "content-type": "image/tiff",
                    "cache-control": "max-age=31536000"
                }
            )
            
            # Get public URL
            url = self.supabase.storage.from_(STORAGE_BUCKET).get_public_url(path)
            
            logger.info(f"Uploaded file to {path}")
            return url
            
        except Exception as e:
            logger.error(f"Error uploading to storage: {str(e)}")
            raise
    
    def calculate_checksum(self, data: bytes) -> str:
        """Calculate SHA256 checksum of data"""
        return hashlib.sha256(data).hexdigest()
    
    async def process_tile(self, tenant_id: str, tile_id: str, requested_date: Optional[str] = None) -> Dict:
        """
        Main processing function for a single tile
        
        Args:
            tenant_id: Tenant UUID
            tile_id: MGRS tile ID
            requested_date: Optional specific date to process
            
        Returns:
            Processing result dictionary
        """
        job_id = None
        
        try:
            # Create job record
            job_data = {
                'job_type': 'tile_harvest',
                'status': 'running',
                'tenant_id': tenant_id,
                'target_type': 'tile',
                'parameters': {
                    'tile_id': tile_id,
                    'requested_date': requested_date
                },
                'started_at': datetime.now().isoformat()
            }
            
            job_response = self.supabase.table('system_jobs').insert(job_data).execute()
            job_id = job_response.data[0]['id']
            
            # Update progress
            self.supabase.table('system_jobs').update({
                'progress': 10
            }).eq('id', job_id).execute()
            
            # Fetch scenes from MPC
            scenes = await self.fetch_tile_scenes(tile_id)
            
            if not scenes:
                raise ValueError(f"No scenes found for tile {tile_id}")
            
            # Update progress
            self.supabase.table('system_jobs').update({
                'progress': 30
            }).eq('id', job_id).execute()
            
            # Create median composite or use single scene
            if len(scenes) > 1:
                ndvi_array, metadata, transform, crs = await self.create_median_composite(scenes, tile_id)
                acquisition_date = datetime.now().date().isoformat()
            else:
                scene = scenes[0]
                red_data, transform, crs = await self.download_band(scene['assets']['red'])
                nir_data, _, _ = await self.download_band(scene['assets']['nir'])
                ndvi_array = self.compute_ndvi(red_data, nir_data)
                metadata = scene['metadata']
                acquisition_date = datetime.fromisoformat(scene['datetime']).date().isoformat()
            
            # Update progress
            self.supabase.table('system_jobs').update({
                'progress': 60
            }).eq('id', job_id).execute()
            
            # Convert to GeoTIFF
            ndvi_bytes = self.save_ndvi_to_bytes(ndvi_array, transform, crs)
            checksum = self.calculate_checksum(ndvi_bytes)
            file_size_mb = len(ndvi_bytes) / (1024 * 1024)
            
            # Upload to storage
            storage_path = f"{tile_id}/{acquisition_date}/ndvi.tif"
            ndvi_url = await self.upload_to_storage(ndvi_bytes, storage_path)
            
            # Update progress
            self.supabase.table('system_jobs').update({
                'progress': 80
            }).eq('id', job_id).execute()
            
            # Insert/update satellite_tiles record
            tile_data = {
                'tile_id': tile_id,
                'acquisition_date': acquisition_date,
                'collection': 'sentinel-2-l2a',
                'cloud_cover': scenes[0]['cloud_cover'] if scenes else None,
                'ndvi_path': storage_path,
                'metadata': metadata,
                'file_size_mb': file_size_mb,
                'checksum': checksum,
                'status': 'completed',
                'tenant_id': tenant_id
            }
            
            # Upsert satellite tile
            self.supabase.table('satellite_tiles').upsert(
                tile_data,
                on_conflict='tile_id,acquisition_date,collection'
            ).execute()
            
            # Complete job
            self.supabase.table('system_jobs').update({
                'status': 'completed',
                'progress': 100,
                'completed_at': datetime.now().isoformat(),
                'result': {
                    'ndvi_url': ndvi_url,
                    'checksum': checksum,
                    'file_size_mb': file_size_mb
                }
            }).eq('id', job_id).execute()
            
            # Schedule land clipping jobs
            await self.schedule_land_clipping(tenant_id, tile_id, storage_path)
            
            logger.info(f"Successfully processed tile {tile_id} for tenant {tenant_id}")
            
            return {
                'success': True,
                'tile_id': tile_id,
                'ndvi_url': ndvi_url,
                'acquisition_date': acquisition_date,
                'job_id': job_id
            }
            
        except Exception as e:
            logger.error(f"Error processing tile {tile_id}: {str(e)}")
            
            if job_id:
                self.supabase.table('system_jobs').update({
                    'status': 'failed',
                    'completed_at': datetime.now().isoformat(),
                    'error_message': str(e)
                }).eq('id', job_id).execute()
            
            raise
    
    async def schedule_land_clipping(self, tenant_id: str, tile_id: str, ndvi_path: str):
        """
        Schedule clipping jobs for all lands within the tile
        
        Args:
            tenant_id: Tenant UUID
            tile_id: MGRS tile ID
            ndvi_path: Path to NDVI file in storage
        """
        try:
            # Get lands that intersect with this tile
            lands_response = self.supabase.rpc('get_lands_in_tile', {
                'p_tenant_id': tenant_id,
                'p_tile_id': tile_id
            }).execute()
            
            if not lands_response.data:
                return
            
            # Create clipping jobs for each land
            for land in lands_response.data:
                job_data = {
                    'job_type': 'land_clipping',
                    'status': 'pending',
                    'tenant_id': tenant_id,
                    'target_id': land['id'],
                    'target_type': 'land',
                    'parameters': {
                        'land_id': land['id'],
                        'tile_id': tile_id,
                        'ndvi_path': ndvi_path
                    }
                }
                
                self.supabase.table('system_jobs').insert(job_data).execute()
            
            logger.info(f"Scheduled {len(lands_response.data)} land clipping jobs for tile {tile_id}")
            
        except Exception as e:
            logger.error(f"Error scheduling land clipping: {str(e)}")
    
    async def cleanup_old_tiles(self, retention_days: int = RETENTION_DAYS):
        """
        Clean up old tile data based on retention policy
        
        Args:
            retention_days: Number of days to retain data
        """
        try:
            cutoff_date = (datetime.now() - timedelta(days=retention_days)).date().isoformat()
            
            # Get old tiles
            old_tiles = self.supabase.table('satellite_tiles').select('*').lt(
                'acquisition_date', cutoff_date
            ).execute()
            
            for tile in old_tiles.data:
                # Delete from storage
                if tile.get('ndvi_path'):
                    self.supabase.storage.from_(STORAGE_BUCKET).remove([tile['ndvi_path']])
                
                # Delete from database
                self.supabase.table('satellite_tiles').delete().eq('id', tile['id']).execute()
            
            logger.info(f"Cleaned up {len(old_tiles.data)} old tiles")
            
        except Exception as e:
            logger.error(f"Error cleaning up old tiles: {str(e)}")

@click.command()
@click.option('--tenant-id', required=True, help='Tenant UUID')
@click.option('--tile-ids', help='Comma-separated list of tile IDs (optional)')
@click.option('--all-tiles', is_flag=True, help='Process all tiles for tenant')
@click.option('--cleanup', is_flag=True, help='Run cleanup of old tiles')
async def main(tenant_id: str, tile_ids: Optional[str], all_tiles: bool, cleanup: bool):
    """
    NDVI Harvest Worker CLI
    
    Examples:
        python harvest_worker.py --tenant-id UUID --tile-ids 43RFN,43RGN
        python harvest_worker.py --tenant-id UUID --all-tiles
        python harvest_worker.py --cleanup
    """
    async with NDVIHarvestWorker() as worker:
        try:
            if cleanup:
                await worker.cleanup_old_tiles()
                return
            
            tiles_to_process = []
            
            if all_tiles:
                # Get all tiles for tenant
                response = worker.supabase.rpc('get_tenant_tiles', {
                    'p_tenant_id': tenant_id
                }).execute()
                tiles_to_process = [tile['tile_id'] for tile in response.data]
            elif tile_ids:
                tiles_to_process = tile_ids.split(',')
            else:
                logger.error("Must specify either --tile-ids or --all-tiles")
                return
            
            # Limit tiles per run
            tiles_to_process = tiles_to_process[:MAX_TILES_PER_RUN]
            
            # Process each tile
            results = []
            for tile_id in tiles_to_process:
                try:
                    result = await worker.process_tile(tenant_id, tile_id.strip())
                    results.append(result)
                except Exception as e:
                    logger.error(f"Failed to process tile {tile_id}: {str(e)}")
                    results.append({
                        'success': False,
                        'tile_id': tile_id,
                        'error': str(e)
                    })
            
            # Print summary
            successful = sum(1 for r in results if r.get('success'))
            logger.info(f"Processing complete: {successful}/{len(results)} tiles successful")
            
        except Exception as e:
            logger.error(f"Fatal error: {str(e)}")
            sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())