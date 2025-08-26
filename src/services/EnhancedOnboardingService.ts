
import { tenantDataService } from './TenantDataService';
import { globalErrorHandler } from './GlobalErrorHandler';

interface OnboardingWorkflow {
  id: string;
  tenant_id: string;
  workflow_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface OnboardingStep {
  id: string;
  workflow_id: string;
  step_name: string;
  step_number: number;
  step_status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  step_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

class EnhancedOnboardingService {
  private initializationCache = new Map<string, Promise<any>>();

  async isOnboardingComplete(tenantId: string): Promise<boolean> {
    try {
      console.log('EnhancedOnboardingService: Checking onboarding completion for tenant:', tenantId);
      
      const onboardingData = await this.getOnboardingData(tenantId);
      
      if (!onboardingData?.workflow || !onboardingData?.steps) {
        console.log('EnhancedOnboardingService: No workflow or steps found, onboarding not complete');
        return false;
      }

      const workflow = onboardingData.workflow as OnboardingWorkflow;
      const steps = onboardingData.steps as OnboardingStep[];

      // Check if workflow is marked as completed
      if (workflow.status === 'completed') {
        console.log('EnhancedOnboardingService: Workflow marked as completed');
        return true;
      }

      // Check if all steps are completed
      const totalSteps = steps.length;
      const completedSteps = steps.filter(step => step.step_status === 'completed').length;
      
      const isComplete = totalSteps > 0 && completedSteps === totalSteps;
      
      console.log('EnhancedOnboardingService: Onboarding completion check:', {
        tenantId,
        totalSteps,
        completedSteps,
        workflowStatus: workflow.status,
        isComplete
      });

      return isComplete;
    } catch (error) {
      globalErrorHandler.handleError(error, {
        component: 'EnhancedOnboardingService',
        operation: 'isOnboardingComplete',
        tenantId
      }, {
        severity: 'medium',
        showToast: false
      });
      
      // Return false on error to be safe
      return false;
    }
  }

  async getOnboardingData(tenantId: string): Promise<{ workflow: any; steps: any[] } | null> {
    try {
      console.log('EnhancedOnboardingService: Getting onboarding data for tenant:', tenantId);

      // Prevent multiple simultaneous calls for the same tenant
      const cacheKey = `onboarding-${tenantId}`;
      if (this.initializationCache.has(cacheKey)) {
        console.log('EnhancedOnboardingService: Using cached onboarding data request');
        return await this.initializationCache.get(cacheKey)!;
      }

      const dataPromise = this.fetchOnboardingData(tenantId);
      this.initializationCache.set(cacheKey, dataPromise);

      try {
        const result = await dataPromise;
        return result;
      } finally {
        // Clean up cache after request completes
        setTimeout(() => {
          this.initializationCache.delete(cacheKey);
        }, 1000);
      }
    } catch (error) {
      globalErrorHandler.handleError(error, {
        component: 'EnhancedOnboardingService',
        operation: 'getOnboardingData',
        tenantId
      }, {
        severity: 'high'
      });
      return null;
    }
  }

  private async fetchOnboardingData(tenantId: string): Promise<{ workflow: any; steps: any[] }> {
    console.log('EnhancedOnboardingService: Fetching onboarding data for tenant:', tenantId);
    
    try {
      const onboardingData = await tenantDataService.getCompleteOnboardingData(tenantId);
      
      if (!onboardingData) {
        throw new Error('No onboarding data returned from service');
      }

      console.log('EnhancedOnboardingService: Successfully retrieved onboarding data:', {
        hasWorkflow: !!onboardingData.workflow,
        stepCount: onboardingData.steps?.length || 0
      });

      return onboardingData;
    } catch (error) {
      console.error('EnhancedOnboardingService: Error fetching onboarding data:', error);
      throw error;
    }
  }

  async initializeOnboarding(tenantId: string): Promise<{ workflow: any; steps: any[] } | null> {
    try {
      console.log('EnhancedOnboardingService: Initializing onboarding for tenant:', tenantId);

      // Check if already initialized
      const existingData = await this.getOnboardingData(tenantId);
      if (existingData?.workflow) {
        console.log('EnhancedOnboardingService: Onboarding already initialized');
        return existingData;
      }

      // Initialize new workflow
      const { workflow_id } = await tenantDataService.ensureOnboardingWorkflow(tenantId);
      
      // Get the complete data
      const onboardingData = await tenantDataService.getCompleteOnboardingData(tenantId);
      
      console.log('EnhancedOnboardingService: Onboarding initialized successfully:', {
        workflowId: workflow_id,
        hasSteps: !!onboardingData?.steps?.length
      });

      return onboardingData;
    } catch (error) {
      globalErrorHandler.handleError(error, {
        component: 'EnhancedOnboardingService',
        operation: 'initializeOnboarding',
        tenantId
      }, {
        severity: 'high'
      });
      return null;
    }
  }

  async completeOnboardingStep(tenantId: string, stepId: string, stepData?: any): Promise<boolean> {
    try {
      console.log('EnhancedOnboardingService: Completing step:', { tenantId, stepId });
      
      await tenantDataService.completeOnboardingStep(tenantId, stepId, stepData);
      
      console.log('EnhancedOnboardingService: Step completed successfully');
      return true;
    } catch (error) {
      globalErrorHandler.handleError(error, {
        component: 'EnhancedOnboardingService',
        operation: 'completeOnboardingStep',
        tenantId,
        metadata: { stepId }
      });
      return false;
    }
  }

  async calculateProgress(tenantId: string): Promise<number> {
    try {
      const onboardingData = await this.getOnboardingData(tenantId);
      
      if (!onboardingData?.steps || onboardingData.steps.length === 0) {
        return 0;
      }

      const completedSteps = onboardingData.steps.filter(
        (step: OnboardingStep) => step.step_status === 'completed'
      ).length;

      const progress = (completedSteps / onboardingData.steps.length) * 100;
      
      console.log('EnhancedOnboardingService: Progress calculated:', {
        tenantId,
        completedSteps,
        totalSteps: onboardingData.steps.length,
        progress
      });

      return Math.round(progress);
    } catch (error) {
      globalErrorHandler.handleError(error, {
        component: 'EnhancedOnboardingService',
        operation: 'calculateProgress',
        tenantId
      }, {
        severity: 'low',
        showToast: false
      });
      return 0;
    }
  }

  // Clear cache method for troubleshooting
  clearCache(): void {
    this.initializationCache.clear();
    console.log('EnhancedOnboardingService: Cache cleared');
  }
}

export const enhancedOnboardingService = new EnhancedOnboardingService();
