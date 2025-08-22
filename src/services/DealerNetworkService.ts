
import { BaseApiService } from './core/BaseApiService';
import { supabase } from '@/integrations/supabase/client';
import type {
  DealerTerritory,
  DealerPerformance,
  DealerCommunication,
  DealerIncentive,
  DealerOnboardingStep,
  EnhancedDealer
} from '@/types/dealer';

export interface TerritoryListOptions {
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface PerformanceListOptions extends TerritoryListOptions {
  period?: 'monthly' | 'quarterly' | 'yearly';
  dealer_id?: string;
}

class DealerNetworkService extends BaseApiService {
  // Territory Management
  async getTerritories(tenantId: string, options: TerritoryListOptions = {}) {
    try {
      let query = supabase
        .from('dealer_territories')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      if (options.search) {
        query = query.or(`territory_name.ilike.%${options.search}%,territory_code.ilike.%${options.search}%`);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const sortBy = options.sortBy || 'territory_name';
      const sortOrder = options.sortOrder || 'asc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return {
        data: data || [],
        count: count || 0,
      };
    } catch (error) {
      throw new Error(`Failed to fetch territories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createTerritory(territoryData: Omit<DealerTerritory, 'id' | 'created_at' | 'updated_at'>) {
    return this.executeQuery<DealerTerritory>(async () => {
      return await supabase
        .from('dealer_territories')
        .insert({
          ...territoryData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
    });
  }

  async updateTerritory(territoryId: string, tenantId: string, updates: Partial<DealerTerritory>) {
    return this.executeQuery<DealerTerritory>(async () => {
      return await supabase
        .from('dealer_territories')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', territoryId)
        .eq('tenant_id', tenantId)
        .select()
        .single();
    });
  }

  // Performance Tracking
  async getDealerPerformance(tenantId: string, options: PerformanceListOptions = {}) {
    try {
      let query = supabase
        .from('dealer_performance')
        .select(`
          *,
          dealer:dealers!inner(dealer_code, business_name, contact_person)
        `, { count: 'exact' })
        .eq('tenant_id', tenantId);

      if (options.dealer_id) {
        query = query.eq('dealer_id', options.dealer_id);
      }

      if (options.period) {
        query = query.eq('performance_period', options.period);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const sortBy = options.sortBy || 'period_end';
      const sortOrder = options.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return {
        data: data || [],
        count: count || 0,
      };
    } catch (error) {
      throw new Error(`Failed to fetch performance data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createPerformanceRecord(performanceData: Omit<DealerPerformance, 'id' | 'created_at' | 'updated_at'>) {
    return this.executeQuery<DealerPerformance>(async () => {
      return await supabase
        .from('dealer_performance')
        .insert({
          ...performanceData,
          id: crypto.randomUUID(),
          calculated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
    });
  }

  // Communications
  async getDealerCommunications(tenantId: string, options: TerritoryListOptions = {}) {
    try {
      let query = supabase
        .from('dealer_communications')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const sortBy = options.sortBy || 'created_at';
      const sortOrder = options.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return {
        data: data || [],
        count: count || 0,
      };
    } catch (error) {
      throw new Error(`Failed to fetch communications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createCommunication(communicationData: Omit<DealerCommunication, 'id' | 'created_at' | 'updated_at'>) {
    return this.executeQuery<DealerCommunication>(async () => {
      return await supabase
        .from('dealer_communications')
        .insert({
          ...communicationData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
    });
  }

  // Incentive Management
  async getDealerIncentives(tenantId: string, options: TerritoryListOptions = {}) {
    try {
      let query = supabase
        .from('dealer_incentives')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId);

      if (options.search) {
        query = query.ilike('incentive_name', `%${options.search}%`);
      }

      if (options.filters?.status) {
        query = query.eq('status', options.filters.status);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const sortBy = options.sortBy || 'created_at';
      const sortOrder = options.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return {
        data: data || [],
        count: count || 0,
      };
    } catch (error) {
      throw new Error(`Failed to fetch incentives: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createIncentive(incentiveData: Omit<DealerIncentive, 'id' | 'created_at' | 'updated_at'>) {
    return this.executeQuery<DealerIncentive>(async () => {
      return await supabase
        .from('dealer_incentives')
        .insert({
          ...incentiveData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
    });
  }

  // Onboarding Management
  async getDealerOnboardingSteps(dealerId: string, tenantId: string) {
    try {
      const { data, error } = await supabase
        .from('dealer_onboarding_steps')
        .select('*')
        .eq('dealer_id', dealerId)
        .eq('tenant_id', tenantId)
        .order('step_order', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch onboarding steps: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateOnboardingStep(stepId: string, tenantId: string, updates: Partial<DealerOnboardingStep>) {
    return this.executeQuery<DealerOnboardingStep>(async () => {
      return await supabase
        .from('dealer_onboarding_steps')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', stepId)
        .eq('tenant_id', tenantId)
        .select()
        .single();
    });
  }

  async initializeDealerOnboarding(dealerId: string, tenantId: string) {
    const defaultSteps = [
      {
        step_name: 'Document Upload',
        step_type: 'document_upload',
        step_order: 1,
        required_documents: ['gst_certificate', 'pan_card', 'bank_details'],
      },
      {
        step_name: 'KYC Verification',
        step_type: 'verification',
        step_order: 2,
        required_documents: ['address_proof', 'identity_proof'],
      },
      {
        step_name: 'Product Training',
        step_type: 'training',
        step_order: 3,
        required_documents: [],
      },
      {
        step_name: 'Agreement Signing',
        step_type: 'agreement',
        step_order: 4,
        required_documents: ['dealer_agreement'],
      },
    ];

    const steps = defaultSteps.map(step => ({
      ...step,
      id: crypto.randomUUID(),
      tenant_id: tenantId,
      dealer_id: dealerId,
      status: 'pending' as const,
      submitted_documents: [],
      verification_data: {},
      completion_data: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('dealer_onboarding_steps')
      .insert(steps)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

export const dealerNetworkService = new DealerNetworkService();
