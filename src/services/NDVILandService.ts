/**
 * Service for fetching NDVI data from Render API
 * Base URL: https://ndvi-land-api.onrender.com
 */

import { supabase } from '@/integrations/supabase/client';
import { renderNDVIService } from './RenderNDVIService';
import { globalErrorHandler } from './GlobalErrorHandler';

const NDVI_API_BASE_URL = 'https://ndvi-land-api.onrender.com';
const CACHE_DURATION_DAYS = 7;

export interface LandGeometry {
  land_id: string;
  land_name: string;
  geometry: any; // GeoJSON geometry
}

/**
 * Helper function to get land geometry from either boundary column
 */
function getLandGeometry(land: any): any {
  if (land.boundary) return land.boundary;
  if (land.boundary_polygon_old) {
    return typeof land.boundary_polygon_old === 'string' 
      ? JSON.parse(land.boundary_polygon_old) 
      : land.boundary_polygon_old;
  }
  return null;
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

// API v3.6: Simplified payload - only tenant_id and land_ids
export interface NDVIRequestPayload {
  tenant_id: string;
  land_ids?: string[]; // Optional - API fetches all tenant lands if omitted
}

export interface TileLandGroup {
  tile_id: string;
  land_ids: string[];
  land_names: string[];
}

// API v3.6: Response structure from POST /requests
export interface NDVIRequestResponse {
  request_id: string;
  tenant_id: string;
  tile_id: string;
  acquisition_date: string;
  status: string;
  land_count: number;
  timestamp: string;
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
   * Create an NDVI processing request via POST /requests
   * API v3.6: Auto-fetches latest tile, no date filtering needed
   */
  async createNDVIRequest(payload: NDVIRequestPayload): Promise<NDVIRequestResponse> {
    try {
      console.log('📡 Creating NDVI request (API v3.6):', payload);

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
      
      // Response structure from API v3.6:
      // {
      //   request_id: string,
      //   tenant_id: string,
      //   tile_id: string,
      //   acquisition_date: string,
      //   status: "queued",
      //   land_count: number,
      //   timestamp: string
      // }
      
      return data;
    } catch (error) {
      console.error('❌ Error creating NDVI request:', error);
      throw error;
    }
  }

  /**
   * Auto-sync tile mappings if empty
   */
  private async ensureTileMappings(landIds: string[]): Promise<void> {
    try {
      const { count } = await supabase
        .from('land_tile_mapping')
        .select('*', { count: 'exact', head: true })
        .in('land_id', landIds);

      if (!count || count === 0) {
        console.log('🔄 Auto-syncing tile mappings...');
        const { error } = await supabase.rpc('assign_mgrs_tile_to_land');
        
        if (error) {
          console.warn('⚠️ Auto-sync failed:', error.message);
        } else {
          console.log('✅ Tile mappings auto-synced successfully');
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to check/sync tile mappings:', error);
    }
  }

  /**
   * Get tile mappings for lands
   */
  private async getTileMappingsForLands(landIds: string[]): Promise<Map<string, TileLandGroup>> {
    // Auto-sync if needed
    await this.ensureTileMappings(landIds);

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
   * API v3.6: Simplified - API handles tile selection automatically
   */
  async fetchNDVIForLands(
    tenantId: string,
    farmerId?: string,
    forceRefresh: boolean = false
  ): Promise<FetchNDVIResult[]> {
    try {
      console.log('🔍 Starting NDVI fetch (API v3.6):', {
        tenant_id: tenantId,
        farmer_id: farmerId || 'all',
        force_refresh: forceRefresh
      });

      // Step 1: Fetch active lands (check both boundary columns)
      let query = supabase
        .from('lands')
        .select('id, name, tenant_id, farmer_id, boundary, boundary_polygon_old')
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
        throw new Error(
          farmerId 
            ? `No lands found for farmer. Please add land parcels.`
            : `No lands found. Please add land parcels in the Farmers section.`
        );
      }

      console.log(`✅ Found ${lands.length} land(s)`);

      // Step 2: Filter lands with boundary data (check both columns)
      const landsWithGeometry = lands.filter(land => {
        const hasGeometry = getLandGeometry(land) !== null;
        if (!hasGeometry) {
          console.warn(`⚠️ Land ${land.name} skipped (no boundary data in either column)`);
        }
        return hasGeometry;
      });
      
      const landsWithoutBoundary = lands.filter(land => getLandGeometry(land) === null);
      
      if (landsWithoutBoundary.length > 0) {
        const landNames = landsWithoutBoundary.map(l => l.name).join(', ');
        console.warn(`⚠️ ${landsWithoutBoundary.length} land(s) skipped (no boundary data): ${landNames}`);
      }
      
      if (landsWithGeometry.length === 0) {
        throw new Error(
          `❌ Cannot process NDVI: All ${lands.length} land(s) are missing GPS boundary data.\n\n` +
          `Please add boundary coordinates for: ${lands.map(l => l.name).join(', ')}\n\n` +
          `Tip: Edit each land in the Farmers section and draw boundaries on the map.`
        );
      }

      // Step 3: Get tile mappings for lands
      const landIds = landsWithGeometry.map(l => l.id);
      const tileGroups = await this.getTileMappingsForLands(landIds);
      
      if (tileGroups.size === 0) {
        globalErrorHandler.handleError(
          new Error('Tile mapping missing'),
          { 
            component: 'NDVILandService',
            metadata: { 
              action: 'fetchNDVIForLands',
              landCount: landsWithGeometry.length 
            }
          },
          { showToast: true, severity: 'high' }
        );
        throw new Error(
          `❌ Cannot determine satellite tiles for your lands.\n\n` +
          `This usually happens when:\n` +
          `1. Land boundaries haven't been properly saved\n` +
          `2. Tile database needs to be synced\n\n` +
          `Solution: Contact support or try re-drawing land boundaries.`
        );
      }

      console.log(`📡 Found ${tileGroups.size} tile group(s) for ${landIds.length} land(s)`);

      const allResults: FetchNDVIResult[] = [];

      // Process each tile group separately
      for (const [tileId, group] of tileGroups.entries()) {
        console.log(`📡 Creating NDVI request for ${group.land_ids.length} land(s) with tile ${tileId}`);
        
        // API v3.9 payload structure
        const requestPayload = {
          tenant_id: tenantId,
          land_ids: group.land_ids,
          tile_id: tileId,
        };

        // Call Render NDVI API
        const response = await renderNDVIService.createRequest(requestPayload);
        
        console.log(`✅ NDVI request created via Render API:`, {
          tenant_id: tenantId,
          land_ids: group.land_ids,
          tile_id: tileId,
          status: 'queued'
        });

        // Step 4: Insert queue record in Supabase (for tracking in frontend)
        const queueRecord = {
          tenant_id: tenantId,
          land_ids: group.land_ids,
          tile_id: tileId,
          status: 'queued' as const,
          batch_size: group.land_ids.length,
          farmer_id: farmerId,
          metadata: {
            created_via: 'ndvi_service_v3.9',
            land_count: group.land_ids.length,
            api_version: '3.9',
            land_names: group.land_names
          }
        };

        const { error: queueError } = await supabase
          .from('ndvi_request_queue')
          .insert([queueRecord]);

        if (queueError) {
          console.warn('⚠️ Failed to insert queue tracking record:', queueError.message);
          // Don't throw - API request was successful
        } else {
          console.log(`✅ Queue tracking record created in Supabase for tile ${tileId}`);
        }

        // Add results for this tile group
        const groupResults: FetchNDVIResult[] = group.land_ids.map((landId, idx) => ({
          success: true,
          land_id: landId,
          land_name: group.land_names[idx],
          cached: false,
          data: {
            tile_id: tileId,
            request_id: 'queued',
            acquisition_date: new Date().toISOString().split('T')[0],
            status: 'queued',
          }
        }));

        allResults.push(...groupResults);
      }

      console.log(`📊 NDVI fetch summary: ${allResults.length} land(s) queued across ${tileGroups.size} tile(s)`);

      return allResults;

    } catch (error: any) {
      console.error('❌ Error in fetchNDVIForLands:', error);
      
      // Use global error handler for better error tracking
      globalErrorHandler.handleError(
        error,
        {
          component: 'NDVILandService',
          metadata: { 
            action: 'fetchNDVIForLands',
            tenantId, 
            farmerId 
          }
        },
        { showToast: false, severity: 'high' }
      );
      
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
