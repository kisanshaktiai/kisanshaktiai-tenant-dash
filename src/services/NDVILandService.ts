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
   * Fetch NDVI data from API for a single land
   */
  private async fetchFromAPI(landId: string): Promise<NDVIApiResponse> {
    try {
      const response = await fetch(`${NDVI_API_BASE_URL}/lands/${landId}/ndvi`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`NDVI API error for land ${landId}:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch NDVI for land ${landId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch NDVI data for all lands of a farmer in bulk (optimized)
   */
  private async fetchBulkForFarmer(farmerId: string): Promise<NDVIApiResponse[]> {
    try {
      const response = await fetch(`${NDVI_API_BASE_URL}/farmers/${farmerId}/ndvi`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`NDVI bulk API error for farmer ${farmerId}:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Bulk API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
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
    forceRefresh: boolean = false
  ): Promise<FetchNDVIResult> {
    try {
      // Check cache unless force refresh
      if (!forceRefresh) {
        const isFresh = await this.isCacheFresh(landId);
        if (isFresh) {
          return {
            success: true,
            land_id: landId,
            land_name: landName,
            cached: true,
          };
        }
      }

      // Fetch from API
      const ndviData = await this.fetchFromAPI(landId);

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
      // Get all active lands for the tenant/farmer
      let query = supabase
        .from('lands')
        .select('id, name, tenant_id, farmer_id')
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
        return [];
      }

      const results: FetchNDVIResult[] = [];

      // Use bulk fetch if we have a farmer_id and multiple lands
      if (farmerId && lands.length > 1) {
        try {
          console.log(`Using bulk fetch for farmer ${farmerId} with ${lands.length} lands`);
          const bulkData = await this.fetchBulkForFarmer(farmerId);
          
          // Create a map of land_id to land info
          const landMap = new Map(lands.map(l => [l.id, l]));
          
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
          console.warn('Bulk fetch failed, falling back to individual requests:', bulkError);
          // Fall through to individual fetch logic
        }
      }

      // Fetch NDVI data individually with batching
      const batchSize = 5;
      for (let i = 0; i < lands.length; i += batchSize) {
        const batch = lands.slice(i, i + batchSize);
        const batchPromises = batch.map(land =>
          this.fetchNDVIForLand(
            land.id,
            land.name,
            land.tenant_id,
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
