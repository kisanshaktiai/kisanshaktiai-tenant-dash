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
  private validateTenantAccess(tenantId: string): void {
    if (!tenantId || tenantId.trim() === '') {
      throw new Error('Tenant ID is required for data isolation');
    }
  }

  private validateRequest(tenantId: string, request: TenantDataRequest): void {
    this.validateTenantAccess(tenantId);
    
    if (!request.operation) {
      throw new Error('Operation is required');
    }

    if (!['ensure_workflow', 'complete_workflow', 'calculate_progress'].includes(request.operation) && !request.table) {
      throw new Error('Table is required for this operation');
    }

    if (request.operation === 'complete_workflow' && !request.workflow_id) {
      throw new Error('Workflow ID is required for complete_workflow operation');
    }

    if (request.operation === 'calculate_progress' && !request.workflow_id) {
      throw new Error('Workflow ID is required for calculate_progress operation');
    }

    if (['insert', 'update'].includes(request.operation) && !request.data) {
      throw new Error(`Data is required for ${request.operation} operation`);
    }

    if (['update', 'delete'].includes(request.operation) && !request.id) {
      throw new Error(`ID is required for ${request.operation} operation`);
    }
  }

  private async callTenantDataAPI<T = any>(
    tenantId: string, 
    request: TenantDataRequest
  ): Promise<T> {
    try {
      this.validateRequest(tenantId, request);

      const requestPayload = {
        ...request,
        tenant_id: tenantId
      };

      console.log('TenantDataService: Calling edge function with tenant isolation:', {
        operation: requestPayload.operation,
        table: requestPayload.table,
        tenant_id: requestPayload.tenant_id,
        hasData: !!requestPayload.data,
      });

      // Explicitly stringify the body to ensure proper serialization
      const bodyString = JSON.stringify(requestPayload);
      console.log('TenantDataService: Request body string length:', bodyString.length);
      console.log('TenantDataService: Request body preview:', bodyString.substring(0, 200));

      const { data, error } = await supabase.functions.invoke('tenant-data-api', {
        body: bodyString,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        console.error('TenantDataService: Edge function error for tenant:', tenantId, error);
        
        const errorMessage = error.message || 'Failed to call tenant data API';
        
        // Categorize errors for proper retry behavior
        if (errorMessage.includes('400') || errorMessage.includes('Bad Request') || 
            errorMessage.includes('required') || errorMessage.includes('Invalid')) {
          const clientError = new Error(errorMessage);
          (clientError as any).isClientError = true;
          throw clientError;
        }
        
        throw new Error(errorMessage);
      }

      if (data && typeof data === 'object') {
        if (data.success === false) {
          const apiError = new Error(data.error || 'API request failed');
          if (data.error && (data.error.includes('required') || data.error.includes('Invalid'))) {
            (apiError as any).isClientError = true;
          }
          throw apiError;
        }
        
        return data.success ? data.data : data;
      }

      return data as T;
    } catch (error) {
      console.error('TenantDataService: Error in tenant-isolated API call:', {
        tenantId,
        operation: request.operation,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  async ensureOnboardingWorkflow(tenantId: string): Promise<{ workflow_id: string }> {
    this.validateTenantAccess(tenantId);
    
    console.log('TenantDataService: Ensuring onboarding workflow for tenant:', tenantId);
    
    try {
      const result = await this.callTenantDataAPI(tenantId, {
        table: 'onboarding_workflows',
        operation: 'ensure_workflow'
      });
      
      if (!result || !result.workflow_id) {
        throw new Error('Failed to ensure workflow - no workflow ID returned');
      }
      
      console.log('TenantDataService: Ensured workflow for tenant:', tenantId, 'workflow ID:', result.workflow_id);
      return result;
    } catch (error) {
      console.error('TenantDataService: Error ensuring workflow for tenant:', tenantId, error);
      throw error;
    }
  }

  async getOnboardingWorkflow(tenantId: string) {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Getting onboarding workflow for tenant:', tenantId);
    return this.callTenantDataAPI(tenantId, {
      table: 'onboarding_workflows',
      operation: 'select',
      filters: { tenant_id: tenantId }
    });
  }

  async updateOnboardingWorkflow(tenantId: string, workflowId: string, data: any) {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Updating onboarding workflow:', { tenantId, workflowId, data });
    return this.callTenantDataAPI(tenantId, {
      table: 'onboarding_workflows',
      operation: 'update',
      id: workflowId,
      data
    });
  }

  async completeOnboardingWorkflow(tenantId: string, workflowId: string): Promise<{ success: boolean }> {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Completing onboarding workflow:', { tenantId, workflowId });
    return this.callTenantDataAPI(tenantId, {
      table: 'onboarding_workflows',
      operation: 'complete_workflow',
      workflow_id: workflowId
    });
  }

  async calculateWorkflowProgress(tenantId: string, workflowId: string): Promise<{ progress: number }> {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Calculating workflow progress:', { tenantId, workflowId });
    return this.callTenantDataAPI(tenantId, {
      table: 'onboarding_workflows',
      operation: 'calculate_progress',
      workflow_id: workflowId
    });
  }

  async getOnboardingSteps(tenantId: string, workflowId?: string) {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Getting onboarding steps for tenant:', tenantId, 'workflow:', workflowId);
    const filters: Record<string, any> = { tenant_id: tenantId };
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
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Updating onboarding step:', { tenantId, stepId, data });
    return this.callTenantDataAPI(tenantId, {
      table: 'onboarding_steps',
      operation: 'update',
      id: stepId,
      data
    });
  }

  async getCompleteOnboardingData(tenantId: string) {
    this.validateTenantAccess(tenantId);
    try {
      console.log('TenantDataService: Getting complete onboarding data for tenant:', tenantId);
      
      let workflow_id: string;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount < maxRetries) {
        try {
          const result = await this.ensureOnboardingWorkflow(tenantId);
          workflow_id = result.workflow_id;
          console.log('TenantDataService: Workflow ensured with ID:', workflow_id);
          break;
        } catch (error: any) {
          retryCount++;
          console.error(`TenantDataService: Workflow ensure attempt ${retryCount} failed:`, error);
          
          if (error.isClientError || retryCount >= maxRetries) {
            throw error;
          }
          
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }
      
      const [workflow, steps] = await Promise.all([
        this.getOnboardingWorkflow(tenantId),
        this.getOnboardingSteps(tenantId, workflow_id)
      ]);

      console.log('TenantDataService: Retrieved workflow and steps:', { 
        hasWorkflow: !!workflow, 
        stepsCount: Array.isArray(steps) ? steps.length : 0 
      });

      return {
        workflow: Array.isArray(workflow) ? workflow[0] : workflow,
        steps: Array.isArray(steps) ? steps.sort((a, b) => a.step_number - b.step_number) : []
      };
    } catch (error) {
      console.error('TenantDataService: Error getting complete onboarding data:', error);
      throw error;
    }
  }

  async completeOnboardingStep(tenantId: string, stepId: string, stepData?: any) {
    this.validateTenantAccess(tenantId);
    try {
      console.log('TenantDataService: Completing onboarding step:', { tenantId, stepId, stepData });
      
      const result = await this.updateOnboardingStep(tenantId, stepId, {
        step_status: 'completed',
        step_data: stepData || {},
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      console.log('TenantDataService: Step completed successfully:', stepId);
      return result;
    } catch (error) {
      console.error('TenantDataService: Error completing step:', error);
      throw error;
    }
  }

  async initializeOnboardingForTenant(tenantId: string) {
    this.validateTenantAccess(tenantId);
    
    const maxRetries = 2;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`TenantDataService: Initializing onboarding for tenant (attempt ${retryCount + 1}/${maxRetries}):`, tenantId);
        
        const { workflow_id } = await this.ensureOnboardingWorkflow(tenantId);
        const onboardingData = await this.getCompleteOnboardingData(tenantId);
        
        console.log('TenantDataService: Onboarding initialized successfully for tenant:', tenantId, {
          workflowId: workflow_id, 
          stepCount: onboardingData.steps.length 
        });
        
        return onboardingData;
      } catch (error: any) {
        retryCount++;
        console.error(`TenantDataService: Error initializing onboarding for tenant ${tenantId} (attempt ${retryCount}):`, error);
        
        if (error.isClientError || retryCount >= maxRetries) {
          throw new Error(`Failed to initialize onboarding for tenant ${tenantId}: ${error.message}`);
        }
        
        const delay = Math.min(Math.pow(2, retryCount) * 1000 + Math.random() * 1000, 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async getSubscriptionPlans(tenantId: string) {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Getting subscription plans for tenant:', tenantId);
    return this.callTenantDataAPI(tenantId, {
      table: 'subscription_plans',
      operation: 'select'
    });
  }

  async getTenant(tenantId: string) {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Getting tenant data:', tenantId);
    return this.callTenantDataAPI(tenantId, {
      table: 'tenants',
      operation: 'select'
    });
  }

  async updateTenant(tenantId: string, data: any) {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Updating tenant:', { tenantId, data });
    return this.callTenantDataAPI(tenantId, {
      table: 'tenants',
      operation: 'update',
      id: tenantId,
      data
    });
  }

  async getTenantBranding(tenantId: string) {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Getting tenant branding:', tenantId);
    return this.callTenantDataAPI(tenantId, {
      table: 'tenant_branding',
      operation: 'select',
      filters: { tenant_id: tenantId }
    });
  }

  async upsertTenantBranding(tenantId: string, data: any) {
    this.validateTenantAccess(tenantId);
    try {
      console.log('TenantDataService: Upserting tenant branding:', { tenantId, data });
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
      console.log('TenantDataService: No existing branding found, will create new');
    }

    return this.callTenantDataAPI(tenantId, {
      table: 'tenant_branding',
      operation: 'insert',
      data: { ...data, tenant_id: tenantId }
    });
  }

  async getTenantFeatures(tenantId: string) {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Getting tenant features:', tenantId);
    return this.callTenantDataAPI(tenantId, {
      table: 'tenant_features',
      operation: 'select',
      filters: { tenant_id: tenantId }
    });
  }

  async upsertTenantFeatures(tenantId: string, data: any) {
    this.validateTenantAccess(tenantId);
    try {
      console.log('TenantDataService: Upserting tenant features:', { tenantId, data });
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
      console.log('TenantDataService: No existing features found, will create new');
    }

    return this.callTenantDataAPI(tenantId, {
      table: 'tenant_features',
      operation: 'insert',
      data: { ...data, tenant_id: tenantId }
    });
  }

  async getTenantSubscription(tenantId: string) {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Getting tenant subscription:', tenantId);
    return this.callTenantDataAPI(tenantId, {
      table: 'tenant_subscriptions',
      operation: 'select',
      filters: { tenant_id: tenantId }
    });
  }
}

export const tenantDataService = new TenantDataService();
