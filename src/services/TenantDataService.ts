
import { supabase } from '@/integrations/supabase/client';

export class TenantDataService {
  async getCompleteOnboardingData(tenantId: string) {
    try {
      console.log('TenantDataService: Getting complete onboarding data for tenant:', tenantId);
      
      const { data, error } = await supabase
        .from('onboarding_workflows')
        .select(`
          *,
          steps:onboarding_steps(*)
        `)
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('TenantDataService: No onboarding workflow found for tenant:', tenantId);
          return null;
        }
        console.error('TenantDataService: Error fetching complete onboarding data:', error);
        throw error;
      }

      console.log('TenantDataService: Retrieved complete onboarding data successfully');
      return {
        workflow: data,
        steps: data.steps || []
      };
    } catch (error) {
      console.error('TenantDataService: Error in getCompleteOnboardingData:', error);
      throw error;
    }
  }

  async getOnboardingWorkflow(tenantId: string) {
    try {
      console.log('TenantDataService: Getting onboarding workflow for tenant:', tenantId);
      
      const { data, error } = await supabase
        .from('onboarding_workflows')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('TenantDataService: No workflow found for tenant:', tenantId);
          return null;
        }
        console.error('TenantDataService: Error fetching workflow:', error);
        throw error;
      }

      console.log('TenantDataService: Retrieved workflow successfully');
      return data;
    } catch (error) {
      console.error('TenantDataService: Error in getOnboardingWorkflow:', error);
      throw error;
    }
  }

  async getOnboardingSteps(tenantId: string, workflowId?: string) {
    try {
      console.log('TenantDataService: Getting onboarding steps for workflow:', workflowId);
      
      let query = supabase
        .from('onboarding_steps')
        .select('*');

      if (workflowId) {
        query = query.eq('workflow_id', workflowId);
      }

      query = query.order('step_number', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('TenantDataService: Error fetching steps:', error);
        throw error;
      }

      console.log('TenantDataService: Retrieved steps successfully');
      return data || [];
    } catch (error) {
      console.error('TenantDataService: Error in getOnboardingSteps:', error);
      throw error;
    }
  }

  async completeOnboardingWorkflow(tenantId: string, workflowId: string) {
    try {
      console.log('TenantDataService: Completing onboarding workflow:', { tenantId, workflowId });

      // Update workflow status to completed
      const { error: workflowError } = await supabase
        .from('onboarding_workflows')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', workflowId)
        .eq('tenant_id', tenantId);

      if (workflowError) {
        console.error('TenantDataService: Error updating workflow:', workflowError);
        throw workflowError;
      }

      console.log('TenantDataService: Workflow completed successfully');
      return { success: true };
    } catch (error) {
      console.error('TenantDataService: Error in completeOnboardingWorkflow:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateOnboardingStep(tenantId: string, stepId: string, updates: any) {
    try {
      console.log('TenantDataService: Updating onboarding step:', { stepId, updates });
      
      const { error } = await supabase
        .from('onboarding_steps')
        .update(updates)
        .eq('id', stepId);

      if (error) {
        console.error('TenantDataService: Error updating step:', error);
        throw error;
      }

      console.log('TenantDataService: Step updated successfully');
    } catch (error) {
      console.error('TenantDataService: Error in updateOnboardingStep:', error);
      throw error;
    }
  }

  async updateOnboardingWorkflow(tenantId: string, workflowId: string, updates: any) {
    try {
      console.log('TenantDataService: Updating onboarding workflow:', { workflowId, updates });
      
      const { error } = await supabase
        .from('onboarding_workflows')
        .update(updates)
        .eq('id', workflowId)
        .eq('tenant_id', tenantId);

      if (error) {
        console.error('TenantDataService: Error updating workflow:', error);
        throw error;
      }

      console.log('TenantDataService: Workflow updated successfully');
    } catch (error) {
      console.error('TenantDataService: Error in updateOnboardingWorkflow:', error);
      throw error;
    }
  }

  async completeOnboardingStep(tenantId: string, stepId: string, stepData?: any) {
    try {
      console.log('TenantDataService: Completing onboarding step:', { stepId, stepData });
      
      const { error } = await supabase
        .from('onboarding_steps')
        .update({
          step_status: 'completed',
          step_data: stepData || {},
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', stepId);

      if (error) {
        console.error('TenantDataService: Error completing step:', error);
        throw error;
      }

      console.log('TenantDataService: Step completed successfully');
    } catch (error) {
      console.error('TenantDataService: Error in completeOnboardingStep:', error);
      throw error;
    }
  }

  async initializeOnboardingForTenant(tenantId: string) {
    try {
      console.log('TenantDataService: Initializing onboarding for tenant:', tenantId);
      
      // Check if workflow already exists
      const existingWorkflow = await this.getOnboardingWorkflow(tenantId);
      if (existingWorkflow) {
        console.log('TenantDataService: Workflow already exists for tenant:', tenantId);
        const steps = await this.getOnboardingSteps(tenantId, existingWorkflow.id);
        return {
          workflow: existingWorkflow,
          steps: steps
        };
      }

      // Create new workflow
      const { data: workflowData, error: workflowError } = await supabase
        .from('onboarding_workflows')
        .insert({
          tenant_id: tenantId,
          status: 'in_progress',
          current_step: 1,
          total_steps: 6,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (workflowError) {
        console.error('TenantDataService: Error creating workflow:', workflowError);
        throw workflowError;
      }

      // Create steps
      const stepTemplates = [
        { step_number: 1, step_name: 'Business Verification', step_status: 'pending' as const },
        { step_number: 2, step_name: 'Subscription Plan', step_status: 'pending' as const },
        { step_number: 3, step_name: 'Branding Configuration', step_status: 'pending' as const },
        { step_number: 4, step_name: 'Feature Selection', step_status: 'pending' as const },
        { step_number: 5, step_name: 'Data Import', step_status: 'pending' as const },
        { step_number: 6, step_name: 'Team Invites', step_status: 'pending' as const }
      ];

      const stepsToInsert = stepTemplates.map(template => ({
        workflow_id: workflowData.id,
        ...template,
        step_data: {}
      }));

      const { data: stepsData, error: stepsError } = await supabase
        .from('onboarding_steps')
        .insert(stepsToInsert)
        .select();

      if (stepsError) {
        console.error('TenantDataService: Error creating steps:', stepsError);
        throw stepsError;
      }

      console.log('TenantDataService: Onboarding initialized successfully');
      return {
        workflow: workflowData,
        steps: stepsData || []
      };
    } catch (error) {
      console.error('TenantDataService: Error in initializeOnboardingForTenant:', error);
      throw error;
    }
  }

  async ensureOnboardingWorkflow(tenantId: string): Promise<string> {
    try {
      console.log('TenantDataService: Ensuring onboarding workflow exists for tenant:', tenantId);
      
      const existingWorkflow = await this.getOnboardingWorkflow(tenantId);
      if (existingWorkflow) {
        return existingWorkflow.id;
      }

      const initialized = await this.initializeOnboardingForTenant(tenantId);
      return initialized.workflow.id;
    } catch (error) {
      console.error('TenantDataService: Error ensuring workflow:', error);
      throw error;
    }
  }

  async getSubscriptionPlans(tenantId?: string) {
    try {
      console.log('TenantDataService: Getting subscription plans');
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) {
        console.error('TenantDataService: Error fetching subscription plans:', error);
        throw error;
      }

      console.log('TenantDataService: Retrieved subscription plans successfully');
      return data || [];
    } catch (error) {
      console.error('TenantDataService: Error in getSubscriptionPlans:', error);
      throw error;
    }
  }
}

export const tenantDataService = new TenantDataService();
