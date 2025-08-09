
import { tenantDataService } from './TenantDataService';

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
  async getOnboardingWorkflow(tenantId: string): Promise<OnboardingWorkflow | null> {
    try {
      console.log('Fetching onboarding workflow for tenant:', tenantId);
      
      const data = await tenantDataService.getOnboardingWorkflow(tenantId);
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.log('No workflow found for tenant:', tenantId);
        return null;
      }

      const workflow = Array.isArray(data) ? data[0] : data;

      // Map database response to interface
      return {
        id: workflow.id,
        tenant_id: workflow.tenant_id,
        workflow_name: workflow.workflow_name || 'Onboarding Workflow',
        status: workflow.status || 'not_started',
        progress_percentage: workflow.progress_percentage || 0,
        current_step: workflow.current_step || 1,
        total_steps: workflow.total_steps || 0,
        started_at: workflow.started_at,
        completed_at: workflow.completed_at,
        metadata: workflow.metadata || {},
        created_at: workflow.created_at,
        updated_at: workflow.updated_at
      };
    } catch (error) {
      console.error('Error fetching onboarding workflow:', error);
      return null;
    }
  }

  async getWorkflowByTenantId(tenantId: string): Promise<OnboardingWorkflow | null> {
    return this.getOnboardingWorkflow(tenantId);
  }

  async getWorkflowSteps(workflowId: string, tenantId: string): Promise<OnboardingStep[]> {
    try {
      console.log('Fetching workflow steps:', { workflowId, tenantId });
      
      const data = await tenantDataService.getOnboardingSteps(tenantId, workflowId);
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.log('No steps found for workflow:', workflowId);
        return [];
      }

      const steps = Array.isArray(data) ? data : [data];

      // Filter steps that belong to the workflow and map to interface
      return steps
        .filter(step => step.workflow_id === workflowId)
        .map(step => ({
          id: step.id,
          workflow_id: step.workflow_id,
          step_number: step.step_number,
          step_name: step.step_name,
          step_description: step.step_description || 'Step description',
          step_status: step.step_status === 'failed' ? 'pending' : step.step_status,
          is_required: step.is_required !== false,
          estimated_time_minutes: step.estimated_time_minutes || 30,
          step_data: step.step_data || {},
          started_at: step.started_at,
          completed_at: step.completed_at,
          created_at: step.created_at,
          updated_at: step.updated_at
        }));
    } catch (error) {
      console.error('Error fetching workflow steps:', error);
      return [];
    }
  }

  async updateStepStatus(
    stepId: string, 
    stepStatus: OnboardingStep['step_status'], 
    stepData?: any,
    tenantId?: string
  ): Promise<boolean> {
    try {
      if (!tenantId) {
        console.error('Tenant ID is required for updating step status');
        return false;
      }

      console.log('Updating step status:', { stepId, stepStatus, stepData, tenantId });
      
      await tenantDataService.updateOnboardingStep(tenantId, stepId, {
        step_status: stepStatus,
        step_data: stepData || null,
        updated_at: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error updating step status:', error);
      return false;
    }
  }

  async completeStep(stepId: string, stepData?: any, tenantId?: string): Promise<boolean> {
    return this.updateStepStatus(stepId, 'completed', stepData, tenantId);
  }

  async isOnboardingComplete(tenantId: string): Promise<boolean> {
    try {
      const workflow = await this.getOnboardingWorkflow(tenantId);
      return workflow?.status === 'completed' || false;
    } catch (error) {
      console.error('Error checking onboarding completion:', error);
      return false;
    }
  }
}

export const onboardingService = new OnboardingService();
