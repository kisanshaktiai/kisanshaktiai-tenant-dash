
import { BaseApiService } from './core/BaseApiService';
import { supabase } from '@/integrations/supabase/client';

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
  step_status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

class EnhancedOnboardingService extends BaseApiService {
  protected basePath = '/onboarding';

  async getOnboardingWorkflow(tenantId: string): Promise<OnboardingWorkflow | null> {
    try {
      const { data, error } = await supabase
        .from('onboarding_workflows')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch onboarding workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createOnboardingWorkflow(tenantId: string, workflowData: Partial<OnboardingWorkflow>): Promise<OnboardingWorkflow> {
    try {
      const { data, error } = await supabase
        .from('onboarding_workflows')
        .insert({
          tenant_id: tenantId,
          ...workflowData
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      throw new Error(`Failed to create onboarding workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateWorkflowStatus(workflowId: string, status: OnboardingWorkflow['status']): Promise<OnboardingWorkflow> {
    try {
      const { data, error } = await supabase
        .from('onboarding_workflows')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflowId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      throw new Error(`Failed to update workflow status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getOnboardingSteps(workflowId: string): Promise<OnboardingStep[]> {
    try {
      const { data, error } = await supabase
        .from('onboarding_steps')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('step_order');

      if (error) throw new Error(error.message);
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch onboarding steps: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async completeStep(stepId: string, stepData: any): Promise<OnboardingStep> {
    try {
      const { data, error } = await supabase
        .from('onboarding_steps')
        .update({
          step_status: 'completed',
          step_data: stepData,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', stepId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      throw new Error(`Failed to complete step: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const enhancedOnboardingService = new EnhancedOnboardingService();
