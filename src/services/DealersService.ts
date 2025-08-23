
import { BaseApiService } from './core/BaseApiService';
import { supabase } from '@/integrations/supabase/client';
import type { EnhancedDealer } from '@/types/dealer';

export interface DealersListOptions {
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface CreateDealerData {
  tenant_id: string;
  dealer_code: string;
  business_name: string;
  contact_person: string;
  email: string;
  phone: string;
  alternate_phone?: string;
  address: Record<string, any>;
  business_type?: string;
  registration_status?: string;
  onboarding_status?: string;
  kyc_status?: string;
  territory_id?: string;
  product_authorizations?: string[];
  commission_structure?: Record<string, any>;
  performance_metrics?: Record<string, any>;
  banking_details?: Record<string, any>;
  documents?: any[];
  notes?: string;
  is_active?: boolean;
}

export interface UpdateDealerData {
  business_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  alternate_phone?: string;
  address?: Record<string, any>;
  business_type?: string;
  registration_status?: string;
  onboarding_status?: string;
  kyc_status?: string;
  territory_id?: string;
  product_authorizations?: string[];
  commission_structure?: Record<string, any>;
  performance_metrics?: Record<string, any>;
  banking_details?: Record<string, any>;
  documents?: any[];
  notes?: string;
  is_active?: boolean;
}

class DealersService extends BaseApiService {
  async getDealers(tenantId: string, options: DealersListOptions = {}) {
    try {
      let query = supabase
        .from('dealers')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId);

      if (options.search) {
        query = query.or(`business_name.ilike.%${options.search}%,contact_person.ilike.%${options.search}%,dealer_code.ilike.%${options.search}%`);
      }

      if (options.filters?.is_active !== undefined) {
        query = query.eq('is_active', options.filters.is_active);
      }

      if (options.filters?.registration_status) {
        query = query.eq('registration_status', options.filters.registration_status);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const sortBy = options.sortBy || 'business_name';
      const sortOrder = options.sortOrder || 'asc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      // Transform basic dealer data to EnhancedDealer format
      // Map database columns to expected interface properties
      const enhancedDealers: EnhancedDealer[] = (data || []).map(dealer => ({
        ...dealer,
        // Map database columns to interface properties with fallbacks
        alternate_phone: dealer.secondary_phone || '', // Map secondary_phone to alternate_phone
        address: (dealer.business_address as Record<string, any>) || {},
        business_type: dealer.business_type || '',
        registration_status: dealer.registration_status || 'pending',
        onboarding_status: dealer.onboarding_date ? 'completed' : 'not_started', // Derive from onboarding_date
        kyc_status: dealer.kyc_status || 'pending',
        territory_id: Array.isArray(dealer.territory_ids) && dealer.territory_ids.length > 0 
          ? dealer.territory_ids[0] 
          : dealer.territory_ids || undefined, // Map territory_ids array to single territory_id
        product_authorizations: (dealer.product_authorizations as string[]) || [],
        commission_structure: { commission_rate: dealer.commission_rate || 0 }, // Create structure from commission_rate
        performance_metrics: {}, // Default empty object
        banking_details: (dealer.bank_details as Record<string, any>) || {},
        documents: [], // Default empty array
        notes: '', // Default empty string
        verified_at: dealer.verified_at,
        verified_by: dealer.verified_by,
      }));

      return {
        data: enhancedDealers,
        count: count || 0,
      };
    } catch (error) {
      throw new Error(`Failed to fetch dealers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDealer(dealerId: string, tenantId: string) {
    return this.executeQuery<EnhancedDealer>(async () => {
      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .eq('id', dealerId)
        .eq('tenant_id', tenantId)
        .single();

      if (error) throw error;

      // Transform to EnhancedDealer format with proper mappings
      const enhancedDealer: EnhancedDealer = {
        ...data,
        alternate_phone: data.secondary_phone || '',
        address: (data.business_address as Record<string, any>) || {},
        business_type: data.business_type || '',
        registration_status: data.registration_status || 'pending',
        onboarding_status: data.onboarding_date ? 'completed' : 'not_started',
        kyc_status: data.kyc_status || 'pending',
        territory_id: Array.isArray(data.territory_ids) && data.territory_ids.length > 0 
          ? data.territory_ids[0] 
          : data.territory_ids || undefined,
        product_authorizations: (data.product_authorizations as string[]) || [],
        commission_structure: { commission_rate: data.commission_rate || 0 },
        performance_metrics: {},
        banking_details: (data.bank_details as Record<string, any>) || {},
        documents: [],
        notes: '',
        verified_at: data.verified_at,
        verified_by: data.verified_by,
      };

      return { data: enhancedDealer, error: null };
    });
  }

  async createDealer(dealerData: CreateDealerData) {
    return this.executeQuery<EnhancedDealer>(async () => {
      return await supabase
        .from('dealers')
        .insert({
          ...dealerData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
    });
  }

  async updateDealer(dealerId: string, tenantId: string, updates: UpdateDealerData) {
    return this.executeQuery<EnhancedDealer>(async () => {
      return await supabase
        .from('dealers')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', dealerId)
        .eq('tenant_id', tenantId)
        .select()
        .single();
    });
  }

  async deleteDealer(dealerId: string, tenantId: string) {
    return this.executeQuery(async () => {
      return await supabase
        .from('dealers')
        .update({ is_active: false })
        .eq('id', dealerId)
        .eq('tenant_id', tenantId)
        .select()
        .single();
    });
  }

  async getDealerCount(tenantId: string): Promise<number> {
    const { count } = await supabase
      .from('dealers')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);
    
    return count || 0;
  }

  async generateDealerCode(tenantSlug: string, count: number): Promise<string> {
    const prefix = tenantSlug.toUpperCase().substring(0, 3);
    const sequenceNumber = (count + 1).toString().padStart(4, '0');
    return `${prefix}D${sequenceNumber}`;
  }
}

export const dealersService = new DealersService();
