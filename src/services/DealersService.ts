
import { BaseApiService } from './core/BaseApiService';
import { supabase } from '@/integrations/supabase/client';
import { apiClient } from './api/CorsApiClient';

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
  legal_name?: string;
  contact_person: string;
  designation?: string;
  phone: string;
  alternate_phone?: string;
  email: string;
  alternate_email?: string;
  website?: string;
  
  // Address information
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  gps_location?: any;
  
  // Business information
  gst_number?: string;
  pan_number?: string;
  business_type?: string;
  establishment_year?: number;
  employee_count?: number;
  
  // Territory and coverage
  territory_id?: string;
  assigned_zones?: string[];
  coverage_area_km?: number;
  service_villages?: string[];
  
  // Performance metrics
  performance_score?: number;
  sales_target?: number;
  sales_achieved?: number;
  customer_rating?: number;
  total_farmers_served?: number;
  
  // Commission and financials
  commission_rate?: number;
  outstanding_amount?: number;
  credit_limit?: number;
  payment_terms?: string;
  
  // Verification and compliance
  verification_status: string;
  kyc_documents?: any;
  verified_at?: string;
  verified_by?: string;
  agreement_signed?: boolean;
  agreement_date?: string;
  
  // Activity tracking
  last_order_date?: string;
  total_orders?: number;
  last_activity_at?: string;
  engagement_score?: number;
  
  // Status and metadata
  status?: string;
  onboarding_status?: string;
  onboarding_completed_at?: string;
  tags?: string[];
  notes?: string;
  metadata?: any;
  
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreateDealerData {
  tenant_id: string;
  dealer_code: string;
  business_name: string;
  legal_name?: string;
  contact_person: string;
  designation?: string;
  phone: string;
  alternate_phone?: string;
  email: string;
  alternate_email?: string;
  website?: string;
  
  // Address information (separate fields that will be combined)
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  gps_location?: any;
  
  // Business information
  gst_number?: string;
  pan_number?: string;
  business_type?: string;
  establishment_year?: number;
  employee_count?: number;
  
  // Territory and coverage
  territory_id?: string;
  assigned_zones?: string[];
  coverage_area_km?: number;
  service_villages?: string[];
  
  // Commission and financials
  commission_rate?: number;
  credit_limit?: number;
  payment_terms?: string;
  
  // Verification and compliance
  verification_status?: string;
  kyc_documents?: any;
  agreement_signed?: boolean;
  agreement_date?: string;
  
  // Status
  status?: string;
  tags?: string[];
  notes?: string;
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
      // Use the new dealers-api edge function if available
      const useEdgeFunction = true; // Feature flag - can be configured
      
      if (useEdgeFunction) {
        const response = await apiClient.post<Dealer>('/dealers-api', dealerData, {
          tenantId: dealerData.tenant_id,
        });
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        return response.data!;
      } else {
        // Fallback to direct database access
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
      }
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
