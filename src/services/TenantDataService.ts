
import { supabase } from '@/integrations/supabase/client';

export interface TenantDataRequest {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete' | 'ensure_workflow' | 'complete_workflow' | 'calculate_progress';
  data?: any;
  filters?: Record<string, any>;
  id?: string;
  workflow_id?: string;
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
        body: JSON.stringify({
          ...request,
          tenant_id: tenantId
        }),
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

  // Workflow Management
  async ensureOnboardingWorkflow(tenantId: string): Promise<{ workflow_id: string }> {
    return this.callTenantDataAPI(tenantId, {
      table: '',
      operation: 'ensure_workflow'
    });
  }

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

  async completeOnboardingWorkflow(tenantId: string, workflowId: string): Promise<{ success: boolean }> {
    return this.callTenantDataAPI(tenantId, {
      table: '',
      operation: 'complete_workflow',
      workflow_id: workflowId
    });
  }

  async calculateWorkflowProgress(tenantId: string, workflowId: string): Promise<{ progress: number }> {
    return this.callTenantDataAPI(tenantId, {
      table: '',
      operation: 'calculate_progress',
      workflow_id: workflowId
    });
  }

  // Steps Management
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
    try {
      const existing = await this.getTenantBranding(tenantId);
      if (existing && Array.isArray(existing) && existing.length > 0) {
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
    try {
      const existing = await this.getTenantFeatures(tenantId);
      if (existing && Array.isArray(existing) && existing.length > 0) {
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

  // Composite Operations for Enhanced UX
  async getCompleteOnboardingData(tenantId: string) {
    try {
      // Ensure workflow exists first
      const { workflow_id } = await this.ensureOnboardingWorkflow(tenantId);
      
      // Get workflow and steps
      const [workflow, steps] = await Promise.all([
        this.getOnboardingWorkflow(tenantId),
        this.getOnboardingSteps(tenantId, workflow_id)
      ]);

      return {
        workflow: Array.isArray(workflow) ? workflow[0] : workflow,
        steps: Array.isArray(steps) ? steps.sort((a, b) => a.step_number - b.step_number) : []
      };
    } catch (error) {
      console.error('Error getting complete onboarding data:', error);
      throw error;
    }
  }

  async completeOnboardingStep(tenantId: string, stepId: string, stepData?: any) {
    try {
      const result = await this.updateOnboardingStep(tenantId, stepId, {
        step_status: 'completed',
        step_data: stepData || {},
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      console.log('Step completed successfully:', stepId);
      return result;
    } catch (error) {
      console.error('Error completing step:', error);
      throw error;
    }
  }

  async initializeOnboardingForTenant(tenantId: string) {
    try {
      console.log('Initializing onboarding for tenant:', tenantId);
      
      // Ensure workflow exists
      const { workflow_id } = await this.ensureOnboardingWorkflow(tenantId);
      
      // Get complete onboarding data
      const onboardingData = await this.getCompleteOnboardingData(tenantId);
      
      console.log('Onboarding initialized successfully:', { 
        workflowId: workflow_id, 
        stepCount: onboardingData.steps.length 
      });
      
      return onboardingData;
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      throw error;
    }
  }
}

export const tenantDataService = new TenantDataService();
