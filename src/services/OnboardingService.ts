
import { supabase } from '@/integrations/supabase/client';

export interface OnboardingWorkflow {
  id: string;
  tenant_id: string;
  workflow_name: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  current_step: number;
  total_steps: number;
  started_at?: string;
  completed_at?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface OnboardingStep {
  id: string;
  workflow_id: string;
  step_number: number;
  step_name: string;
  step_description?: string;
  step_status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  is_required: boolean;
  estimated_time_minutes?: number;
  step_data: any;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

class OnboardingService {
  async getWorkflowByTenantId(tenantId: string): Promise<OnboardingWorkflow | null> {
    const { data, error } = await supabase
      .from('onboarding_workflows')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      console.error('Error fetching onboarding workflow:', error);
      return null;
    }

    return data;
  }

  async getWorkflowSteps(workflowId: string): Promise<OnboardingStep[]> {
    const { data, error } = await supabase
      .from('onboarding_steps')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('step_number');

    if (error) {
      console.error('Error fetching onboarding steps:', error);
      return [];
    }

    return data;
  }

  async updateStepStatus(stepId: string, status: OnboardingStep['step_status'], stepData?: any): Promise<boolean> {
    const updateData: any = {
      step_status: status,
      updated_at: new Date().toISOString()
    };

    if (status === 'in_progress') {
      updateData.started_at = new Date().toISOString();
    } else if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    if (stepData) {
      updateData.step_data = stepData;
    }

    const { error } = await supabase
      .from('onboarding_steps')
      .update(updateData)
      .eq('id', stepId);

    if (error) {
      console.error('Error updating step status:', error);
      return false;
    }

    return true;
  }

  async updateWorkflowProgress(workflowId: string): Promise<boolean> {
    // Get all steps for this workflow
    const steps = await this.getWorkflowSteps(workflowId);
    const completedSteps = steps.filter(step => step.step_status === 'completed');
    const progressPercentage = Math.round((completedSteps.length / steps.length) * 100);
    
    const updateData: any = {
      progress_percentage: progressPercentage,
      current_step: completedSteps.length + 1,
      updated_at: new Date().toISOString()
    };

    // Update workflow status based on progress
    if (progressPercentage === 0) {
      updateData.status = 'not_started';
    } else if (progressPercentage === 100) {
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
    } else {
      updateData.status = 'in_progress';
      if (!steps.find(step => step.started_at)) {
        updateData.started_at = new Date().toISOString();
      }
    }

    const { error } = await supabase
      .from('onboarding_workflows')
      .update(updateData)
      .eq('id', workflowId);

    if (error) {
      console.error('Error updating workflow progress:', error);
      return false;
    }

    return true;
  }

  async completeStep(stepId: string, stepData?: any): Promise<boolean> {
    const success = await this.updateStepStatus(stepId, 'completed', stepData);
    if (success) {
      // Get the workflow ID to update progress
      const { data: step } = await supabase
        .from('onboarding_steps')
        .select('workflow_id')
        .eq('id', stepId)
        .single();
      
      if (step) {
        await this.updateWorkflowProgress(step.workflow_id);
      }
    }
    return success;
  }

  async isOnboardingComplete(tenantId: string): Promise<boolean> {
    const workflow = await this.getWorkflowByTenantId(tenantId);
    return workflow?.status === 'completed' || false;
  }
}

export const onboardingService = new OnboardingService();
