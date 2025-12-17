import { supabase } from '@/integrations/supabase/client';
import { API_CONFIG, getSoilApiUrl } from '@/config/api.config';
import { inputValidator, isValidUuid } from '@/services/security/InputValidationService';
import { withRetry, rateLimitService } from '@/services/security/RateLimitService';
import { secureLogger } from '@/services/security/SecureLogger';

// Use configurable API URL from environment
const SOIL_API_BASE = API_CONFIG.SOIL_API.BASE_URL;

export interface SoilHealthData {
  id: string;
  land_id: string;
  tenant_id: string;
  farmer_id: string | null;
  // pH and Organic Matter
  ph_level: number | null;
  ph_text: string | null;
  organic_carbon: number | null;
  organic_carbon_text: string | null;
  bulk_density: number | null;
  cec: number | null;
  // Texture components
  clay_percent: number | null;
  sand_percent: number | null;
  silt_percent: number | null;
  soil_type: string | null;
  texture: string | null;
  // NPK Levels (text classifications)
  nitrogen_level: string | null;
  phosphorus_level: string | null;
  potassium_level: string | null;
  nitrogen_text: string | null;
  phosphorus_text: string | null;
  potassium_text: string | null;
  // NPK per hectare
  nitrogen_kg_per_ha: number | null;
  phosphorus_kg_per_ha: number | null;
  potassium_kg_per_ha: number | null;
  // NPK estimated values
  nitrogen_est: number | null;
  phosphorus_est: number | null;
  potassium_est: number | null;
  // NPK total for field
  nitrogen_total_kg: number | null;
  phosphorus_total_kg: number | null;
  potassium_total_kg: number | null;
  // Field area
  field_area_ha: number | null;
  // Quality metrics
  data_quality_flags: any | null;
  data_quality_warnings: any | null;
  data_completeness: number | null;
  confidence_level: string | null;
  // Metadata
  fertility_class: string | null;
  source: string | null;
  test_date: string | null;
  test_report_url: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface LandWithSoil {
  id: string;
  name: string;
  area_acres: number;
  area_guntas: number | null;
  survey_number: string | null;
  farmer_id: string;
  tenant_id: string;
  // Location
  village: string | null;
  taluka: string | null;
  district: string | null;
  state: string | null;
  // Summary soil data on land
  soil_ph: number | null;
  organic_carbon_percent: number | null;
  nitrogen_kg_per_ha: number | null;
  phosphorus_kg_per_ha: number | null;
  potassium_kg_per_ha: number | null;
  last_soil_test_date: string | null;
  soil_type: string | null;
  // Crop info
  current_crop: string | null;
  crop_stage: string | null;
  last_sowing_date: string | null;
  expected_harvest_date: string | null;
  // Nested detailed soil health data
  soil_health?: SoilHealthData[];
  // Farmer info (joined)
  farmer?: {
    farmer_name: string | null;
    farmer_code: string | null;
    mobile_number: string | null;
  };
}

class SoilAnalysisService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = SOIL_API_BASE;
  }

  /**
   * Check API health status
   */
  async checkHealth(): Promise<{ status: string; message?: string }> {
    try {
      return await withRetry('soil:health', async () => {
        const response = await fetch(`${this.baseUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Health check failed: ${response.status}`);
        }

        return await response.json();
      });
    } catch (error) {
      secureLogger.error('Health check error', { error });
      return { status: 'offline', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Fetch and save soil data for a single land
   * Uses boundary_polygon_old from the API
   */
  async fetchAndSaveSoilData(landId: string, tenantId: string): Promise<any> {
    // Validate inputs
    if (!isValidUuid(landId) || !isValidUuid(tenantId)) {
      throw new Error('Invalid land ID or tenant ID format');
    }

    try {
      return await withRetry('soil:save', async () => {
        const response = await fetch(`${this.baseUrl}/soil/save?tenant_id=${encodeURIComponent(tenantId)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_id: tenantId,
            land_ids: [landId]
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch and save soil data');
        }

        return await response.json();
      });
    } catch (error) {
      secureLogger.error('Error fetching soil data', { landId, error });
      throw error;
    }
  }

  /**
   * Batch fetch and save soil data for multiple lands
   */
  async batchFetchAndSaveSoilData(landIds: string[], tenantId: string): Promise<any> {
    // Validate inputs
    if (!isValidUuid(tenantId)) {
      throw new Error('Invalid tenant ID format');
    }
    
    const invalidIds = landIds.filter(id => !isValidUuid(id));
    if (invalidIds.length > 0) {
      throw new Error(`Invalid land ID format: ${invalidIds.join(', ')}`);
    }

    try {
      return await withRetry('soil:batch', async () => {
        const response = await fetch(`${this.baseUrl}/soil/save?tenant_id=${encodeURIComponent(tenantId)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_id: tenantId,
            land_ids: landIds
          })
        });

        if (!response.ok) {
          throw new Error('Failed to batch fetch soil data');
        }

        return await response.json();
      });
    } catch (error) {
      secureLogger.error('Error batch fetching soil data', { landIds, error });
      throw error;
    }
  }

  /**
   * Get all lands with soil health data for a tenant
   */
  async getLandsWithSoilData(tenantId: string): Promise<LandWithSoil[]> {
    try {
      const { data, error } = await supabase
        .from('lands')
        .select(`
          id,
          name,
          area_acres,
          area_guntas,
          survey_number,
          farmer_id,
          tenant_id,
          village,
          taluka,
          district,
          state,
          soil_ph,
          soil_type,
          organic_carbon_percent,
          nitrogen_kg_per_ha,
          phosphorus_kg_per_ha,
          potassium_kg_per_ha,
          last_soil_test_date,
          current_crop,
          crop_stage,
          last_sowing_date,
          expected_harvest_date,
          farmers!inner (
            farmer_name,
            farmer_code,
            mobile_number
          ),
          soil_health (
            id,
            land_id,
            tenant_id,
            farmer_id,
            ph_level,
            ph_text,
            organic_carbon,
            organic_carbon_text,
            bulk_density,
            cec,
            clay_percent,
            sand_percent,
            silt_percent,
            soil_type,
            texture,
            nitrogen_level,
            phosphorus_level,
            potassium_level,
            nitrogen_text,
            phosphorus_text,
            potassium_text,
            nitrogen_kg_per_ha,
            phosphorus_kg_per_ha,
            potassium_kg_per_ha,
            nitrogen_est,
            phosphorus_est,
            potassium_est,
            nitrogen_total_kg,
            phosphorus_total_kg,
            potassium_total_kg,
            field_area_ha,
            data_quality_flags,
            data_quality_warnings,
            data_completeness,
            confidence_level,
            fertility_class,
            source,
            test_date,
            test_report_url,
            note,
            created_at,
            updated_at
          )
        `)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      return (data || []).map(land => ({
        ...land,
        farmer: Array.isArray(land.farmers) && land.farmers.length > 0 
          ? land.farmers[0] 
          : land.farmers
      })) as unknown as LandWithSoil[];
    } catch (error) {
      console.error('Error fetching lands with soil data:', error);
      throw error;
    }
  }

  /**
   * Get soil health history for a specific land
   */
  async getSoilHealthHistory(landId: string): Promise<SoilHealthData[]> {
    try {
      const { data, error } = await supabase
        .from('soil_health')
        .select('*')
        .eq('land_id', landId)
        .order('test_date', { ascending: false });

      if (error) throw error;

      return data as SoilHealthData[];
    } catch (error) {
      console.error('Error fetching soil health history:', error);
      throw error;
    }
  }
}

export const soilAnalysisService = new SoilAnalysisService();
