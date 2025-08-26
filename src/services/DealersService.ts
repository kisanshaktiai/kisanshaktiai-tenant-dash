
import { BaseApiService } from './core/BaseApiService';
import { supabase } from '@/integrations/supabase/client';

export interface DealersListOptions {
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface Dealer {
  id: string;
  tenant_id: string;
  dealer_code: string;
  business_name: string;
  contact_person: string;
  phone: string;
  email: string;
  is_active: boolean;
  verification_status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDealerData {
  tenant_id: string;
  dealer_code: string;
  business_name: string;
  contact_person: string;
  phone: string;
  email: string;
  verification_status?: string;
  is_active?: boolean;
}

export interface UpdateDealerData {
  business_name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  verification_status?: string;
  is_active?: boolean;
}

export interface DealersListResponse {
  data: Dealer[];
  count: number;
  error?: string;
}

class DealersService extends BaseApiService {
  protected basePath = '/dealers';

  async getDealers(tenantId: string, options: DealersListOptions = {}): Promise<DealersListResponse> {
    try {
      let query = supabase
        .from('dealers')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId);

      if (options.search) {
        query = query.or(`dealer_code.ilike.%${options.search}%,business_name.ilike.%${options.search}%,contact_person.ilike.%${options.search}%`);
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
      throw new Error(`Failed to fetch dealers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDealer(dealerId: string, tenantId: string): Promise<Dealer> {
    try {
      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .eq('id', dealerId)
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to fetch dealer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createDealer(dealerData: CreateDealerData): Promise<Dealer> {
    try {
      const { data, error } = await supabase
        .from('dealers')
        .insert({
          ...dealerData,
          id: crypto.randomUUID(),
          verification_status: dealerData.verification_status || 'pending',
          is_active: dealerData.is_active ?? true,
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
      throw new Error(`Failed to create dealer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateDealer(dealerId: string, tenantId: string, updates: UpdateDealerData): Promise<Dealer> {
    try {
      const { data, error } = await supabase
        .from('dealers')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', dealerId)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to update dealer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteDealer(dealerId: string, tenantId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('dealers')
        .delete()
        .eq('id', dealerId)
        .eq('tenant_id', tenantId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error(`Failed to delete dealer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDealerCount(tenantId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('dealers')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      if (error) {
        throw new Error(error.message);
      }

      return count || 0;
    } catch (error) {
      throw new Error(`Failed to get dealer count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateDealerCode(tenantSlug: string, count: number): Promise<string> {
    const dealerNumber = count + 1;
    const tenantPrefix = tenantSlug.substring(0, 3).toUpperCase();
    return `${tenantPrefix}D${dealerNumber.toString().padStart(5, '0')}`;
  }
}

export const dealersService = new DealersService();
