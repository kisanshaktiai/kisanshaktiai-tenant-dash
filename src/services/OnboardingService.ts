import { supabase } from '@/integrations/supabase/client';

export interface OnboardingWorkflow {
  id: string;
  tenant_id: string;
  workflow_name: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  current_step: number;
  total_steps: number;
  started_at: string | null;
  completed_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface OnboardingStep {
  id: string;
  workflow_id: string;
  step_number: number;
  step_name: string;
  step_description: string;
  step_status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  is_required: boolean;
  estimated_time_minutes: number;
  step_data: Record<string, any>;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export class OnboardingService {
  constructor() {}

  async startOnboardingWorkflow(tenantId: string): Promise<OnboardingWorkflow | null> {
    try {
      // Check if a workflow already exists for this tenant
      const existingWorkflow = await this.getOnboardingWorkflow(tenantId);
      if (existingWorkflow) {
        console.warn(`Onboarding workflow already exists for tenant ${tenantId}`);
        return existingWorkflow;
      }

      // Create a new onboarding workflow
      const { data: workflowData, error: workflowError } = await supabase
        .from('onboarding_workflows')
        .insert({
          tenant_id,
          status: 'in_progress',
          current_step: 1,
          total_steps: 5, // Example: 5 steps in the workflow
        })
        .select()
        .single();

      if (workflowError) {
        console.error('Error creating onboarding workflow:', workflowError);
        return null;
      }

      if (!workflowData) {
        console.error('No workflow data returned after creation');
        return null;
      }

      // Create the onboarding steps
      const steps = [
        { step_number: 1, step_name: 'Connect Data Sources' },
        { step_number: 2, step_name: 'Configure Integrations' },
        { step_number: 3, step_name: 'Set Up User Roles' },
        { step_number: 4, step_name: 'Customize Branding' },
        { step_number: 5, step_name: 'Launch Platform' },
      ];

      const stepsToInsert = steps.map(step => ({
        workflow_id: workflowData.id,
        step_number: step.step_number,
        step_name: step.step_name,
        step_status: 'pending',
      }));

      const { error: stepsError } = await supabase
        .from('onboarding_steps')
        .insert(stepsToInsert);

      if (stepsError) {
        console.error('Error creating onboarding steps:', stepsError);
        return null;
      }

      return this.getOnboardingWorkflow(tenantId);
    } catch (error) {
      console.error('Unexpected error starting workflow:', error);
      return null;
    }
  }

  async getOnboardingWorkflow(tenantId: string): Promise<OnboardingWorkflow | null> {
    try {
      const { data, error } = await supabase
        .from('onboarding_workflows')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        console.error('Error fetching onboarding workflow:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      // Map database response to interface, providing default values
      return {
        id: data.id,
        tenant_id: data.tenant_id,
        workflow_name: 'Onboarding Workflow', // Default value since column doesn't exist
        status: (data.status === 'not_started' || data.status === 'in_progress' || data.status === 'completed') 
          ? data.status as 'not_started' | 'in_progress' | 'completed'
          : 'not_started',
        progress_percentage: Math.round((data.current_step / data.total_steps) * 100), // Calculate from current/total
        current_step: data.current_step,
        total_steps: data.total_steps,
        started_at: data.started_at,
        completed_at: data.completed_at,
        metadata: data.metadata || {},
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Unexpected error fetching workflow:', error);
      return null;
    }
  }

  async getWorkflowSteps(workflowId: string): Promise<OnboardingStep[]> {
    try {
      const { data, error } = await supabase
        .from('onboarding_steps')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('step_number');

      if (error) {
        console.error('Error fetching workflow steps:', error);
        return [];
      }

      if (!data) {
        return [];
      }

      // Map database response to interface, providing default values
      return data.map(step => ({
        id: step.id,
        workflow_id: step.workflow_id,
        step_number: step.step_number,
        step_name: step.step_name,
        step_description: 'Step description', // Default value since column doesn't exist
        step_status: (step.step_status === 'failed') 
          ? 'pending' // Map 'failed' to 'pending' since it's not in our interface
          : step.step_status as 'pending' | 'in_progress' | 'completed' | 'skipped',
        is_required: true, // Default value since column doesn't exist
        estimated_time_minutes: 30, // Default value since column doesn't exist
        step_data: step.step_data || {},
        started_at: null, // Default value since column doesn't exist
        completed_at: step.completed_at,
        created_at: step.created_at,
        updated_at: step.updated_at
      }));
    } catch (error) {
      console.error('Unexpected error fetching steps:', error);
      return [];
    }
  }

  async updateStepStatus(stepId: string, stepStatus: OnboardingStep['step_status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('onboarding_steps')
        .update({ step_status })
        .eq('id', stepId);

      if (error) {
        console.error('Error updating step status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error updating step status:', error);
      return false;
    }
  }

  async completeOnboardingWorkflow(tenantId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('onboarding_workflows')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('tenant_id', tenantId);

      if (error) {
        console.error('Error completing onboarding workflow:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error completing workflow:', error);
      return false;
    }
  }
}

export const onboardingService = new OnboardingService();
