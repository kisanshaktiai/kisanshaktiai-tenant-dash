
import { BaseApiService, FilterOptions, PaginationOptions, SortOptions } from './core/BaseApiService';
import { supabase } from '@/integrations/supabase/client';

export interface Farmer {
  id: string;
  tenant_id: string;
  farmer_code: string;
  farming_experience_years: number;
  total_land_acres: number;
  primary_crops: string[];
  farm_type: string;
  has_irrigation: boolean;
  has_storage: boolean;
  has_tractor: boolean;
  irrigation_type: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  total_app_opens?: number;
  total_queries?: number;
  last_app_open?: string;
}

export interface CreateFarmerData {
  tenant_id: string;
  farmer_code: string;
  farming_experience_years: number;
  total_land_acres: number;
  primary_crops: string[];
  farm_type: string;
  has_irrigation: boolean;
  has_storage: boolean;
  has_tractor: boolean;
  irrigation_type?: string | null;
  is_verified?: boolean;
}

export interface UpdateFarmerData extends Partial<CreateFarmerData> {
  updated_at?: string;
}

export interface FarmersListOptions extends PaginationOptions {
  filters?: FilterOptions;
  sort?: SortOptions;
  search?: string;
}

class FarmersService extends BaseApiService {
  async getFarmers(tenantId: string, options: FarmersListOptions = {}) {
    const { filters = {}, sort, search, ...paginationOptions } = options;
    
    let query = supabase
      .from('farmers')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId);

    // Apply search
    if (search) {
      query = query.or(`farmer_code.ilike.%${search}%,primary_crops.cs.{${search}}`);
    }

    // Apply filters
    query = this.buildFilters(query, filters);

    // Apply sorting
    if (sort) {
      query = this.applySorting(query, sort);
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = this.applyPagination(query, paginationOptions);

    return this.executeQuery(() => query);
  }

  async getFarmer(id: string, tenantId: string) {
    return this.executeQuery(() =>
      supabase
        .from('farmers')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single()
    );
  }

  async createFarmer(data: CreateFarmerData) {
    const farmerData = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return this.executeQuery(() =>
      supabase
        .from('farmers')
        .insert(farmerData)
        .select()
        .single()
    );
  }

  async updateFarmer(id: string, tenantId: string, data: UpdateFarmerData) {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    return this.executeQuery(() =>
      supabase
        .from('farmers')
        .update(updateData)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single()
    );
  }

  async deleteFarmer(id: string, tenantId: string) {
    return this.executeQuery(() =>
      supabase
        .from('farmers')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId)
    );
  }

  async getFarmerCount(tenantId: string, filters: FilterOptions = {}) {
    let query = supabase
      .from('farmers')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    query = this.buildFilters(query, filters);

    const { count, error } = await query;
    
    if (error) {
      throw this.handleError(error);
    }
    
    return count || 0;
  }

  async generateFarmerCode(tenantSlug: string, existingCount: number) {
    const farmerNumber = existingCount + 1;
    const tenantPrefix = tenantSlug.substring(0, 3).toUpperCase();
    return `${tenantPrefix}${farmerNumber.toString().padStart(6, '0')}`;
  }
}

export const farmersService = new FarmersService();
