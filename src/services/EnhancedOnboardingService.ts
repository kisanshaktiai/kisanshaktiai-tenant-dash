
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

      // Check if all required steps are completed
      const requiredSteps = steps.filter(step => 
        step.step_data?.is_required !== false // Default to required if not specified
      );
      const completedRequiredSteps = requiredSteps.filter(step => 
        step.step_status === 'completed'
      );
      
      const isComplete = requiredSteps.length > 0 && completedRequiredSteps.length === requiredSteps.length;
      
      console.log('EnhancedOnboardingService: Onboarding completion check:', {
        tenantId,
        totalSteps: steps.length,
        requiredSteps: requiredSteps.length,
        completedRequiredSteps: completedRequiredSteps.length,
        workflowStatus: workflow.status,
        isComplete
      });

      // Auto-complete workflow if all required steps are done
      if (isComplete && workflow.status !== 'completed') {
        console.log('EnhancedOnboardingService: Auto-completing workflow');
        await this.completeWorkflow(workflow.id, tenantId);
      }

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

  async initializeOnboardingWorkflow(tenantId: string): Promise<{ workflow: any; steps: any[] } | null> {
    return this.initializeOnboarding(tenantId);
  }

  async completeStep(stepId: string, stepData?: any, tenantId?: string): Promise<boolean> {
    try {
      console.log('EnhancedOnboardingService: Completing step:', { stepId, tenantId });
      
      if (!tenantId) {
        throw new Error('Tenant ID is required to complete step');
      }
      
      await tenantDataService.completeOnboardingStep(tenantId, stepId, stepData);
      
      console.log('EnhancedOnboardingService: Step completed successfully');
      return true;
    } catch (error) {
      globalErrorHandler.handleError(error, {
        component: 'EnhancedOnboardingService',
        operation: 'completeStep',
        tenantId,
        metadata: { stepId }
      });
      return false;
    }
  }

  async updateStepStatus(stepId: string, status: 'pending' | 'in_progress' | 'completed' | 'skipped', stepData?: any, tenantId?: string): Promise<boolean> {
    try {
      console.log('EnhancedOnboardingService: Updating step status:', { stepId, status, tenantId });
      
      if (!tenantId) {
        throw new Error('Tenant ID is required to update step status');
      }

      if (status === 'completed') {
        return await this.completeStep(stepId, stepData, tenantId);
      }
      
      await tenantDataService.updateOnboardingStep(tenantId, stepId, {
        step_status: status,
        step_data: stepData || {},
        updated_at: new Date().toISOString(),
        ...(status === 'in_progress' && { started_at: new Date().toISOString() })
      });
      
      console.log('EnhancedOnboardingService: Step status updated successfully');
      return true;
    } catch (error) {
      globalErrorHandler.handleError(error, {
        component: 'EnhancedOnboardingService',
        operation: 'updateStepStatus',
        tenantId,
        metadata: { stepId, status }
      });
      return false;
    }
  }

  async completeWorkflow(workflowId: string, tenantId?: string): Promise<boolean> {
    try {
      console.log('EnhancedOnboardingService: Completing workflow:', { workflowId, tenantId });
      
      if (!tenantId) {
        throw new Error('Tenant ID is required to complete workflow');
      }
      
      await tenantDataService.completeOnboardingWorkflow(tenantId, workflowId);
      
      console.log('EnhancedOnboardingService: Workflow completed successfully');
      return true;
    } catch (error) {
      globalErrorHandler.handleError(error, {
        component: 'EnhancedOnboardingService',
        operation: 'completeWorkflow',
        tenantId,
        metadata: { workflowId }
      });
      return false;
    }
  }

  async validateOnboardingIntegrity(tenantId: string): Promise<{ isValid: boolean; issues: string[]; repaired: boolean }> {
    try {
      console.log('EnhancedOnboardingService: Validating onboarding integrity for tenant:', tenantId);
      
      const onboardingData = await this.getOnboardingData(tenantId);
      
      if (!onboardingData) {
        return {
          isValid: false,
          issues: ['No onboarding data found'],
          repaired: false
        };
      }
      
      const issues: string[] = [];
      
      if (!onboardingData.workflow) {
        issues.push('Missing workflow');
      }
      
      if (!onboardingData.steps || onboardingData.steps.length === 0) {
        issues.push('No onboarding steps found');
      }
      
      // Check for step sequence gaps
      if (onboardingData.steps && onboardingData.steps.length > 0) {
        const stepNumbers = onboardingData.steps.map((s: OnboardingStep) => s.step_number).sort((a, b) => a - b);
        for (let i = 1; i <= stepNumbers.length; i++) {
          if (!stepNumbers.includes(i)) {
            issues.push(`Missing step number ${i} in sequence`);
          }
        }
      }
      
      return {
        isValid: issues.length === 0,
        issues,
        repaired: false // Would need repair logic
      };
    } catch (error) {
      globalErrorHandler.handleError(error, {
        component: 'EnhancedOnboardingService',
        operation: 'validateOnboardingIntegrity',
        tenantId
      });
      
      return {
        isValid: false,
        issues: ['Validation failed due to error'],
        repaired: false
      };
    }
  }

  async completeOnboardingStep(tenantId: string, stepId: string, stepData?: any): Promise<boolean> {
    return this.completeStep(stepId, stepData, tenantId);
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
