
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
  // Mock Territory Management since tables don't exist yet
  async getTerritories(tenantId: string, options: TerritoryListOptions = {}) {
    try {
      // Return mock data since table doesn't exist
      const mockTerritories: DealerTerritory[] = [
        {
          id: '1',
          tenant_id: tenantId,
          territory_name: 'North Region',
          territory_code: 'NR001',
          description: 'Northern territory covering districts 1-5',
          geographic_boundaries: { north: 40.7, south: 40.0, east: -73.9, west: -74.2 },
          coverage_areas: ['District 1', 'District 2', 'District 3'],
          population_data: { total: 50000, farmers: 12000 },
          market_potential: { rating: 'high', estimated_revenue: 500000 },
          assigned_dealers: ['dealer-1', 'dealer-2'],
          territory_manager_id: 'manager-1',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];

      return {
        data: mockTerritories,
        count: mockTerritories.length,
      };
    } catch (error) {
      throw new Error(`Failed to fetch territories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createTerritory(territoryData: Omit<DealerTerritory, 'id' | 'created_at' | 'updated_at'>) {
    // Mock implementation
    const newTerritory: DealerTerritory = {
      ...territoryData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    return { data: newTerritory, error: null };
  }

  async updateTerritory(territoryId: string, tenantId: string, updates: Partial<DealerTerritory>) {
    // Mock implementation
    const updatedTerritory: DealerTerritory = {
      id: territoryId,
      tenant_id: tenantId,
      territory_name: 'Updated Territory',
      territory_code: 'UT001',
      description: 'Updated description',
      geographic_boundaries: {},
      coverage_areas: [],
      population_data: {},
      market_potential: {},
      assigned_dealers: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...updates,
    };
    
    return { data: updatedTerritory, error: null };
  }

  // Mock Performance Tracking
  async getDealerPerformance(tenantId: string, options: PerformanceListOptions = {}) {
    try {
      const mockPerformance: DealerPerformance[] = [
        {
          id: '1',
          tenant_id: tenantId,
          dealer_id: 'dealer-1',
          performance_period: 'monthly',
          period_start: '2024-01-01',
          period_end: '2024-01-31',
          sales_target: 100000,
          sales_achieved: 85000,
          farmers_acquired: 25,
          farmers_target: 30,
          product_sales: { product1: 50000, product2: 35000 },
          response_time_avg: 2.5,
          customer_satisfaction_score: 4.2,
          commission_earned: 8500,
          performance_score: 85,
          ranking: 3,
          achievements: ['High customer satisfaction'],
          improvement_areas: ['Sales target achievement'],
          calculated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];

      return {
        data: mockPerformance,
        count: mockPerformance.length,
      };
    } catch (error) {
      throw new Error(`Failed to fetch performance data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createPerformanceRecord(performanceData: Omit<DealerPerformance, 'id' | 'created_at' | 'updated_at'>) {
    const newRecord: DealerPerformance = {
      ...performanceData,
      id: crypto.randomUUID(),
      calculated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    return { data: newRecord, error: null };
  }

  // Mock Communications
  async getDealerCommunications(tenantId: string, options: TerritoryListOptions = {}) {
    try {
      const mockCommunications: DealerCommunication[] = [
        {
          id: '1',
          tenant_id: tenantId,
          title: 'Monthly Newsletter',
          content: 'This is the monthly newsletter content...',
          communication_type: 'announcement',
          priority: 'normal',
          sender_id: 'admin-1',
          recipient_ids: ['dealer-1', 'dealer-2'],
          attachments: [],
          delivery_status: { delivered: 2, failed: 0 },
          read_receipts: { 'dealer-1': true, 'dealer-2': false },
          scheduled_at: new Date().toISOString(),
          sent_at: new Date().toISOString(),
          metadata: {},
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];

      return {
        data: mockCommunications,
        count: mockCommunications.length,
      };
    } catch (error) {
      throw new Error(`Failed to fetch communications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createCommunication(communicationData: Omit<DealerCommunication, 'id' | 'created_at' | 'updated_at'>) {
    const newCommunication: DealerCommunication = {
      ...communicationData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    return { data: newCommunication, error: null };
  }

  // Mock Incentive Management
  async getDealerIncentives(tenantId: string, options: TerritoryListOptions = {}) {
    try {
      const mockIncentives: DealerIncentive[] = [
        {
          id: '1',
          tenant_id: tenantId,
          dealer_id: 'dealer-1',
          incentive_name: 'Q1 Sales Bonus',
          incentive_type: 'bonus',
          calculation_method: 'percentage',
          criteria: { min_sales: 100000, target_farmers: 50 },
          reward_structure: { base_percentage: 5, bonus_tiers: [] },
          eligibility_rules: { active_status: true, min_tenure: 6 },
          period_start: '2024-01-01',
          period_end: '2024-03-31',
          status: 'active',
          total_budget: 50000,
          amount_allocated: 25000,
          amount_paid: 15000,
          participants_count: 5,
          winners: [],
          leaderboard: [],
          created_by: 'admin-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];

      return {
        data: mockIncentives,
        count: mockIncentives.length,
      };
    } catch (error) {
      throw new Error(`Failed to fetch incentives: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createIncentive(incentiveData: Omit<DealerIncentive, 'id' | 'created_at' | 'updated_at'>) {
    const newIncentive: DealerIncentive = {
      ...incentiveData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    return { data: newIncentive, error: null };
  }

  // Mock Onboarding Management
  async getDealerOnboardingSteps(dealerId: string, tenantId: string) {
    try {
      const mockSteps: DealerOnboardingStep[] = [
        {
          id: '1',
          tenant_id: tenantId,
          dealer_id: dealerId,
          step_name: 'Document Upload',
          step_type: 'document_upload',
          step_order: 1,
          status: 'completed',
          required_documents: ['gst_certificate', 'pan_card'],
          submitted_documents: [{ name: 'gst.pdf', url: '/docs/gst.pdf' }],
          verification_data: { verified: true, verified_by: 'admin-1' },
          completion_data: { completed_at: new Date().toISOString() },
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];

      return mockSteps;
    } catch (error) {
      throw new Error(`Failed to fetch onboarding steps: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateOnboardingStep(stepId: string, tenantId: string, updates: Partial<DealerOnboardingStep>) {
    const updatedStep: DealerOnboardingStep = {
      id: stepId,
      tenant_id: tenantId,
      dealer_id: 'dealer-1',
      step_name: 'Updated Step',
      step_type: 'document_upload',
      step_order: 1,
      status: 'completed',
      required_documents: [],
      submitted_documents: [],
      verification_data: {},
      completion_data: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...updates,
    };
    
    return { data: updatedStep, error: null };
  }

  async initializeDealerOnboarding(dealerId: string, tenantId: string) {
    const defaultSteps = [
      {
        step_name: 'Document Upload',
        step_type: 'document_upload' as const,
        step_order: 1,
        required_documents: ['gst_certificate', 'pan_card', 'bank_details'],
      },
      {
        step_name: 'KYC Verification',
        step_type: 'verification' as const,
        step_order: 2,
        required_documents: ['address_proof', 'identity_proof'],
      },
      {
        step_name: 'Product Training',
        step_type: 'training' as const,
        step_order: 3,
        required_documents: [],
      },
      {
        step_name: 'Agreement Signing',
        step_type: 'agreement' as const,
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

    return steps;
  }
}

export const dealerNetworkService = new DealerNetworkService();
