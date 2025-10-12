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

      // Step 1: Fetch active lands
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
        throw new Error(
          farmerId 
            ? `No lands found for farmer. Please add land parcels.`
            : `No lands found. Please add land parcels in the Farmers section.`
        );
      }

      console.log(`✅ Found ${lands.length} land(s)`);

      // Step 2: Filter lands with boundary data
      const landsWithGeometry = lands.filter(land => land.boundary);
      
      if (landsWithGeometry.length === 0) {
        throw new Error('None of your lands have boundary data. Please add GPS coordinates.');
      }

      // Step 3: Create simplified NDVI request (API handles tiles automatically)
      const landIds = landsWithGeometry.map(l => l.id);
      
      console.log(`📡 Creating NDVI request for ${landIds.length} land(s)`);
      
      // SIMPLIFIED PAYLOAD - API v3.6 handles everything else
      const requestPayload: NDVIRequestPayload = {
        tenant_id: tenantId,
        land_ids: landIds,
      };

      const response = await this.createNDVIRequest(requestPayload);
      
      console.log(`✅ NDVI request created:`, {
        request_id: response.request_id,
        tile_id: response.tile_id,
        acquisition_date: response.acquisition_date,
        land_count: response.land_count,
        status: response.status
      });

    // Step 4: Insert queue record in Supabase (for tracking only)
    // Note: date_from/date_to are legacy fields - using today's date as placeholder
    const today = new Date().toISOString().split('T')[0];
    const queueRecord = {
      tenant_id: tenantId,
      land_ids: landIds,
      tile_id: response.tile_id,
      status: 'queued' as const,
      batch_size: landIds.length,
      farmer_id: farmerId,
      date_from: today,
      date_to: today,
      metadata: {
        render_request_id: response.request_id,
        acquisition_date: response.acquisition_date,
        land_count: response.land_count,
        created_via: 'ndvi_service_v3.6'
      }
    };

      const { error: queueError } = await supabase
        .from('ndvi_request_queue')
        .insert([queueRecord]);

      if (queueError) {
        console.error('❌ Failed to insert queue record:', queueError);
        throw new Error(`Queue insertion failed: ${queueError.message}`);
      }

      console.log(`✅ Queue record created for request: ${response.request_id}`);

      // Return success results
      const results: FetchNDVIResult[] = landsWithGeometry.map(land => ({
        success: true,
        land_id: land.id,
        land_name: land.name,
        cached: false,
        data: {
          tile_id: response.tile_id,
          request_id: response.request_id,
          acquisition_date: response.acquisition_date,
          status: response.status,
        }
      }));

      console.log(`📊 NDVI fetch summary: ${results.length} land(s) queued`);

      return results;

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
