
import { BaseApiService } from './core/BaseApiService';
import { supabase } from '@/integrations/supabase/client';

export interface FarmersListOptions {
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface Farmer {
  id: string;
  tenant_id: string;
  farmer_code: string | null;
  farmer_name: string | null;
  mobile_number: string | null;
  location: string | null;
  farming_experience_years: number | null;
  total_land_acres: number | null;
  primary_crops: string[] | null;
  farm_type: string | null;
  has_irrigation: boolean | null;
  has_storage: boolean | null;
  has_tractor: boolean | null;
  irrigation_type: string | null;
  is_verified: boolean | null;
  is_active: boolean | null;
  total_app_opens: number | null;
  total_queries: number | null;
  annual_income_range: string | null;
  language_preference: string | null;
  last_app_open: string | null;
  last_login_at: string | null;
  app_install_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  metadata: any | null;
}

export interface CreateFarmerData {
  tenant_id: string;
  farmer_code?: string;
  farmer_name?: string;
  mobile_number?: string;
  location?: string;
  farming_experience_years?: number;
  total_land_acres?: number;
  primary_crops?: string[];
  farm_type?: string;
  has_irrigation?: boolean;
  has_storage?: boolean;
  has_tractor?: boolean;
  irrigation_type?: string | null;
  is_verified?: boolean;
  annual_income_range?: string;
  language_preference?: string;
}

export interface UpdateFarmerData {
  farmer_name?: string;
  mobile_number?: string;
  location?: string;
  farming_experience_years?: number;
  total_land_acres?: number;
  primary_crops?: string[];
  farm_type?: string;
  has_irrigation?: boolean;
  has_storage?: boolean;
  has_tractor?: boolean;
  irrigation_type?: string | null;
  is_verified?: boolean;
  annual_income_range?: string;
  language_preference?: string;
}

export interface FarmersListResponse {
  data: Farmer[];
  count: number;
  error?: string;
}

class FarmersService extends BaseApiService {
  protected basePath = '/farmers';

  async getFarmers(tenantId: string, options: FarmersListOptions = {}): Promise<FarmersListResponse> {
    try {
      let query = supabase
        .from('farmers')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId);

      if (options.search) {
        query = query.or(`farmer_code.ilike.%${options.search}%,farmer_name.ilike.%${options.search}%,mobile_number.ilike.%${options.search}%,location.ilike.%${options.search}%`);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return {
        data: data || [],
        count: count || 0,
      };
    } catch (error) {
      throw new Error(`Failed to fetch farmers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getFarmer(farmerId: string, tenantId: string): Promise<Farmer> {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('id', farmerId)
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to fetch farmer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createFarmer(farmerData: CreateFarmerData): Promise<Farmer> {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .insert({
          ...farmerData,
          id: crypto.randomUUID(),
          total_app_opens: 0,
          total_queries: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to create farmer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateFarmer(farmerId: string, tenantId: string, updates: UpdateFarmerData): Promise<Farmer> {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', farmerId)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to update farmer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteFarmer(farmerId: string, tenantId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('farmers')
        .delete()
        .eq('id', farmerId)
        .eq('tenant_id', tenantId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error(`Failed to delete farmer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getFarmerCount(tenantId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('farmers')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      if (error) {
        throw new Error(error.message);
      }

      return count || 0;
    } catch (error) {
      throw new Error(`Failed to get farmer count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateFarmerCode(tenantSlug: string, count: number): Promise<string> {
    const farmerNumber = count + 1;
    const tenantPrefix = tenantSlug.substring(0, 3).toUpperCase();
    return `${tenantPrefix}${farmerNumber.toString().padStart(6, '0')}`;
  }
}

export const farmersService = new FarmersService();
