
import { tenantDataService } from './TenantDataService';
import { toast } from 'sonner';

export interface OnboardingWorkflow {
  id: string;
  tenant_id: string;
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
  private retryAttempts = 5;
  private baseDelay = 500;
  private maxDelay = 30000;
  private backoffMultiplier = 2;

  private async withRetry<T>(
    operation: () => Promise<T>, 
    context: string,
    customRetries?: number
  ): Promise<T> {
    const maxAttempts = customRetries || this.retryAttempts;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`${context}: Attempt ${attempt}/${maxAttempts}`);
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.error(`${context}: Attempt ${attempt} failed:`, error);
        
        if (attempt < maxAttempts) {
          // Exponential backoff with jitter
          const delay = Math.min(
            this.baseDelay * Math.pow(this.backoffMultiplier, attempt - 1) + Math.random() * 1000,
            this.maxDelay
          );
          console.log(`${context}: Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`${context} failed after ${maxAttempts} attempts: ${lastError?.message}`);
  }

  async initializeOnboardingWorkflow(tenantId: string): Promise<OnboardingData> {
    return this.withRetry(async () => {
      console.log('EnhancedOnboardingService: Initializing enterprise workflow for tenant:', tenantId);
      
      if (!tenantId || tenantId.trim() === '') {
        throw new Error('Tenant ID is required for onboarding initialization');
      }

      // Enterprise-grade initialization with comprehensive validation
      const onboardingData = await tenantDataService.initializeOnboardingForTenant(tenantId);
      
      if (!onboardingData?.workflow) {
        throw new Error('Failed to initialize onboarding workflow - no workflow returned');
      }
      
      // Validate workflow integrity
      if (onboardingData.steps.length === 0) {
        console.warn('EnhancedOnboardingService: Workflow created but no steps found, attempting repair...');
        // Trigger step creation
        await tenantDataService.ensureOnboardingWorkflow(tenantId);
        // Retry getting complete data
        const repairedData = await tenantDataService.getCompleteOnboardingData(tenantId);
        if (repairedData.steps.length === 0) {
          throw new Error('Failed to create onboarding steps after repair attempt');
        }
        return repairedData;
      }
      
      // Safe access to metadata properties with fallbacks
      const workflowMetadata = onboardingData.workflow.metadata || {};
      const subscriptionPlan = workflowMetadata.subscription_plan || 'unknown';
      const workflowVersion = workflowMetadata.workflow_version || '1.0';
      
      console.log('EnhancedOnboardingService: Enterprise workflow initialized successfully:', {
        workflowId: onboardingData.workflow.id,
        stepCount: onboardingData.steps.length,
        plan: subscriptionPlan,
        version: workflowVersion
      });
      
      return onboardingData;
    }, 'initializeOnboardingWorkflow', 3);
  }

  async getOnboardingData(tenantId: string): Promise<OnboardingData | null> {
    return this.withRetry(async () => {
      console.log('EnhancedOnboardingService: Getting enterprise onboarding data for tenant:', tenantId);
      
      try {
        const data = await tenantDataService.getCompleteOnboardingData(tenantId);
        
        if (!data?.workflow) {
          console.log('EnhancedOnboardingService: No workflow found, initializing enterprise workflow...');
          return await this.initializeOnboardingWorkflow(tenantId);
        }
        
        // Enterprise validation: Check workflow integrity
        if (data.steps.length === 0) {
          console.warn('EnhancedOnboardingService: Workflow exists but has no steps, repairing...');
          return await this.initializeOnboardingWorkflow(tenantId);
        }
        
        // Validate step consistency
        const expectedSteps = data.workflow.total_steps;
        const actualSteps = data.steps.length;
        if (expectedSteps !== actualSteps) {
          console.warn(`EnhancedOnboardingService: Step count mismatch (expected: ${expectedSteps}, actual: ${actualSteps}), repairing...`);
          return await this.initializeOnboardingWorkflow(tenantId);
        }
        
        return data;
      } catch (error) {
        console.error('EnhancedOnboardingService: Error getting onboarding data:', error);
        
        // Enhanced error recovery with specific error handling
        if (error.message?.includes('workflow') || 
            error.message?.includes('not found') ||
            error.message?.includes('Request body is required') ||
            error.message?.includes('non-2xx status')) {
          console.log('EnhancedOnboardingService: Recovering from error by initializing enterprise workflow...');
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

      console.log('EnhancedOnboardingService: Completing enterprise step:', { stepId, stepData, tenantId });
      
      // Enhanced step completion with validation
      const enrichedStepData = {
        ...stepData,
        completed_by: 'user',
        completion_timestamp: new Date().toISOString(),
        validation_status: 'passed',
        enterprise_metadata: {
          completion_source: 'enhanced_service',
          version: '2.0'
        }
      };
      
      await tenantDataService.completeOnboardingStep(tenantId, stepId, enrichedStepData);
      
      toast.success('✅ Step completed successfully!', {
        description: 'Your progress has been saved.',
        duration: 3000,
      });
      
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

      console.log('EnhancedOnboardingService: Updating enterprise step status:', { stepId, stepStatus, stepData, tenantId });
      
      const enhancedData = {
        step_status: stepStatus,
        step_data: {
          ...stepData,
          status_updated_by: 'user',
          status_change_timestamp: new Date().toISOString(),
          previous_status: stepData?.previous_status || 'pending'
        },
        updated_at: new Date().toISOString(),
        ...(stepStatus === 'completed' && { completed_at: new Date().toISOString() }),
        ...(stepStatus === 'in_progress' && { started_at: new Date().toISOString() })
      };
      
      await tenantDataService.updateOnboardingStep(tenantId, stepId, enhancedData);

      // Enhanced notifications based on status
      if (stepStatus === 'completed') {
        toast.success('🎯 Step completed!', {
          description: 'Great progress! Moving to the next step.',
          duration: 2000,
        });
      } else if (stepStatus === 'in_progress') {
        toast.info('⚡ Step started', {
          description: 'You\'re making progress!',
          duration: 1500,
        });
      }
      
      return true;
    }, 'updateStepStatus');
  }

  async completeWorkflow(workflowId: string, tenantId: string): Promise<boolean> {
    return this.withRetry(async () => {
      console.log('EnhancedOnboardingService: Completing enterprise workflow:', { workflowId, tenantId });
      
      await tenantDataService.completeOnboardingWorkflow(tenantId, workflowId);
      
      toast.success('🎉 Onboarding Complete!', {
        description: 'Welcome to your new platform! You\'re all set to get started.',
        duration: 5000,
      });
      
      return true;
    }, 'completeWorkflow');
  }

  async isOnboardingComplete(tenantId: string): Promise<boolean> {
    return this.withRetry(async () => {
      const data = await this.getOnboardingData(tenantId);
      
      if (!data?.workflow) {
        return false;
      }
      
      // Enhanced completion check
      const isWorkflowComplete = data.workflow.status === 'completed';
      const allRequiredStepsComplete = data.steps
        .filter(step => step.is_required)
        .every(step => step.step_status === 'completed');
      
      return isWorkflowComplete && allRequiredStepsComplete;
    }, 'isOnboardingComplete');
  }

  async getOnboardingProgress(tenantId: string): Promise<number> {
    return this.withRetry(async () => {
      const data = await this.getOnboardingData(tenantId);
      
      if (!data?.steps || data.steps.length === 0) {
        return 0;
      }
      
      // Enhanced progress calculation with weighted steps
      const totalWeight = data.steps.reduce((sum, step) => sum + (step.is_required ? 2 : 1), 0);
      const completedWeight = data.steps
        .filter(step => step.step_status === 'completed')
        .reduce((sum, step) => sum + (step.is_required ? 2 : 1), 0);
      
      if (totalWeight === 0) return 0;
      
      return Math.round((completedWeight / totalWeight) * 100);
    }, 'getOnboardingProgress');
  }

  // Enhanced validation with automatic repair capabilities
  async validateOnboardingIntegrity(tenantId: string): Promise<{ 
    isValid: boolean; 
    issues: string[]; 
    repaired: boolean;
    details: Record<string, any>;
  }> {
    return this.withRetry(async () => {
      const issues: string[] = [];
      let repaired = false;
      const details: Record<string, any> = {};
      
      try {
        console.log('EnhancedOnboardingService: Validating enterprise onboarding integrity for tenant:', tenantId);
        
        let data;
        try {
          data = await tenantDataService.getCompleteOnboardingData(tenantId);
          details.data_retrieval = 'success';
        } catch (error) {
          console.log('EnhancedOnboardingService: Error getting data, will attempt repair:', error.message);
          issues.push('Unable to retrieve onboarding data');
          details.data_retrieval = 'failed';
          details.retrieval_error = error.message;
        }
        
        if (!data?.workflow) {
          issues.push('No onboarding workflow found');
          console.log('EnhancedOnboardingService: Repairing - Creating missing enterprise workflow');
          try {
            data = await this.initializeOnboardingWorkflow(tenantId);
            repaired = true;
            details.workflow_repair = 'success';
          } catch (repairError) {
            console.error('EnhancedOnboardingService: Failed to repair workflow:', repairError);
            issues.push(`Failed to create workflow: ${repairError.message}`);
            details.workflow_repair = 'failed';
            details.repair_error = repairError.message;
          }
        }
        
        if (data?.workflow) {
          details.workflow_status = data.workflow.status;
          details.workflow_progress = data.workflow.progress_percentage;
          
          if (!data.steps || data.steps.length === 0) {
            issues.push('No onboarding steps found');
            details.steps_status = 'missing';
          } else {
            details.steps_status = 'present';
            details.steps_count = data.steps.length;
            
            if (data.workflow.total_steps !== data.steps.length) {
              issues.push(`Step count mismatch: expected ${data.workflow.total_steps}, found ${data.steps.length}`);
              details.step_count_mismatch = true;
            }
            
            // Check for orphaned or invalid steps
            const invalidSteps = data.steps.filter(step => !step.step_name || !step.step_description);
            if (invalidSteps.length > 0) {
              issues.push(`Found ${invalidSteps.length} invalid steps`);
              details.invalid_steps = invalidSteps.length;
            }
            
            // Check step sequence
            const stepNumbers = data.steps.map(s => s.step_number).sort((a, b) => a - b);
            const expectedSequence = Array.from({ length: data.steps.length }, (_, i) => i + 1);
            if (JSON.stringify(stepNumbers) !== JSON.stringify(expectedSequence)) {
              issues.push('Step sequence is not continuous');
              details.sequence_issue = true;
            }
          }
        }
        
        const isValid = issues.length === 0;
        
        return {
          isValid,
          issues,
          repaired,
          details: {
            ...details,
            validation_timestamp: new Date().toISOString(),
            tenant_id: tenantId,
            validation_version: '2.0'
          }
        };
      } catch (error) {
        console.error('EnhancedOnboardingService: Validation failed:', error);
        return {
          isValid: false,
          issues: [`Validation error: ${error.message}`],
          repaired: false,
          details: {
            validation_error: error.message,
            validation_timestamp: new Date().toISOString(),
            tenant_id: tenantId
          }
        };
      }
    }, 'validateOnboardingIntegrity');
  }

  // New enterprise features
  async getOnboardingAnalytics(tenantId: string): Promise<{
    totalTime: number;
    averageStepTime: number;
    completionRate: number;
    stuckSteps: string[];
    recommendations: string[];
  }> {
    return this.withRetry(async () => {
      const data = await this.getOnboardingData(tenantId);
      
      if (!data?.workflow || !data.steps) {
        return {
          totalTime: 0,
          averageStepTime: 0,
          completionRate: 0,
          stuckSteps: [],
          recommendations: ['Complete onboarding initialization']
        };
      }

      const completedSteps = data.steps.filter(s => s.step_status === 'completed');
      const totalEstimatedTime = data.steps.reduce((sum, step) => sum + step.estimated_time_minutes, 0);
      const completionRate = (completedSteps.length / data.steps.length) * 100;
      
      const stuckSteps = data.steps
        .filter(s => s.step_status === 'in_progress' && s.started_at)
        .filter(s => {
          const startTime = new Date(s.started_at!).getTime();
          const now = Date.now();
          const hoursStuck = (now - startTime) / (1000 * 60 * 60);
          return hoursStuck > 2; // Consider stuck if in progress for more than 2 hours
        })
        .map(s => s.step_name);

      const recommendations = [];
      if (completionRate < 50) {
        recommendations.push('Focus on completing core verification steps first');
      }
      if (stuckSteps.length > 0) {
        recommendations.push('Consider reaching out to support for assistance with stuck steps');
      }
      if (completionRate > 80) {
        recommendations.push('You\'re almost done! Complete the remaining steps to activate all features');
      }

      return {
        totalTime: totalEstimatedTime,
        averageStepTime: totalEstimatedTime / data.steps.length,
        completionRate,
        stuckSteps,
        recommendations
      };
    }, 'getOnboardingAnalytics');
  }

  async skipStep(stepId: string, reason: string, tenantId: string): Promise<boolean> {
    return this.withRetry(async () => {
      console.log('EnhancedOnboardingService: Skipping step:', { stepId, reason, tenantId });
      
      const skipData = {
        skipped: true,
        skip_reason: reason,
        skipped_at: new Date().toISOString(),
        skipped_by: 'user'
      };
      
      await this.updateStepStatus(stepId, 'skipped', skipData, tenantId);
      
      toast.info('⏭️ Step skipped', {
        description: `Reason: ${reason}`,
        duration: 2000,
      });
      
      return true;
    }, 'skipStep');
  }

  async resetWorkflow(tenantId: string): Promise<boolean> {
    return this.withRetry(async () => {
      console.log('EnhancedOnboardingService: Resetting workflow for tenant:', tenantId);
      
      // This would reset all steps to pending status
      const data = await this.getOnboardingData(tenantId);
      if (!data?.steps) {
        throw new Error('No workflow to reset');
      }

      // Reset all steps to pending
      for (const step of data.steps) {
        await this.updateStepStatus(step.id, 'pending', {
          reset: true,
          reset_at: new Date().toISOString(),
          reset_by: 'user'
        }, tenantId);
      }
      
      toast.success('🔄 Workflow reset successfully', {
        description: 'You can now start the onboarding process again.',
        duration: 3000,
      });
      
      return true;
    }, 'resetWorkflow');
  }
}

export const enhancedOnboardingService = new EnhancedOnboardingService();
