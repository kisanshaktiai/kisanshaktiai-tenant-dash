
import { supabase } from '@/integrations/supabase/client';

export interface TenantDataRequest {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete';
  data?: any;
  filters?: Record<string, any>;
  id?: string;
}

export interface TenantDataResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class TenantDataService {
  private async callTenantDataAPI<T = any>(
    tenantId: string, 
    request: TenantDataRequest
  ): Promise<T> {
    try {
      console.log('Calling tenant data API:', { tenantId, request });

      const { data, error } = await supabase.functions.invoke('tenant-data-api', {
        body: {
          ...request,
          tenant_id: tenantId // Always include tenant_id in request body
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to call tenant data API');
      }

      const response = data as TenantDataResponse<T>;
      
      if (!response.success) {
        throw new Error(response.error || 'API request failed');
      }

      console.log('Tenant data API response:', response);
      return response.data as T;
    } catch (error) {
      console.error('Tenant data service error:', error);
      throw error;
    }
  }

  // Onboarding workflows
  async getOnboardingWorkflow(tenantId: string) {
    return this.callTenantDataAPI(tenantId, {
      table: 'onboarding_workflows',
      operation: 'select',
      filters: { tenant_id: tenantId }
    });
  }

  async updateOnboardingWorkflow(tenantId: string, workflowId: string, data: any) {
    return this.callTenantDataAPI(tenantId, {
      table: 'onboarding_workflows',
      operation: 'update',
      id: workflowId,
      data
    });
  }

  async getOnboardingSteps(tenantId: string, workflowId?: string) {
    const filters: Record<string, any> = {};
    if (workflowId) {
      filters.workflow_id = workflowId;
    }

    return this.callTenantDataAPI(tenantId, {
      table: 'onboarding_steps',
      operation: 'select',
      filters
    });
  }

  async updateOnboardingStep(tenantId: string, stepId: string, data: any) {
    return this.callTenantDataAPI(tenantId, {
      table: 'onboarding_steps',
      operation: 'update',
      id: stepId,
      data
    });
  }

  // Subscription plans
  async getSubscriptionPlans(tenantId: string) {
    return this.callTenantDataAPI(tenantId, {
      table: 'subscription_plans',
      operation: 'select'
    });
  }

  // Tenant data
  async getTenant(tenantId: string) {
    return this.callTenantDataAPI(tenantId, {
      table: 'tenants',
      operation: 'select'
    });
  }

  async updateTenant(tenantId: string, data: any) {
    return this.callTenantDataAPI(tenantId, {
      table: 'tenants',
      operation: 'update',
      id: tenantId,
      data
    });
  }

  // Tenant branding
  async getTenantBranding(tenantId: string) {
    return this.callTenantDataAPI(tenantId, {
      table: 'tenant_branding',
      operation: 'select',
      filters: { tenant_id: tenantId }
    });
  }

  async upsertTenantBranding(tenantId: string, data: any) {
    // First try to get existing branding
    try {
      const existing = await this.getTenantBranding(tenantId);
      if (existing && Array.isArray(existing) && existing.length > 0) {
        // Update existing
        return this.callTenantDataAPI(tenantId, {
          table: 'tenant_branding',
          operation: 'update',
          id: existing[0].id,
          data
        });
      }
    } catch (error) {
      console.log('No existing branding found, will create new');
    }

    // Create new
    return this.callTenantDataAPI(tenantId, {
      table: 'tenant_branding',
      operation: 'insert',
      data: { ...data, tenant_id: tenantId }
    });
  }

  // Tenant features
  async getTenantFeatures(tenantId: string) {
    return this.callTenantDataAPI(tenantId, {
      table: 'tenant_features',
      operation: 'select',
      filters: { tenant_id: tenantId }
    });
  }

  async upsertTenantFeatures(tenantId: string, data: any) {
    // First try to get existing features
    try {
      const existing = await this.getTenantFeatures(tenantId);
      if (existing && Array.isArray(existing) && existing.length > 0) {
        // Update existing
        return this.callTenantDataAPI(tenantId, {
          table: 'tenant_features',
          operation: 'update',
          id: existing[0].id,
          data
        });
      }
    } catch (error) {
      console.log('No existing features found, will create new');
    }

    // Create new
    return this.callTenantDataAPI(tenantId, {
      table: 'tenant_features',
      operation: 'insert',
      data: { ...data, tenant_id: tenantId }
    });
  }

  // Tenant subscriptions
  async getTenantSubscription(tenantId: string) {
    return this.callTenantDataAPI(tenantId, {
      table: 'tenant_subscriptions',
      operation: 'select',
      filters: { tenant_id: tenantId }
    });
  }
}

export const tenantDataService = new TenantDataService();
