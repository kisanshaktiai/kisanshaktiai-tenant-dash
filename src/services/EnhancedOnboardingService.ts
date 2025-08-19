
import { tenantDataService } from './TenantDataService';
import { OnboardingStep, OnboardingWorkflow } from './OnboardingService';

export interface OnboardingData {
  workflow: OnboardingWorkflow | null;
  steps: OnboardingStep[];
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  repaired: boolean;
}

class EnhancedOnboardingService {
  async getOnboardingData(tenantId: string): Promise<OnboardingData> {
    try {
      console.log('EnhancedOnboardingService: Getting onboarding data for tenant:', tenantId);
      
      // Get complete onboarding data with workflow creation if needed
      const data = await tenantDataService.getCompleteOnboardingData(tenantId);
      
      if (!data || !data.workflow) {
        console.log('EnhancedOnboardingService: No workflow found, initializing...');
        return await this.initializeOnboardingWorkflow(tenantId);
      }
      
      console.log('EnhancedOnboardingService: Retrieved onboarding data successfully');
      return {
        workflow: data.workflow,
        steps: data.steps || []
      };
    } catch (error) {
      console.error('EnhancedOnboardingService: Error getting onboarding data:', error);
      throw error;
    }
  }

  async initializeOnboardingWorkflow(tenantId: string): Promise<OnboardingData> {
    try {
      console.log('EnhancedOnboardingService: Initializing onboarding workflow for tenant:', tenantId);
      
      const data = await tenantDataService.initializeOnboardingForTenant(tenantId);
      
      if (!data || !data.workflow) {
        throw new Error('Failed to initialize onboarding workflow');
      }
      
      console.log('EnhancedOnboardingService: Workflow initialized successfully');
      return {
        workflow: data.workflow,
        steps: data.steps || []
      };
    } catch (error) {
      console.error('EnhancedOnboardingService: Error initializing workflow:', error);
      throw error;
    }
  }

  async completeStep(stepId: string, stepData?: any, tenantId?: string): Promise<boolean> {
    if (!tenantId) {
      throw new Error('Tenant ID is required for completing step');
    }

    try {
      console.log('EnhancedOnboardingService: Completing step:', { stepId, tenantId });
      
      await tenantDataService.completeOnboardingStep(tenantId, stepId, stepData);
      
      console.log('EnhancedOnboardingService: Step completed successfully');
      return true;
    } catch (error) {
      console.error('EnhancedOnboardingService: Error completing step:', error);
      throw error;
    }
  }

  async updateStepStatus(
    stepId: string, 
    status: 'pending' | 'in_progress' | 'completed' | 'skipped', 
    stepData?: any, 
    tenantId?: string
  ): Promise<boolean> {
    if (!tenantId) {
      throw new Error('Tenant ID is required for updating step status');
    }

    try {
      console.log('EnhancedOnboardingService: Updating step status:', { stepId, status, tenantId });
      
      await tenantDataService.updateOnboardingStep(tenantId, stepId, {
        step_status: status,
        step_data: stepData || {},
        updated_at: new Date().toISOString(),
        ...(status === 'completed' && { completed_at: new Date().toISOString() }),
        ...(status === 'in_progress' && { started_at: new Date().toISOString() })
      });
      
      console.log('EnhancedOnboardingService: Step status updated successfully');
      return true;
    } catch (error) {
      console.error('EnhancedOnboardingService: Error updating step status:', error);
      throw error;
    }
  }

  async completeWorkflow(workflowId: string, tenantId: string): Promise<boolean> {
    try {
      console.log('EnhancedOnboardingService: Completing workflow:', { workflowId, tenantId });
      
      const result = await tenantDataService.completeOnboardingWorkflow(tenantId, workflowId);
      
      if (!result || !result.success) {
        throw new Error('Failed to complete workflow');
      }
      
      console.log('EnhancedOnboardingService: Workflow completed successfully');
      return true;
    } catch (error) {
      console.error('EnhancedOnboardingService: Error completing workflow:', error);
      throw error;
    }
  }

  async isOnboardingComplete(tenantId: string): Promise<boolean> {
    try {
      console.log('EnhancedOnboardingService: Checking onboarding completion for tenant:', tenantId);
      
      const data = await this.getOnboardingData(tenantId);
      const isComplete = data?.workflow?.status === 'completed';
      
      console.log('EnhancedOnboardingService: Onboarding completion status:', isComplete);
      return isComplete;
    } catch (error) {
      console.error('EnhancedOnboardingService: Error checking completion status:', error);
      return false;
    }
  }

  async validateOnboardingIntegrity(tenantId: string): Promise<ValidationResult> {
    try {
      console.log('EnhancedOnboardingService: Validating onboarding integrity for tenant:', tenantId);
      
      const data = await this.getOnboardingData(tenantId);
      const issues: string[] = [];
      
      if (!data.workflow) {
        issues.push('Missing onboarding workflow');
      }
      
      if (!data.steps || data.steps.length === 0) {
        issues.push('Missing onboarding steps');
      }
      
      const isValid = issues.length === 0;
      
      console.log('EnhancedOnboardingService: Validation result:', { isValid, issues });
      
      return {
        isValid,
        issues,
        repaired: false
      };
    } catch (error) {
      console.error('EnhancedOnboardingService: Error during validation:', error);
      return {
        isValid: false,
        issues: ['Validation failed: ' + (error as Error).message],
        repaired: false
      };
    }
  }
}

export const enhancedOnboardingService = new EnhancedOnboardingService();
