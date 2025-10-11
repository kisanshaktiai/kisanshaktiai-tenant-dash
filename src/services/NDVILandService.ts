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

export interface NDVIRequestPayload {
  land_ids: string[];
  tile_id: string; // REQUIRED by API
  date_from: string; // REQUIRED by API
  date_to: string; // REQUIRED by API
  tenant_id: string;
  farmer_id?: string;
  cloud_coverage?: number;
  processing_priority?: 'low' | 'medium' | 'high';
}

export interface TileLandGroup {
  tile_id: string;
  land_ids: string[];
  land_names: string[];
}

export interface NDVIRequestResponse {
  request_id: string;
  status: string;
  land_count: number;
  estimated_completion: string;
}

export class NDVILandService {
  /**
   * Convert string priority to integer for database storage
   */
  private priorityToInt(priority: string): number {
    const map: Record<string, number> = {
      'low': 1,
      'medium': 5,
      'high': 10
    };
    return map[priority] || 5;
  }

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
   * Create an NDVI processing request via the /requests API endpoint
   * Automatically maps farmer_id to land_ids
   */
  async createNDVIRequest(payload: NDVIRequestPayload): Promise<NDVIRequestResponse> {
    try {
      console.log('📡 Creating NDVI request:', payload);

      const response = await fetch(`${NDVI_API_BASE_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ NDVI request creation failed:', {
          status: response.status,
          error: errorText
        });
        throw new Error(`Failed to create NDVI request: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ NDVI request created:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating NDVI request:', error);
      throw error;
    }
  }

  /**
   * Get tile mappings for lands
   */
  private async getTileMappingsForLands(landIds: string[]): Promise<Map<string, TileLandGroup>> {
    const { data: tileMappings, error } = await supabase
      .from('land_tile_mapping')
      .select(`
        land_id,
        mgrs_tile_id,
        tile_id,
        lands!inner(id, name)
      `)
      .in('land_id', landIds);

    if (error) {
      console.warn('⚠️ No tile mappings found, will attempt to get tiles from Supabase function');
      // Fallback: try to get tiles via RPC
      return await this.getTilesViaFunction(landIds);
    }

    // Group lands by tile
    const tileGroups = new Map<string, TileLandGroup>();
    
    tileMappings?.forEach((mapping: any) => {
      const tileId = mapping.tile_id; // Use short MGRS code like '43QCU'
      if (!tileId || tileId.length < 5) {
        console.warn(`⚠️ Invalid tile_id for land ${mapping.land_id}`);
        return;
      }
      
      if (!tileGroups.has(tileId)) {
        tileGroups.set(tileId, {
          tile_id: tileId,
          land_ids: [],
          land_names: []
        });
      }
      
      const group = tileGroups.get(tileId)!;
      group.land_ids.push(mapping.land_id);
      group.land_names.push(mapping.lands.name);
    });

    return tileGroups;
  }

  /**
   * Fallback method to get tiles via Supabase function
   */
  private async getTilesViaFunction(landIds: string[]): Promise<Map<string, TileLandGroup>> {
    try {
      const { data: lands } = await supabase
        .from('lands')
        .select('id, name')
        .in('id', landIds);

      // Try to get all available tiles for the tenant
      const response = await supabase.rpc('get_tiles_with_lands');
      
      if (response.error) throw response.error;

      const tileGroups = new Map<string, TileLandGroup>();
      
      // For now, assign all lands to a default tile if we can't determine tiles
      // This is a fallback - ideally tiles should be properly mapped
      if (!response.data || response.data.length === 0) {
        console.warn('⚠️ No tiles found via function, using fallback approach');
        return tileGroups;
      }

      // Use the first available tile as fallback
      const defaultTile = response.data[0]?.tile_id;
      if (defaultTile && lands) {
        tileGroups.set(defaultTile, {
          tile_id: defaultTile,
          land_ids: lands.map(l => l.id),
          land_names: lands.map(l => l.name)
        });
      }

      return tileGroups;
    } catch (error) {
      console.error('❌ Failed to get tiles via function:', error);
      return new Map();
    }
  }

  /**
   * Fetch NDVI data for all lands under a tenant and farmer
   * Uses the /requests API endpoint for batch processing
   * Groups lands by tile and creates separate requests per tile
   */
  async fetchNDVIForLands(
    tenantId: string,
    farmerId?: string,
    forceRefresh: boolean = false
  ): Promise<FetchNDVIResult[]> {
    try {
      console.log('🔍 Starting NDVI fetch for lands:', {
        tenant_id: tenantId,
        farmer_id: farmerId || 'all',
        force_refresh: forceRefresh
      });

      // Step 1: Fetch all active lands with boundaries from Supabase lands table
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
        const message = farmerId 
          ? `No lands found for farmer. Please add land parcels for this farmer.`
          : `No lands found for your organization. Please add land parcels in the Farmers section.`;
        
        throw new Error(message);
      }

      console.log(`✅ Found ${lands.length} land(s) for ${farmerId ? 'farmer' : 'tenant'}`);

      // Step 2: Filter lands with boundary data
      const landsWithGeometry = lands.filter(land => land.boundary);
      
      if (landsWithGeometry.length === 0) {
        throw new Error('None of your lands have boundary data. Please add GPS coordinates or boundary polygons to your land parcels before fetching NDVI data.');
      }

      if (landsWithGeometry.length < lands.length) {
        const missingCount = lands.length - landsWithGeometry.length;
        console.warn(`⚠️ ${missingCount} land(s) missing boundary data - they will be skipped`);
      }

      // Step 3: Get tile mappings for lands
      const landIds = landsWithGeometry.map(l => l.id);
      const tileGroups = await this.getTileMappingsForLands(landIds);

      if (tileGroups.size === 0) {
        throw new Error('Unable to determine satellite tiles for your lands. Please contact support to set up tile mappings.');
      }

      console.log(`📍 Found ${tileGroups.size} tile(s) covering the selected lands`);

      // Step 4: Set date range (last 30 days by default)
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
      const dateTo = today.toISOString().split('T')[0];

      // Step 5: Create NDVI requests for each tile group
      const allResults: FetchNDVIResult[] = [];
      const requestPromises: Promise<any>[] = [];

      for (const [tileId, group] of tileGroups.entries()) {
        console.log(`📡 Creating NDVI request for tile ${tileId} with ${group.land_ids.length} land(s)`);
        
        const requestPayload: NDVIRequestPayload = {
          land_ids: group.land_ids,
          tile_id: tileId,
          date_from: dateFrom,
          date_to: dateTo,
          tenant_id: tenantId,
          farmer_id: farmerId,
          cloud_coverage: 20,
          processing_priority: 'medium',
        };

        requestPromises.push(
          this.createNDVIRequest(requestPayload)
            .then(async response => {
              // Insert queue record immediately after successful API call
              // Generate client-side UUID to avoid conflicts
              const queueRecord = {
                // Don't specify id - let Supabase generate it via gen_random_uuid()
                tenant_id: tenantId,
                land_ids: group.land_ids,
                tile_id: tileId,
                date_from: dateFrom,
                date_to: dateTo,
                cloud_coverage: 20,
                priority: this.priorityToInt('medium'),
                status: 'queued' as const,
                farmer_id: farmerId,
                metadata: {
                  render_request_id: response.request_id, // Store Render API's request_id here
                  estimated_completion: response.estimated_completion,
                  land_count: response.land_count,
                  created_via: 'ndvi_service'
                }
              };

              const { error: queueError } = await supabase
                .from('ndvi_request_queue')
                .insert(queueRecord);

              if (queueError) {
                console.error('❌ Failed to insert queue record:', queueError);
                throw new Error(`Queue insertion failed: ${queueError.message}`);
              }

              console.log(`✅ Queue record created for render request_id: ${response.request_id}`);

              return {
                success: true,
                tile_id: tileId,
                group,
                response
              };
            })
            .catch(error => ({
              success: false,
              tile_id: tileId,
              group,
              error: error.message
            }))
        );
      }

      // Wait for all requests to complete
      const requestResults = await Promise.all(requestPromises);

      // Process results
      for (const result of requestResults) {
        if (result.success) {
          console.log(`✅ NDVI request created for tile ${result.tile_id}:`, {
            request_id: result.response.request_id,
            land_count: result.group.land_ids.length,
            status: result.response.status
          });

          // Add success results for all lands in this tile
          result.group.land_ids.forEach((landId, idx) => {
            allResults.push({
              success: true,
              land_id: landId,
              land_name: result.group.land_names[idx],
              cached: false,
              data: {
                tile_id: result.tile_id,
                request_id: result.response.request_id,
                status: result.response.status,
                date_from: dateFrom,
                date_to: dateTo
              }
            });
          });
        } else {
          console.error(`❌ Failed to create NDVI request for tile ${result.tile_id}:`, result.error);
          
          // Add failure results for all lands in this tile
          result.group.land_ids.forEach((landId, idx) => {
            allResults.push({
              success: false,
              land_id: landId,
              land_name: result.group.land_names[idx],
              cached: false,
              error: result.error
            });
          });
        }
      }

      const successCount = allResults.filter(r => r.success).length;
      const failCount = allResults.filter(r => !r.success).length;
      
      console.log(`📊 NDVI fetch summary: ${successCount} successful, ${failCount} failed`);

      return allResults;

    } catch (error) {
      console.error('❌ Error in fetchNDVIForLands:', error);
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
