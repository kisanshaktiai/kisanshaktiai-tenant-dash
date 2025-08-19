
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
  private async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 2, // Reduced from 3 to 2
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`${operation.name || 'Operation'}: Attempt ${attempt}/${maxRetries}`);
        return await operation();
      } catch (error: any) {
        lastError = error;
        console.error(`${operation.name || 'Operation'}: Attempt ${attempt} failed:`, error);
        
        // Don't retry client errors (400 level)
        if (error.isClientError || error.message?.includes('400')) {
          throw error;
        }
        
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
          console.info(`${operation.name || 'Operation'}: Retrying in ${delay.toFixed(1)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`${operation.name || 'Operation'} failed after ${maxRetries} attempts: ${lastError.message}`);
  }

  async getOnboardingData(tenantId: string): Promise<OnboardingData> {
    return this.withRetry(async () => {
      console.log('EnhancedOnboardingService: Getting enterprise onboarding data for tenant:', tenantId);
      
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
    }, 2, 1500); // Reduced retries and base delay
  }

  async initializeOnboardingWorkflow(tenantId: string): Promise<OnboardingData> {
    return this.withRetry(async () => {
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
    }, 2, 2000); // Reduced retries
  }

  async completeStep(stepId: string, stepData?: any, tenantId?: string): Promise<boolean> {
    if (!tenantId) {
      throw new Error('Tenant ID is required for completing step');
    }

    return this.withRetry(async () => {
      console.log('EnhancedOnboardingService: Completing step:', { stepId, tenantId });
      
      await tenantDataService.completeOnboardingStep(tenantId, stepId, stepData);
      
      console.log('EnhancedOnboardingService: Step completed successfully');
      return true;
    }, 2, 1000); // Reduced retries
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

    return this.withRetry(async () => {
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
    }, 2, 1000); // Reduced retries
  }

  async completeWorkflow(workflowId: string, tenantId: string): Promise<boolean> {
    return this.withRetry(async () => {
      console.log('EnhancedOnboardingService: Completing workflow:', { workflowId, tenantId });
      
      const result = await tenantDataService.completeOnboardingWorkflow(tenantId, workflowId);
      
      if (!result || !result.success) {
        throw new Error('Failed to complete workflow');
      }
      
      console.log('EnhancedOnboardingService: Workflow completed successfully');
      return true;
    }, 2, 1000); // Reduced retries
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
        repaired: false // No auto-repair in this implementation
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
