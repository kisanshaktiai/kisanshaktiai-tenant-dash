import { supabase } from '@/integrations/supabase/client';

const SOIL_API_BASE = 'https://kisanshakti-api.onrender.com';

export interface SoilHealthData {
  id: string;
  land_id: string;
  tenant_id: string;
  ph_level: number | null;
  organic_carbon: number | null;
  bulk_density: number | null;
  nitrogen_level: string | null;
  phosphorus_level: string | null;
  potassium_level: string | null;
  soil_type: string | null;
  texture: string | null;
  source: string | null;
  test_date: string | null;
  test_report_url: string | null;
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
  last_soil_test_date: string | null;
  farmer?: {
    full_name: string;
  };
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
   * Fetch and save soil data for a specific land
   */
  async fetchAndSaveSoilData(landId: string, tenantId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/soil/save?land_id=${landId}&tenant_id=${tenantId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
          last_soil_test_date,
          farmer:farmers (
            full_name
          ),
          soil_health (
            id,
            land_id,
            tenant_id,
            ph_level,
            organic_carbon,
            bulk_density,
            nitrogen_level,
            phosphorus_level,
            potassium_level,
            soil_type,
            texture,
            source,
            test_date,
            test_report_url,
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

  /**
   * Batch update soil data for multiple lands
   */
  async batchUpdateSoilData(
    landIds: string[],
    tenantId: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ success: number; failed: number; errors: any[] }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (let i = 0; i < landIds.length; i++) {
      try {
        await this.fetchAndSaveSoilData(landIds[i], tenantId);
        results.success++;
        if (onProgress) onProgress(i + 1, landIds.length);
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        results.failed++;
        results.errors.push({ landId: landIds[i], error });
      }
    }

    return results;
  }
}

export const soilAnalysisService = new SoilAnalysisService();
