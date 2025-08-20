import { tenantDataService } from './TenantDataService';

export interface OnboardingWorkflow {
  id: string;
  tenant_id: string;
  workflow_name: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
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
  step_status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  step_data: Record<string, any>;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  validation_errors?: Record<string, any>;
}

export class OnboardingService {
  async getCompleteOnboardingData(tenantId: string) {
    try {
      console.log('OnboardingService: Getting complete onboarding data for tenant:', tenantId);
      return await tenantDataService.getCompleteOnboardingData(tenantId);
    } catch (error) {
      console.error('OnboardingService: Error getting complete onboarding data:', error);
      throw error;
    }
  }

  async getOnboardingWorkflow(tenantId: string): Promise<OnboardingWorkflow | null> {
    try {
      console.log('OnboardingService: Fetching onboarding workflow for tenant:', tenantId);
      
      const data = await tenantDataService.getOnboardingWorkflow(tenantId);
      
      if (!data) {
        console.log('OnboardingService: No workflow found for tenant:', tenantId);
        return null;
      }

      return {
        id: data.id,
        tenant_id: data.tenant_id,
        workflow_name: 'Tenant Onboarding', // Default since property doesn't exist in schema
        status: data.status as 'not_started' | 'in_progress' | 'completed' | 'paused',
        progress_percentage: 0, // Default since property doesn't exist in schema
        current_step: data.current_step || 1,
        total_steps: data.total_steps || 0,
        started_at: data.started_at,
        completed_at: data.completed_at,
        metadata: (data.metadata as Record<string, any>) || {},
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('OnboardingService: Error fetching onboarding workflow:', error);
      return null;
    }
  }

  async getWorkflowByTenantId(tenantId: string): Promise<OnboardingWorkflow | null> {
    return this.getOnboardingWorkflow(tenantId);
  }

  async getWorkflowSteps(workflowId: string, tenantId: string): Promise<OnboardingStep[]> {
    try {
      console.log('OnboardingService: Fetching workflow steps:', { workflowId, tenantId });
      
      const data = await tenantDataService.getOnboardingSteps(tenantId, workflowId);
      
      if (!data || data.length === 0) {
        console.log('OnboardingService: No steps found for workflow:', workflowId);
        return [];
      }

      return data.map(step => ({
        id: step.id,
        workflow_id: step.workflow_id,
        step_number: step.step_number,
        step_name: step.step_name,
        step_status: step.step_status === 'failed' ? 'pending' : step.step_status,
        step_data: (step.step_data as Record<string, any>) || {},
        completed_at: step.completed_at,
        created_at: step.created_at,
        updated_at: step.updated_at,
        validation_errors: (step.validation_errors as Record<string, any>) || {}
      }));
    } catch (error) {
      console.error('OnboardingService: Error fetching workflow steps:', error);
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
        console.error('OnboardingService: Tenant ID is required for updating step status');
        return false;
      }

      console.log('OnboardingService: Updating step status:', { stepId, stepStatus, stepData, tenantId });
      
      await tenantDataService.updateOnboardingStep(tenantId, stepId, {
        step_status: stepStatus,
        step_data: stepData || {},
        updated_at: new Date().toISOString(),
        ...(stepStatus === 'completed' && { completed_at: new Date().toISOString() })
      });

      return true;
    } catch (error) {
      console.error('OnboardingService: Error updating step status:', error);
      return false;
    }
  }

  async completeStep(stepId: string, stepData?: any, tenantId?: string): Promise<boolean> {
    try {
      if (!tenantId) {
        console.error('OnboardingService: Tenant ID is required for completing step');
        return false;
      }

      console.log('OnboardingService: Completing step:', { stepId, stepData, tenantId });
      
      await tenantDataService.completeOnboardingStep(tenantId, stepId, stepData);
      return true;
    } catch (error) {
      console.error('OnboardingService: Error completing step:', error);
      return false;
    }
  }

  async completeWorkflow(workflowId: string, tenantId: string): Promise<boolean> {
    try {
      console.log('OnboardingService: Completing onboarding workflow:', { workflowId, tenantId });
      
      const result = await tenantDataService.completeOnboardingWorkflow(tenantId, workflowId);
      return result?.success || false;
    } catch (error) {
      console.error('OnboardingService: Error completing workflow:', error);
      return false;
    }
  }

  async isOnboardingComplete(tenantId: string): Promise<boolean> {
    try {
      const workflow = await this.getOnboardingWorkflow(tenantId);
      return workflow?.status === 'completed' || false;
    } catch (error) {
      console.error('OnboardingService: Error checking onboarding completion:', error);
      return false;
    }
  }

  async ensureWorkflowExists(tenantId: string): Promise<string> {
    try {
      const workflowId = await tenantDataService.ensureOnboardingWorkflow(tenantId);
      return workflowId;
    } catch (error) {
      console.error('OnboardingService: Error ensuring workflow exists:', error);
      throw error;
    }
  }
}

export const onboardingService = new OnboardingService();
