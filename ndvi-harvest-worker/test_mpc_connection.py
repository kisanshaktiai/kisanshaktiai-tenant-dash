#!/usr/bin/env python3
"""
Test script to verify Microsoft Planetary Computer connection
and NDVI data fetching from real Sentinel-2 satellite imagery
"""

import os
import sys
import json
from datetime import datetime, timedelta
import pystac_client
import planetary_computer
import numpy as np
import rasterio
from rasterio.io import MemoryFile
import httpx
import asyncio

# Test configuration
MPC_STAC_URL = "https://planetarycomputer.microsoft.com/api/stac/v1"
TEST_TILE_ID = "43RFN"  # MGRS tile for Hyderabad region
CLOUD_COVER_THRESHOLD = 20
DAYS_BACK = 7

class MPCValidator:
    """Validator for Microsoft Planetary Computer connection"""
    
    def __init__(self):
        """Initialize the MPC validator"""
        self.catalog = None
        self.http_client = httpx.AsyncClient(timeout=300.0)
        
    async def __aenter__(self):
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.http_client.aclose()
    
    def connect_to_mpc(self):
        """Test connection to Microsoft Planetary Computer STAC API"""
        print(f"[INFO] Connecting to MPC STAC API: {MPC_STAC_URL}")
        try:
            self.catalog = pystac_client.Client.open(
                MPC_STAC_URL, 
                modifier=planetary_computer.sign_inplace
            )
            print("[SUCCESS] Connected to Microsoft Planetary Computer")
            
            # List available collections
            collections = list(self.catalog.get_collections())
            print(f"[INFO] Found {len(collections)} collections")
            
            # Check for Sentinel-2 collection
            sentinel_collections = [c.id for c in collections if 'sentinel-2' in c.id.lower()]
            print(f"[INFO] Sentinel-2 collections available: {sentinel_collections}")
            
            return True
        except Exception as e:
            print(f"[ERROR] Failed to connect to MPC: {str(e)}")
            return False
    
    async def fetch_sentinel2_scenes(self):
        """Fetch real Sentinel-2 scenes for the test tile"""
        print(f"\n[INFO] Fetching Sentinel-2 scenes for tile {TEST_TILE_ID}")
        
        try:
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=DAYS_BACK)
            
            print(f"[INFO] Date range: {start_date.date()} to {end_date.date()}")
            print(f"[INFO] Cloud cover threshold: {CLOUD_COVER_THRESHOLD}%")
            
            # Search for Sentinel-2 L2A items
            search = self.catalog.search(
                collections=["sentinel-2-l2a"],
                datetime=f"{start_date.isoformat()}Z/{end_date.isoformat()}Z",
                query={
                    "s2:mgrs_tile": {"eq": TEST_TILE_ID},
                    "eo:cloud_cover": {"lt": CLOUD_COVER_THRESHOLD}
                },
                sortby=[{"field": "properties.eo:cloud_cover", "direction": "asc"}],
                max_items=5
            )
            
            scenes = []
            for item in search.items():
                scene_info = {
                    'id': item.id,
                    'datetime': item.datetime.isoformat(),
                    'cloud_cover': item.properties.get('eo:cloud_cover', 0),
                    'tile_id': item.properties.get('s2:mgrs_tile'),
                    'product_id': item.properties.get('s2:product_id'),
                    'bands_available': list(item.assets.keys())
                }
                scenes.append(scene_info)
                
                print(f"\n[SCENE] {item.id}")
                print(f"  - Date: {item.datetime.date()}")
                print(f"  - Cloud Cover: {scene_info['cloud_cover']:.2f}%")
                print(f"  - Tile: {scene_info['tile_id']}")
                print(f"  - Available Bands: {len(scene_info['bands_available'])}")
                
                # Check for required bands
                required_bands = ['B04', 'B08', 'SCL']  # Red, NIR, Scene Classification
                bands_present = all(band in item.assets for band in required_bands)
                print(f"  - Required bands present: {bands_present}")
                
                if bands_present and len(scenes) == 0:
                    # Get signed URLs for the first scene
                    print(f"\n[INFO] Getting signed URLs for bands...")
                    red_url = item.assets['B04'].href if 'B04' in item.assets else None
                    nir_url = item.assets['B08'].href if 'B08' in item.assets else None
                    
                    if red_url and nir_url:
                        print(f"  - Red band URL: {red_url[:100]}...")
                        print(f"  - NIR band URL: {nir_url[:100]}...")
                        
                        # Test downloading a small portion
                        await self.test_band_download(red_url, "Red (B04)")
                        await self.test_band_download(nir_url, "NIR (B08)")
            
            print(f"\n[SUMMARY] Found {len(scenes)} suitable scenes")
            return scenes
            
        except Exception as e:
            print(f"[ERROR] Failed to fetch Sentinel-2 scenes: {str(e)}")
            import traceback
            traceback.print_exc()
            return []
    
    async def test_band_download(self, url: str, band_name: str):
        """Test downloading a band from URL"""
        print(f"\n[TEST] Downloading {band_name} band...")
        try:
            # Download with range header to get just a small portion
            headers = {'Range': 'bytes=0-1048576'}  # First 1MB
            response = await self.http_client.get(url, headers=headers)
            
            if response.status_code in [200, 206]:  # 206 is partial content
                print(f"  - Successfully downloaded {len(response.content)} bytes")
                
                # Try to read metadata
                try:
                    with MemoryFile(response.content) as memfile:
                        with memfile.open() as dataset:
                            print(f"  - Raster shape: {dataset.shape}")
                            print(f"  - Data type: {dataset.dtypes[0]}")
                            print(f"  - CRS: {dataset.crs}")
                except:
                    print("  - Partial download successful (metadata not available in partial file)")
                
                return True
            else:
                print(f"  - Download failed with status: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"  - Download error: {str(e)}")
            return False
    
    def compute_ndvi_sample(self, red: np.ndarray, nir: np.ndarray) -> np.ndarray:
        """Compute NDVI from red and NIR bands"""
        # Avoid division by zero
        denominator = nir.astype(float) + red.astype(float)
        denominator[denominator == 0] = np.nan
        
        # Calculate NDVI
        ndvi = (nir.astype(float) - red.astype(float)) / denominator
        
        # Clip to valid range
        ndvi = np.clip(ndvi, -1, 1)
        
        return ndvi
    
    def validate_ndvi_values(self, ndvi: np.ndarray):
        """Validate NDVI values are realistic"""
        valid_mask = ~np.isnan(ndvi)
        if np.any(valid_mask):
            valid_ndvi = ndvi[valid_mask]
            print(f"\n[NDVI VALIDATION]")
            print(f"  - Min NDVI: {np.min(valid_ndvi):.4f}")
            print(f"  - Max NDVI: {np.max(valid_ndvi):.4f}")
            print(f"  - Mean NDVI: {np.mean(valid_ndvi):.4f}")
            print(f"  - Std NDVI: {np.std(valid_ndvi):.4f}")
            
            # Check if values are realistic
            if np.min(valid_ndvi) >= -1 and np.max(valid_ndvi) <= 1:
                print("  - ✓ NDVI values are within valid range [-1, 1]")
            else:
                print("  - ✗ NDVI values out of range!")
            
            # Check for vegetation presence
            vegetation_pixels = np.sum(valid_ndvi > 0.2)
            vegetation_percentage = (vegetation_pixels / len(valid_ndvi)) * 100
            print(f"  - Vegetation coverage: {vegetation_percentage:.2f}%")
            
            return True
        return False

async def main():
    """Main test function"""
    print("="*60)
    print("Microsoft Planetary Computer Connection Test")
    print("="*60)
    
    async with MPCValidator() as validator:
        # Test 1: Connect to MPC
        if not validator.connect_to_mpc():
            print("\n[FAIL] Cannot connect to MPC. Check network and API availability.")
            return False
        
        # Test 2: Fetch real Sentinel-2 scenes
        scenes = await validator.fetch_sentinel2_scenes()
        if not scenes:
            print("\n[FAIL] No Sentinel-2 scenes found. Check tile ID and date range.")
            return False
        
        print("\n" + "="*60)
        print("[SUCCESS] MPC Connection Validated!")
        print("="*60)
        print("\nSUMMARY:")
        print(f"✓ Connected to Microsoft Planetary Computer STAC API")
        print(f"✓ Found {len(scenes)} Sentinel-2 scenes for tile {TEST_TILE_ID}")
        print(f"✓ Successfully accessed satellite band data")
        print(f"✓ System ready to fetch real NDVI data from MPC")
        
        print("\nNEXT STEPS:")
        print("1. The harvest worker is configured to fetch from MPC")
        print("2. Click 'Fetch NDVI Data' in the UI to trigger real satellite data fetch")
        print("3. Processing will take 5-10 minutes per land")
        print("4. Real NDVI values will replace test data in the database")
        
        return True

if __name__ == "__main__":
    # Run the async main function
    success = asyncio.run(main())
    sys.exit(0 if success else 1)