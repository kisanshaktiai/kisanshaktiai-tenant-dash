
import { enhancedOnboardingService } from './EnhancedOnboardingService';
import { tenantDataService } from './TenantDataService';

export interface OnboardingValidationResult {
  isValid: boolean;
  issues: string[];
  repaired: boolean;
  details?: Record<string, any>;
}

export interface OnboardingDebugInfo {
  tenant_id: string;
  workflow_exists: boolean;
  workflow_data: any;
  steps_count: number;
  steps_data: any[];
  validation_timestamp: string;
}

class OnboardingValidationService {
  async validateAndRepairOnboarding(tenantId: string): Promise<OnboardingValidationResult> {
    try {
      console.log('OnboardingValidationService: Validating onboarding for tenant:', tenantId);
      
      const issues: string[] = [];
      let repaired = false;
      
      // Check if workflow exists, create if missing
      let workflow;
      try {
        workflow = await tenantDataService.getOnboardingWorkflow(tenantId);
        if (!workflow) {
          console.log('OnboardingValidationService: Workflow missing, creating...');
          await tenantDataService.ensureOnboardingWorkflow(tenantId);
          workflow = await tenantDataService.getOnboardingWorkflow(tenantId);
          repaired = true;
        }
      } catch (error) {
        issues.push(`Workflow validation failed: ${error.message}`);
      }
      
      // Check if steps exist
      let steps = [];
      try {
        steps = await tenantDataService.getOnboardingSteps(tenantId, workflow?.id);
        if (!steps || steps.length === 0) {
          issues.push('No onboarding steps found');
        }
      } catch (error) {
        issues.push(`Steps validation failed: ${error.message}`);
      }
      
      // Validate workflow consistency
      if (workflow && steps.length > 0) {
        if (workflow.total_steps !== steps.length) {
          console.log('OnboardingValidationService: Step count mismatch, updating...');
          try {
            await tenantDataService.updateOnboardingWorkflow(tenantId, workflow.id, {
              total_steps: steps.length
            });
            repaired = true;
          } catch (error) {
            issues.push(`Failed to update workflow step count: ${error.message}`);
          }
        }
      }
      
      const isValid = issues.length === 0;
      
      console.log('OnboardingValidationService: Validation complete:', {
        isValid,
        issues,
        repaired
      });
      
      return {
        isValid,
        issues,
        repaired,
        details: {
          workflow_id: workflow?.id,
          steps_count: steps.length,
          workflow_status: workflow?.status
        }
      };
    } catch (error) {
      console.error('OnboardingValidationService: Validation error:', error);
      return {
        isValid: false,
        issues: [`Validation process failed: ${error.message}`],
        repaired: false
      };
    }
  }

  async forceRefreshOnboarding(tenantId: string): Promise<boolean> {
    try {
      console.log('OnboardingValidationService: Force refreshing onboarding for tenant:', tenantId);
      
      // Re-ensure workflow exists
      await tenantDataService.ensureOnboardingWorkflow(tenantId);
      
      // Get fresh data to verify
      const data = await tenantDataService.getCompleteOnboardingData(tenantId);
      
      const success = !!(data && data.workflow && data.steps);
      console.log('OnboardingValidationService: Force refresh result:', success);
      
      return success;
    } catch (error) {
      console.error('OnboardingValidationService: Force refresh failed:', error);
      return false;
    }
  }

  async getOnboardingDebugInfo(tenantId: string): Promise<OnboardingDebugInfo> {
    try {
      console.log('OnboardingValidationService: Getting debug info for tenant:', tenantId);
      
      let workflow_data = null;
      let steps_data = [];
      
      try {
        workflow_data = await tenantDataService.getOnboardingWorkflow(tenantId);
      } catch (error) {
        console.warn('OnboardingValidationService: Could not fetch workflow:', error);
      }
      
      try {
        steps_data = await tenantDataService.getOnboardingSteps(tenantId, workflow_data?.id);
      } catch (error) {
        console.warn('OnboardingValidationService: Could not fetch steps:', error);
      }
      
      return {
        tenant_id: tenantId,
        workflow_exists: !!workflow_data,
        workflow_data,
        steps_count: steps_data.length,
        steps_data,
        validation_timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('OnboardingValidationService: Error getting debug info:', error);
      return {
        tenant_id: tenantId,
        workflow_exists: false,
        workflow_data: null,
        steps_count: 0,
        steps_data: [],
        validation_timestamp: new Date().toISOString()
      };
    }
  }

  async repairOnboardingData(tenantId: string): Promise<boolean> {
    try {
      console.log('OnboardingValidationService: Repairing onboarding data for tenant:', tenantId);
      
      // Ensure workflow exists
      await tenantDataService.ensureOnboardingWorkflow(tenantId);
      
      // Validate the repair worked
      const validation = await this.validateAndRepairOnboarding(tenantId);
      
      return validation.isValid;
    } catch (error) {
      console.error('OnboardingValidationService: Repair failed:', error);
      return false;
    }
  }
}

export const onboardingValidationService = new OnboardingValidationService();
