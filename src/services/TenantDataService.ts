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

  async ensureOnboardingWorkflow(tenantId: string): Promise<string> {
    this.validateTenantAccess(tenantId);
    
    console.log('TenantDataService: Ensuring onboarding workflow for tenant:', tenantId);
    
    try {
      const { data, error } = await supabase.rpc('ensure_onboarding_workflow', {
        p_tenant_id: tenantId
      });
      
      if (error) {
        console.error('TenantDataService: Error ensuring workflow:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('No workflow ID returned from database function');
      }
      
      console.log('TenantDataService: Workflow ensured with ID:', data);
      return data;
    } catch (error) {
      console.error('TenantDataService: Error ensuring workflow for tenant:', tenantId, error);
      throw error;
    }
  }

  async getOnboardingWorkflow(tenantId: string) {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Getting onboarding workflow for tenant:', tenantId);
    
    const { data, error } = await supabase
      .from('onboarding_workflows')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('TenantDataService: Error fetching workflow:', error);
      throw error;
    }

    return data;
  }

  async updateOnboardingWorkflow(tenantId: string, workflowId: string, data: any) {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Updating onboarding workflow:', { tenantId, workflowId, data });
    
    const { data: result, error } = await supabase
      .from('onboarding_workflows')
      .update(data)
      .eq('id', workflowId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) {
      console.error('TenantDataService: Error updating workflow:', error);
      throw error;
    }

    return result;
  }

  async completeOnboardingWorkflow(tenantId: string, workflowId: string): Promise<{ success: boolean }> {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Completing onboarding workflow:', { tenantId, workflowId });
    
    try {
      const { data, error } = await supabase.rpc('complete_onboarding_workflow', {
        p_tenant_id: tenantId,
        p_workflow_id: workflowId
      });

      if (error) {
        console.error('TenantDataService: Error completing workflow:', error);
        throw error;
      }

      return data || { success: true };
    } catch (error) {
      console.error('TenantDataService: Error completing workflow:', error);
      return { success: false };
    }
  }

  async calculateWorkflowProgress(tenantId: string, workflowId: string): Promise<{ progress: number }> {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Calculating workflow progress:', { tenantId, workflowId });
    
    const { data, error } = await supabase.rpc('calculate_workflow_progress', {
      p_workflow_id: workflowId
    });

    if (error) {
      console.error('TenantDataService: Error calculating progress:', error);
      throw error;
    }

    return { progress: data || 0 };
  }

  async getOnboardingSteps(tenantId: string, workflowId?: string) {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Getting onboarding steps for tenant:', tenantId, 'workflow:', workflowId);
    
    let query = supabase
      .from('onboarding_steps')
      .select(`
        *,
        workflow:onboarding_workflows!inner(tenant_id)
      `)
      .eq('workflow.tenant_id', tenantId)
      .order('step_number');

    if (workflowId) {
      query = query.eq('workflow_id', workflowId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('TenantDataService: Error fetching steps:', error);
      throw error;
    }

    return data || [];
  }

  async updateOnboardingStep(tenantId: string, stepId: string, data: any) {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Updating onboarding step:', { tenantId, stepId, data });
    
    const { data: result, error } = await supabase
      .from('onboarding_steps')
      .update(data)
      .eq('id', stepId)
      .select(`
        *,
        workflow:onboarding_workflows!inner(tenant_id)
      `)
      .eq('workflow.tenant_id', tenantId)
      .single();

    if (error) {
      console.error('TenantDataService: Error updating step:', error);
      throw error;
    }

    return result;
  }

  async getCompleteOnboardingData(tenantId: string) {
    this.validateTenantAccess(tenantId);
    try {
      console.log('TenantDataService: Getting complete onboarding data for tenant:', tenantId);
      
      // First ensure workflow exists
      const workflowId = await this.ensureOnboardingWorkflow(tenantId);
      
      // Then fetch both workflow and steps
      const [workflow, steps] = await Promise.all([
        this.getOnboardingWorkflow(tenantId),
        this.getOnboardingSteps(tenantId, workflowId)
      ]);

      console.log('TenantDataService: Retrieved workflow and steps:', { 
        hasWorkflow: !!workflow, 
        stepsCount: Array.isArray(steps) ? steps.length : 0 
      });

      return {
        workflow,
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

      // After updating step, recalculate workflow progress
      if (result?.workflow_id) {
        await this.calculateWorkflowProgress(tenantId, result.workflow_id);
      }

      console.log('TenantDataService: Step completed successfully:', stepId);
      return result;
    } catch (error) {
      console.error('TenantDataService: Error completing step:', error);
      throw error;
    }
  }

  async initializeOnboardingForTenant(tenantId: string) {
    this.validateTenantAccess(tenantId);
    
    try {
      console.log('TenantDataService: Initializing onboarding for tenant:', tenantId);
      
      const workflowId = await this.ensureOnboardingWorkflow(tenantId);
      const onboardingData = await this.getCompleteOnboardingData(tenantId);
      
      console.log('TenantDataService: Onboarding initialized successfully for tenant:', tenantId, {
        workflowId: workflowId, 
        stepCount: onboardingData.steps.length 
      });
      
      return onboardingData;
    } catch (error) {
      console.error('TenantDataService: Error initializing onboarding for tenant:', tenantId, error);
      throw new Error(`Failed to initialize onboarding for tenant ${tenantId}: ${error.message}`);
    }
  }

  async getSubscriptionPlans(tenantId: string) {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Getting subscription plans for tenant:', tenantId);
    
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly');

    if (error) {
      console.error('TenantDataService: Error fetching subscription plans:', error);
      throw error;
    }

    return data || [];
  }

  async getTenant(tenantId: string) {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Getting tenant data:', tenantId);
    
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (error) {
      console.error('TenantDataService: Error fetching tenant:', error);
      throw error;
    }

    return data;
  }

  async updateTenant(tenantId: string, data: any) {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Updating tenant:', { tenantId, data });
    
    const { data: result, error } = await supabase
      .from('tenants')
      .update(data)
      .eq('id', tenantId)
      .select()
      .single();

    if (error) {
      console.error('TenantDataService: Error updating tenant:', error);
      throw error;
    }

    return result;
  }

  async getTenantBranding(tenantId: string) {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Getting tenant branding:', tenantId);
    
    const { data, error } = await supabase
      .from('tenant_branding')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('TenantDataService: Error fetching branding:', error);
      throw error;
    }

    return data;
  }

  async upsertTenantBranding(tenantId: string, data: any) {
    this.validateTenantAccess(tenantId);
    try {
      console.log('TenantDataService: Upserting tenant branding:', { tenantId, data });
      
      const { data: result, error } = await supabase
        .from('tenant_branding')
        .upsert({ ...data, tenant_id: tenantId })
        .select()
        .single();

      if (error) {
        console.error('TenantDataService: Error upserting branding:', error);
        throw error;
      }

      return result;
    } catch (error) {
      console.error('TenantDataService: Error upserting branding:', error);
      throw error;
    }
  }

  async getTenantFeatures(tenantId: string) {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Getting tenant features:', tenantId);
    
    const { data, error } = await supabase
      .from('tenant_features')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('TenantDataService: Error fetching features:', error);
      throw error;
    }

    return data;
  }

  async upsertTenantFeatures(tenantId: string, data: any) {
    this.validateTenantAccess(tenantId);
    try {
      console.log('TenantDataService: Upserting tenant features:', { tenantId, data });
      
      const { data: result, error } = await supabase
        .from('tenant_features')
        .upsert({ ...data, tenant_id: tenantId })
        .select()
        .single();

      if (error) {
        console.error('TenantDataService: Error upserting features:', error);
        throw error;
      }

      return result;
    } catch (error) {
      console.error('TenantDataService: Error upserting features:', error);
      throw error;
    }
  }

  async getTenantSubscription(tenantId: string) {
    this.validateTenantAccess(tenantId);
    console.log('TenantDataService: Getting tenant subscription:', tenantId);
    
    const { data, error } = await supabase
      .from('tenant_subscriptions')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('TenantDataService: Error fetching subscription:', error);
      throw error;
    }

    return data;
  }
}

export const tenantDataService = new TenantDataService();
