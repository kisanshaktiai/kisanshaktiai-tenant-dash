
import { BaseApiService } from './core/BaseApiService';
import { supabase } from '@/integrations/supabase/client';
import { onboardingTemplateService } from './OnboardingTemplateService';

export interface OnboardingWorkflow {
  id: string;
  tenant_id: string;
  workflow_name: string;
  workflow_type: string;
  template_data: any;
  current_step: number;
  total_steps: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface OnboardingStep {
  id: string;
  workflow_id: string;
  step_order: number;
  step_name: string;
  step_type: string;
  step_config: any;
  step_data: any;
  step_status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  step_number: number;
  step_description: string;
  is_required: boolean;
  estimated_time_minutes: number;
  started_at: string | null;
}

class EnhancedOnboardingService extends BaseApiService {
  protected basePath = '/onboarding';
  private cache = new Map<string, any>();

  // Transform database step to frontend format
  private transformDbStepToFrontend(dbStep: any): OnboardingStep {
    const stepData = typeof dbStep.step_data === 'object' ? dbStep.step_data : {};
    const displayName = stepData.display_name || onboardingTemplateService.getDisplayNameForStep(dbStep.step_name);
    
    return {
      id: dbStep.id,
      workflow_id: dbStep.workflow_id,
      step_order: dbStep.step_number,
      step_name: displayName, // Use display name for frontend
      step_type: stepData.step_type || 'standard',
      step_config: stepData.step_config || {},
      step_data: stepData,
      step_status: dbStep.step_status === 'failed' ? 'pending' : dbStep.step_status,
      completed_at: dbStep.completed_at,
      created_at: dbStep.created_at,
      updated_at: dbStep.updated_at,
      step_number: dbStep.step_number,
      step_description: stepData.step_description || `Complete ${displayName}`,
      is_required: stepData.is_required !== false,
      estimated_time_minutes: stepData.estimated_time_minutes || 15,
      started_at: dbStep.started_at || null
    };
  }

  async getOnboardingWorkflow(tenantId: string): Promise<OnboardingWorkflow | null> {
    try {
      console.log('EnhancedOnboardingService: Fetching workflow for tenant:', tenantId);
      
      const { data, error } = await supabase
        .from('onboarding_workflows')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (error) {
        console.error('EnhancedOnboardingService: Error fetching workflow:', error);
        throw new Error(error.message);
      }
      
      if (data) {
        const metadata = typeof data.metadata === 'object' && data.metadata !== null ? data.metadata as Record<string, any> : {};
        
        const workflow: OnboardingWorkflow = {
          id: data.id,
          tenant_id: data.tenant_id,
          workflow_name: 'Tenant Onboarding',
          workflow_type: 'standard',
          template_data: {},
          current_step: data.current_step,
          total_steps: data.total_steps,
          status: data.status as 'pending' | 'in_progress' | 'completed' | 'failed',
          metadata,
          created_at: data.created_at,
          updated_at: data.updated_at
        };

        console.log('EnhancedOnboardingService: Found workflow:', workflow.id);
        return workflow;
      }
      
      console.log('EnhancedOnboardingService: No workflow found for tenant:', tenantId);
      return null;
    } catch (error) {
      console.error('EnhancedOnboardingService: Failed to fetch workflow:', error);
      throw new Error(`Failed to fetch onboarding workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createOnboardingWorkflow(tenantId: string, workflowData: Partial<OnboardingWorkflow>): Promise<OnboardingWorkflow> {
    try {
      console.log('EnhancedOnboardingService: Creating workflow for tenant:', tenantId);
      
      // Get tenant subscription plan for template selection
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('subscription_plan')
        .eq('id', tenantId)
        .single();

      const subscriptionPlan = tenantData?.subscription_plan || 'Kisan_Basic';
      
      const { data, error } = await supabase
        .from('onboarding_workflows')
        .insert({
          tenant_id: tenantId,
          current_step: workflowData.current_step || 1,
          total_steps: workflowData.total_steps || 6,
          status: workflowData.status || 'pending',
          metadata: {
            ...workflowData.metadata,
            workflow_name: workflowData.workflow_name || 'Tenant Onboarding',
            workflow_type: workflowData.workflow_type || 'standard',
            template_data: workflowData.template_data || {},
            subscription_plan: subscriptionPlan
          }
        })
        .select()
        .single();

      if (error) {
        console.error('EnhancedOnboardingService: Error creating workflow:', error);
        throw new Error(error.message);
      }
      
      const metadata = typeof data.metadata === 'object' && data.metadata !== null ? data.metadata as Record<string, any> : {};
      
      const workflow: OnboardingWorkflow = {
        id: data.id,
        tenant_id: data.tenant_id,
        workflow_name: metadata.workflow_name || 'Tenant Onboarding',
        workflow_type: metadata.workflow_type || 'standard',
        template_data: metadata.template_data || {},
        current_step: data.current_step,
        total_steps: data.total_steps,
        status: data.status as 'pending' | 'in_progress' | 'completed' | 'failed',
        metadata,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      console.log('EnhancedOnboardingService: Created workflow:', workflow.id);
      return workflow;
    } catch (error) {
      console.error('EnhancedOnboardingService: Failed to create workflow:', error);
      throw new Error(`Failed to create onboarding workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getOnboardingSteps(workflowId: string): Promise<OnboardingStep[]> {
    try {
      console.log('EnhancedOnboardingService: Fetching steps for workflow:', workflowId);
      
      const { data, error } = await supabase
        .from('onboarding_steps')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('step_number');

      if (error) {
        console.error('EnhancedOnboardingService: Error fetching steps:', error);
        throw new Error(error.message);
      }
      
      const steps = (data || []).map(step => this.transformDbStepToFrontend(step));
      console.log('EnhancedOnboardingService: Retrieved steps:', steps.length);
      
      return steps;
    } catch (error) {
      console.error('EnhancedOnboardingService: Failed to fetch steps:', error);
      throw new Error(`Failed to fetch onboarding steps: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async completeStep(stepId: string, stepData: any, tenantId?: string): Promise<OnboardingStep> {
    try {
      console.log('EnhancedOnboardingService: Completing step:', { stepId, tenantId });
      
      const { data, error } = await supabase
        .from('onboarding_steps')
        .update({
          step_status: 'completed',
          step_data: stepData || {},
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', stepId)
        .select()
        .single();

      if (error) {
        console.error('EnhancedOnboardingService: Error completing step:', error);
        throw new Error(error.message);
      }
      
      return this.transformDbStepToFrontend(data);
    } catch (error) {
      console.error('EnhancedOnboardingService: Failed to complete step:', error);
      throw new Error(`Failed to complete step: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateStepStatus(stepId: string, status: OnboardingStep['step_status'], stepData?: any, tenantId?: string) {
    try {
      console.log('EnhancedOnboardingService: Updating step status:', { stepId, status, tenantId });
      
      const updateData: any = {
        step_status: status,
        step_data: stepData || {},
        updated_at: new Date().toISOString()
      };

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (status === 'in_progress') {
        updateData.started_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('onboarding_steps')
        .update(updateData)
        .eq('id', stepId)
        .select()
        .single();

      if (error) {
        console.error('EnhancedOnboardingService: Error updating step status:', error);
        throw new Error(error.message);
      }
      
      return this.transformDbStepToFrontend(data);
    } catch (error) {
      console.error('EnhancedOnboardingService: Failed to update step status:', error);
      throw new Error(`Failed to update step status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Ensures workflow status is consistent with step statuses
   * If all steps are completed, mark workflow as completed
   */
  async ensureWorkflowConsistency(tenantId: string): Promise<void> {
    try {
      const workflow = await this.getOnboardingWorkflow(tenantId);
      if (!workflow) return;
      
      const steps = await this.getOnboardingSteps(workflow.id);
      const allCompleted = steps.every(s => s.step_status === 'completed');
      
      // If all steps completed but workflow not marked complete
      if (allCompleted && workflow.status !== 'completed' && steps.length > 0) {
        console.log('EnhancedOnboardingService: Fixing workflow status inconsistency');
        await this.completeWorkflow(workflow.id, tenantId);
        
        // Update tenant onboarding_completed flag
        const { error } = await supabase
          .from('tenants')
          .update({ onboarding_completed: true })
          .eq('id', tenantId);
          
        if (error) throw error;
      }
    } catch (error) {
      console.error('EnhancedOnboardingService: Error ensuring workflow consistency:', error);
    }
  }

  async isOnboardingComplete(tenantId: string): Promise<boolean> {
    try {
      const workflow = await this.getOnboardingWorkflow(tenantId);
      if (!workflow) return false;
      
      const steps = await this.getOnboardingSteps(workflow.id);
      const completedSteps = steps.filter(step => step.step_status === 'completed');
      
      const isComplete = completedSteps.length === steps.length && steps.length > 0;
      console.log('EnhancedOnboardingService: Onboarding complete check:', {
        tenantId,
        totalSteps: steps.length,
        completedSteps: completedSteps.length,
        isComplete
      });
      
      return isComplete;
    } catch (error) {
      console.error('EnhancedOnboardingService: Error checking completion:', error);
      return false;
    }
  }

  async getOnboardingData(tenantId: string) {
    try {
      console.log('EnhancedOnboardingService: Getting complete onboarding data for tenant:', tenantId);
      
      // Ensure consistency before fetching
      await this.ensureWorkflowConsistency(tenantId);
      
      const workflow = await this.getOnboardingWorkflow(tenantId);
      if (!workflow) {
        console.log('EnhancedOnboardingService: No workflow found');
        return null;
      }
      
      const steps = await this.getOnboardingSteps(workflow.id);
      
      const result = {
        workflow,
        steps
      };
      
      console.log('EnhancedOnboardingService: Complete onboarding data:', {
        workflowId: workflow.id,
        stepCount: steps.length
      });
      
      return result;
    } catch (error) {
      console.error('EnhancedOnboardingService: Failed to get onboarding data:', error);
      throw new Error(`Failed to get onboarding data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async initializeOnboardingWorkflow(tenantId: string) {
    try {
      console.log('EnhancedOnboardingService: Initializing workflow for tenant:', tenantId);
      
      // Check if workflow already exists
      const existing = await this.getOnboardingWorkflow(tenantId);
      if (existing) {
        console.log('EnhancedOnboardingService: Workflow already exists, returning existing data');
        return this.getOnboardingData(tenantId);
      }
      
      // Get tenant subscription plan
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('subscription_plan')
        .eq('id', tenantId)
        .single();

      const subscriptionPlan = tenantData?.subscription_plan || 'Kisan_Basic';
      
      // Create new workflow
      const workflow = await this.createOnboardingWorkflow(tenantId, {
        current_step: 1,
        total_steps: 6,
        status: 'pending',
        metadata: {
          subscription_plan: subscriptionPlan
        }
      });
      
      // Create steps using template service
      await onboardingTemplateService.createStepsFromTemplate(workflow.id, tenantId, subscriptionPlan);
      
      console.log('EnhancedOnboardingService: Successfully initialized workflow');
      return this.getOnboardingData(tenantId);
    } catch (error) {
      console.error('EnhancedOnboardingService: Failed to initialize workflow:', error);
      throw new Error(`Failed to initialize onboarding workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async completeWorkflow(workflowId: string, tenantId?: string) {
    try {
      console.log('EnhancedOnboardingService: Completing workflow:', workflowId);
      
      const { data, error } = await supabase
        .from('onboarding_workflows')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', workflowId)
        .select()
        .single();

      if (error) {
        console.error('EnhancedOnboardingService: Error completing workflow:', error);
        throw new Error(error.message);
      }
      
      const metadata = typeof data.metadata === 'object' && data.metadata !== null ? data.metadata as Record<string, any> : {};
      
      return {
        id: data.id,
        tenant_id: data.tenant_id,
        workflow_name: metadata.workflow_name || 'Tenant Onboarding',
        workflow_type: metadata.workflow_type || 'standard',
        template_data: metadata.template_data || {},
        current_step: data.current_step,
        total_steps: data.total_steps,
        status: data.status as 'pending' | 'in_progress' | 'completed' | 'failed',
        metadata,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('EnhancedOnboardingService: Failed to complete workflow:', error);
      throw new Error(`Failed to complete workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateOnboardingIntegrity(tenantId: string) {
    try {
      const workflow = await this.getOnboardingWorkflow(tenantId);
      if (!workflow) {
        return { isValid: false, repaired: false, issues: ['No workflow found'] };
      }
      
      const steps = await this.getOnboardingSteps(workflow.id);
      if (steps.length === 0) {
        return { isValid: false, repaired: false, issues: ['No steps found'] };
      }
      
      return { isValid: true, repaired: false, issues: [] };
    } catch (error) {
      return { isValid: false, repaired: false, issues: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

export const enhancedOnboardingService = new EnhancedOnboardingService();
