/**
 * Service for fetching NDVI data from Render API
 * Base URL: https://ndvi-land-api.onrender.com
 */

import { supabase } from '@/integrations/supabase/client';

const NDVI_API_BASE_URL = 'https://ndvi-land-api.onrender.com';
const CACHE_DURATION_DAYS = 7;

export interface LandGeometry {
  land_id: string;
  land_name: string;
  geometry: any; // GeoJSON geometry
}

export interface NDVIApiResponse {
  land_id: string;
  ndvi_value: number;
  evi_value?: number;
  ndwi_value?: number;
  savi_value?: number;
  image_url?: string;
  date: string;
  metadata?: any;
}

export interface FetchNDVIResult {
  success: boolean;
  land_id: string;
  land_name: string;
  cached: boolean;
  error?: string;
  data?: any;
}

export class NDVILandService {
  /**
   * Check if cached NDVI data exists and is fresh (< 7 days old)
   */
  private async isCacheFresh(landId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('ndvi_data')
      .select('created_at, date')
      .eq('land_id', landId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return false;

    const cacheDate = new Date(data.created_at);
    const now = new Date();
    const daysDiff = (now.getTime() - cacheDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysDiff < CACHE_DURATION_DAYS;
  }

  /**
   * Fetch NDVI data from API for a single land (with geometry)
   */
  private async fetchFromAPI(
    landId: string, 
    geometry: any,
    tenantId: string,
    farmerId?: string
  ): Promise<NDVIApiResponse> {
    try {
      console.log(`Fetching NDVI for land ${landId} with geometry:`, {
        tenant_id: tenantId,
        farmer_id: farmerId,
        has_geometry: !!geometry
      });

      // Send POST request with land boundary geometry
      const response = await fetch(`${NDVI_API_BASE_URL}/lands/${landId}/ndvi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          land_id: landId,
          tenant_id: tenantId,
          farmer_id: farmerId,
          geometry: geometry, // GeoJSON geometry from lands table
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`NDVI API error for land ${landId}:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          geometry_sent: !!geometry
        });
        throw new Error(`API request failed: ${response.status} - ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ NDVI data received for land ${landId}:`, data);
      return data;
    } catch (error) {
      console.error(`Failed to fetch NDVI for land ${landId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch NDVI data for all lands of a farmer in bulk (with geometries)
   */
  private async fetchBulkForFarmer(
    farmerId: string,
    tenantId: string,
    lands: LandGeometry[]
  ): Promise<NDVIApiResponse[]> {
    try {
      console.log(`Bulk fetching NDVI for farmer ${farmerId} with ${lands.length} lands`);

      // Send POST request with all land geometries
      const response = await fetch(`${NDVI_API_BASE_URL}/farmers/${farmerId}/ndvi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          farmer_id: farmerId,
          tenant_id: tenantId,
          lands: lands.map(land => ({
            land_id: land.land_id,
            name: land.land_name,
            geometry: land.geometry
          }))
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`NDVI bulk API error for farmer ${farmerId}:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          lands_count: lands.length
        });
        throw new Error(`Bulk API request failed: ${response.status} - ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Bulk NDVI data received for ${data.length} lands`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch bulk NDVI for farmer ${farmerId}:`, error);
      throw error;
    }
  }

  /**
   * Save NDVI data to database
   */
  private async saveToDatabase(
    landId: string,
    tenantId: string,
    ndviData: NDVIApiResponse
  ): Promise<void> {
    const { error } = await supabase.from('ndvi_data').insert({
      land_id: landId,
      tenant_id: tenantId,
      date: ndviData.date,
      ndvi_value: ndviData.ndvi_value,
      evi_value: ndviData.evi_value || 0,
      ndwi_value: ndviData.ndwi_value || 0,
      savi_value: ndviData.savi_value || 0,
      image_url: ndviData.image_url,
      metadata: ndviData.metadata || {},
    });

    if (error) {
      throw new Error(`Failed to save NDVI data: ${error.message}`);
    }
  }

  /**
   * Fetch NDVI data for a single land with caching
   */
  async fetchNDVIForLand(
    landId: string,
    landName: string,
    tenantId: string,
    geometry: any,
    farmerId?: string,
    forceRefresh: boolean = false
  ): Promise<FetchNDVIResult> {
    try {
      // Check if geometry exists
      if (!geometry) {
        throw new Error('Land geometry is required for NDVI processing');
      }

      // Check cache unless force refresh
      if (!forceRefresh) {
        const isFresh = await this.isCacheFresh(landId);
        if (isFresh) {
          console.log(`Using cached NDVI data for land ${landId}`);
          return {
            success: true,
            land_id: landId,
            land_name: landName,
            cached: true,
          };
        }
      }

      // Fetch from API with geometry
      const ndviData = await this.fetchFromAPI(landId, geometry, tenantId, farmerId);

      // Save to database
      await this.saveToDatabase(landId, tenantId, ndviData);

      return {
        success: true,
        land_id: landId,
        land_name: landName,
        cached: false,
        data: ndviData,
      };
    } catch (error) {
      console.error(`Error fetching NDVI for land ${landId}:`, error);
      return {
        success: false,
        land_id: landId,
        land_name: landName,
        cached: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Fetch NDVI data for all lands under a tenant and farmer
   * Uses bulk API when farmer_id is provided, otherwise individual requests
   */
  async fetchNDVIForLands(
    tenantId: string,
    farmerId?: string,
    forceRefresh: boolean = false
  ): Promise<FetchNDVIResult[]> {
    try {
      console.log('🔍 Fetching lands with boundaries:', {
        tenant_id: tenantId,
        farmer_id: farmerId,
        force_refresh: forceRefresh
      });

      // Get all active lands WITH BOUNDARY (geometry) for the tenant/farmer
      let query = supabase
        .from('lands')
        .select('id, name, tenant_id, farmer_id, boundary')
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      if (farmerId) {
        query = query.eq('farmer_id', farmerId);
      }

      const { data: lands, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch lands: ${error.message}`);
      }

      if (!lands || lands.length === 0) {
        console.warn('⚠️ No lands found for tenant:', {
          tenant_id: tenantId,
          farmer_id: farmerId
        });
        return [];
      }

      console.log(`✅ Found ${lands.length} lands with boundaries`);

      // Validate that lands have boundary geometry
      const landsWithGeometry = lands.filter(land => land.boundary);
      if (landsWithGeometry.length === 0) {
        throw new Error('No lands have boundary data. Please add land boundaries first.');
      }

      if (landsWithGeometry.length < lands.length) {
        console.warn(`⚠️ ${lands.length - landsWithGeometry.length} lands missing boundary data`);
      }

      const results: FetchNDVIResult[] = [];

      // Prepare land geometries for API (convert boundary to GeoJSON)
      const landGeometries: LandGeometry[] = landsWithGeometry.map(land => ({
        land_id: land.id,
        land_name: land.name,
        geometry: land.boundary // PostGIS geometry from boundary column
      }));

      // Use bulk fetch if we have a farmer_id and multiple lands
      if (farmerId && landGeometries.length > 1) {
        try {
          console.log(`📡 Using bulk fetch for farmer ${farmerId} with ${landGeometries.length} lands`);
          const bulkData = await this.fetchBulkForFarmer(farmerId, tenantId, landGeometries);
          
          // Create a map of land_id to land info
          const landMap = new Map(landsWithGeometry.map(l => [l.id, l]));
          
          // Process each NDVI response
          for (const ndviData of bulkData) {
            const land = landMap.get(ndviData.land_id);
            if (!land) continue;

            try {
              // Check cache unless force refresh
              if (!forceRefresh) {
                const isFresh = await this.isCacheFresh(land.id);
                if (isFresh) {
                  results.push({
                    success: true,
                    land_id: land.id,
                    land_name: land.name,
                    cached: true,
                  });
                  continue;
                }
              }

              // Save to database
              await this.saveToDatabase(land.id, tenantId, ndviData);

              results.push({
                success: true,
                land_id: land.id,
                land_name: land.name,
                cached: false,
                data: ndviData,
              });
            } catch (saveError) {
              console.error(`Failed to save NDVI for land ${land.id}:`, saveError);
              results.push({
                success: false,
                land_id: land.id,
                land_name: land.name,
                cached: false,
                error: saveError instanceof Error ? saveError.message : 'Failed to save data',
              });
            }
          }
          
          return results;
        } catch (bulkError) {
          console.warn('⚠️ Bulk fetch failed, falling back to individual requests:', bulkError);
          // Fall through to individual fetch logic
        }
      }

      // Fetch NDVI data individually with batching
      console.log('📡 Using individual fetch with batching');
      const batchSize = 5;
      for (let i = 0; i < landsWithGeometry.length; i += batchSize) {
        const batch = landsWithGeometry.slice(i, i + batchSize);
        const batchPromises = batch.map(land =>
          this.fetchNDVIForLand(
            land.id,
            land.name,
            land.tenant_id,
            land.boundary, // Send boundary geometry!
            land.farmer_id,
            forceRefresh
          )
        );

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      return results;
    } catch (error) {
      console.error('Error in fetchNDVIForLands:', error);
      throw error;
    }
  }

  /**
   * Get cached NDVI data for a tenant/farmer
   */
  async getCachedNDVIData(tenantId: string, farmerId?: string) {
    let query = supabase
      .from('ndvi_data')
      .select(`
        *,
        lands!inner(
          id,
          name,
          farmer_id,
          tenant_id
        )
      `)
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false });

    if (farmerId) {
      query = query.eq('lands.farmer_id', farmerId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch cached NDVI data: ${error.message}`);
    }

    return data || [];
  }
}

// Export singleton instance
export const ndviLandService = new NDVILandService();
