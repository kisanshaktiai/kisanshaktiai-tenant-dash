
import { tenantDataService } from './TenantDataService';
import { toast } from 'sonner';

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

export interface OnboardingData {
  workflow: OnboardingWorkflow | null;
  steps: OnboardingStep[];
}

class EnhancedOnboardingService {
  private retryAttempts = 3;
  private retryDelay = 1000;

  private async withRetry<T>(operation: () => Promise<T>, context: string): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`${context}: Attempt ${attempt}/${this.retryAttempts}`);
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.error(`${context}: Attempt ${attempt} failed:`, error);
        
        if (attempt < this.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }
    
    throw lastError;
  }

  async initializeOnboardingWorkflow(tenantId: string): Promise<OnboardingData> {
    return this.withRetry(async () => {
      console.log('EnhancedOnboardingService: Initializing workflow for tenant:', tenantId);
      
      if (!tenantId || tenantId.trim() === '') {
        throw new Error('Tenant ID is required for onboarding initialization');
      }

      // First ensure the workflow exists
      const { workflow_id } = await tenantDataService.ensureOnboardingWorkflow(tenantId);
      console.log('EnhancedOnboardingService: Workflow ensured with ID:', workflow_id);
      
      // Get complete onboarding data
      const onboardingData = await tenantDataService.getCompleteOnboardingData(tenantId);
      
      if (!onboardingData?.workflow) {
        throw new Error('Failed to initialize onboarding workflow');
      }
      
      console.log('EnhancedOnboardingService: Workflow initialized successfully:', {
        workflowId: onboardingData.workflow.id,
        stepCount: onboardingData.steps.length
      });
      
      return onboardingData;
    }, 'initializeOnboardingWorkflow');
  }

  async getOnboardingData(tenantId: string): Promise<OnboardingData | null> {
    return this.withRetry(async () => {
      console.log('EnhancedOnboardingService: Getting onboarding data for tenant:', tenantId);
      
      try {
        const data = await tenantDataService.getCompleteOnboardingData(tenantId);
        
        if (!data?.workflow) {
          console.log('EnhancedOnboardingService: No workflow found, initializing...');
          return await this.initializeOnboardingWorkflow(tenantId);
        }
        
        return data;
      } catch (error) {
        console.error('EnhancedOnboardingService: Error getting onboarding data:', error);
        
        // If we can't get data, try to initialize
        if (error.message?.includes('workflow') || error.message?.includes('not found')) {
          console.log('EnhancedOnboardingService: Workflow not found, initializing...');
          return await this.initializeOnboardingWorkflow(tenantId);
        }
        
        throw error;
      }
    }, 'getOnboardingData');
  }

  async completeStep(stepId: string, stepData?: any, tenantId?: string): Promise<boolean> {
    return this.withRetry(async () => {
      if (!tenantId) {
        throw new Error('Tenant ID is required for completing step');
      }

      console.log('EnhancedOnboardingService: Completing step:', { stepId, stepData, tenantId });
      
      await tenantDataService.completeOnboardingStep(tenantId, stepId, stepData);
      
      toast.success('Step completed successfully!');
      return true;
    }, 'completeStep');
  }

  async updateStepStatus(
    stepId: string, 
    stepStatus: OnboardingStep['step_status'], 
    stepData?: any,
    tenantId?: string
  ): Promise<boolean> {
    return this.withRetry(async () => {
      if (!tenantId) {
        throw new Error('Tenant ID is required for updating step status');
      }

      console.log('EnhancedOnboardingService: Updating step status:', { stepId, stepStatus, stepData, tenantId });
      
      await tenantDataService.updateOnboardingStep(tenantId, stepId, {
        step_status: stepStatus,
        step_data: stepData || {},
        updated_at: new Date().toISOString(),
        ...(stepStatus === 'completed' && { completed_at: new Date().toISOString() }),
        ...(stepStatus === 'in_progress' && { started_at: new Date().toISOString() })
      });

      if (stepStatus === 'completed') {
        toast.success('Step completed successfully!');
      }
      
      return true;
    }, 'updateStepStatus');
  }

  async completeWorkflow(workflowId: string, tenantId: string): Promise<boolean> {
    return this.withRetry(async () => {
      console.log('EnhancedOnboardingService: Completing workflow:', { workflowId, tenantId });
      
      await tenantDataService.completeOnboardingWorkflow(tenantId, workflowId);
      
      toast.success('🎉 Onboarding completed successfully! Welcome aboard!');
      return true;
    }, 'completeWorkflow');
  }

  async isOnboardingComplete(tenantId: string): Promise<boolean> {
    return this.withRetry(async () => {
      const data = await this.getOnboardingData(tenantId);
      return data?.workflow?.status === 'completed' || false;
    }, 'isOnboardingComplete');
  }

  async getOnboardingProgress(tenantId: string): Promise<number> {
    return this.withRetry(async () => {
      const data = await this.getOnboardingData(tenantId);
      
      if (!data?.steps || data.steps.length === 0) {
        return 0;
      }
      
      const completedSteps = data.steps.filter(step => step.step_status === 'completed').length;
      return Math.round((completedSteps / data.steps.length) * 100);
    }, 'getOnboardingProgress');
  }

  // Validation and repair methods
  async validateOnboardingIntegrity(tenantId: string): Promise<{ isValid: boolean; issues: string[]; repaired: boolean }> {
    return this.withRetry(async () => {
      const issues: string[] = [];
      let repaired = false;
      
      try {
        const data = await tenantDataService.getCompleteOnboardingData(tenantId);
        
        if (!data?.workflow) {
          issues.push('No onboarding workflow found');
          console.log('Repairing: Creating missing workflow');
          await this.initializeOnboardingWorkflow(tenantId);
          repaired = true;
        } else {
          if (!data.steps || data.steps.length === 0) {
            issues.push('No onboarding steps found');
            // Steps would be created by initializeOnboardingWorkflow if needed
          }
          
          if (data.workflow.total_steps !== data.steps.length) {
            issues.push(`Step count mismatch: expected ${data.workflow.total_steps}, found ${data.steps.length}`);
          }
        }
        
        return {
          isValid: issues.length === 0,
          issues,
          repaired
        };
      } catch (error) {
        console.error('Validation failed:', error);
        return {
          isValid: false,
          issues: [`Validation error: ${error.message}`],
          repaired: false
        };
      }
    }, 'validateOnboardingIntegrity');
  }
}

export const enhancedOnboardingService = new EnhancedOnboardingService();
