import { supabase } from '@/integrations/supabase/client';

const SOIL_API_BASE = 'https://kisanshakti-api.onrender.com';

export interface SoilHealthData {
  id: string;
  land_id: string;
  tenant_id: string;
  farmer_id: string | null;
  ph_level: number | null;
  organic_carbon: number | null;
  bulk_density: number | null;
  nitrogen_level: string | null;
  phosphorus_level: string | null;
  potassium_level: string | null;
  // NPK per hectare
  nitrogen_kg_per_ha: number | null;
  phosphorus_kg_per_ha: number | null;
  potassium_kg_per_ha: number | null;
  // NPK total for field
  nitrogen_total_kg: number | null;
  phosphorus_total_kg: number | null;
  potassium_total_kg: number | null;
  // Texture components
  clay_percent: number | null;
  sand_percent: number | null;
  silt_percent: number | null;
  cec: number | null;
  // Quality metrics
  data_quality_flags: any | null;
  data_quality_warnings: any | null;
  data_completeness: number | null;
  confidence_level: string | null;
  // Additional
  soil_type: string | null;
  texture: string | null;
  source: string | null;
  test_date: string | null;
  test_report_url: string | null;
  fertility_class: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface LandWithSoil {
  id: string;
  name: string;
  area_acres: number;
  farmer_id: string;
  tenant_id: string;
  village: string | null;
  soil_ph: number | null;
  organic_carbon_percent: number | null;
  nitrogen_kg_per_ha: number | null;
  phosphorus_kg_per_ha: number | null;
  potassium_kg_per_ha: number | null;
  last_soil_test_date: string | null;
  soil_health?: SoilHealthData[];
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
    } catch (error) {
      console.error('Health check error:', error);
      return { status: 'offline', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Fetch and save soil data for a single land
   * API expects: POST /soil/save?tenant_id=<UUID> with body {"land_ids": ["id1"]}
   */
  async fetchAndSaveSoilData(landId: string, tenantId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/soil/save?tenant_id=${tenantId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ land_ids: [landId] }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to fetch soil data: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching soil data:', error);
      throw error;
    }
  }

  /**
   * Batch fetch and save soil data for multiple lands
   * API expects: POST /soil/save?tenant_id=<UUID> with body {"land_ids": ["id1", "id2", ...]}
   */
  async batchFetchAndSaveSoilData(landIds: string[], tenantId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/soil/save?tenant_id=${tenantId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ land_ids: landIds }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to batch fetch soil data: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error batch fetching soil data:', error);
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
          farmer_id,
          tenant_id,
          village,
          soil_ph,
          organic_carbon_percent,
          nitrogen_kg_per_ha,
          phosphorus_kg_per_ha,
          potassium_kg_per_ha,
          last_soil_test_date,
          soil_health (
            id,
            land_id,
            tenant_id,
            farmer_id,
            ph_level,
            organic_carbon,
            bulk_density,
            nitrogen_level,
            phosphorus_level,
            potassium_level,
            nitrogen_kg_per_ha,
            phosphorus_kg_per_ha,
            potassium_kg_per_ha,
            nitrogen_total_kg,
            phosphorus_total_kg,
            potassium_total_kg,
            clay_percent,
            sand_percent,
            silt_percent,
            cec,
            data_quality_flags,
            data_quality_warnings,
            data_completeness,
            confidence_level,
            soil_type,
            texture,
            source,
            test_date,
            test_report_url,
            fertility_class,
            note,
            created_at,
            updated_at
          )
        `)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as unknown as LandWithSoil[];
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
