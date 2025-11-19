
import { supabase } from '@/integrations/supabase/client';
import { enhancedOnboardingService } from './EnhancedOnboardingService';

class OnboardingValidationService {
  async validateAndRepairOnboarding(tenantId: string) {
    try {
      console.log('OnboardingValidationService: Starting validation for tenant:', tenantId);
      
      // Check if workflow exists
      const workflow = await enhancedOnboardingService.getOnboardingWorkflow(tenantId);
      
      // If workflow is completed, no validation needed
      if (workflow && workflow.status === 'completed') {
        console.log('OnboardingValidationService: Workflow already completed, skipping validation');
        return { isValid: true, repaired: false, issues: [] };
      }
      
      if (!workflow) {
        console.log('OnboardingValidationService: No workflow found, initializing...');
        await enhancedOnboardingService.initializeOnboardingWorkflow(tenantId);
        return { isValid: true, repaired: true, issues: [] };
      }
      
      // Check if steps exist
      const steps = await enhancedOnboardingService.getOnboardingSteps(workflow.id);
      
      if (steps.length === 0) {
        console.log('OnboardingValidationService: No steps found, creating default steps...');
        
        // Create default steps with correct names
        const defaultSteps = [
          { name: 'company_profile', order: 1, description: 'Complete your company profile and business verification' },
          { name: 'billing_plan', order: 2, description: 'Choose your subscription plan' },
          { name: 'branding', order: 3, description: 'Set up your brand colors and logo' },
          { name: 'feature_selection', order: 4, description: 'Select features for your platform' },
          { name: 'data_import', order: 5, description: 'Import your existing data' },
          { name: 'users_and_roles', order: 6, description: 'Invite team members' }
        ];
        
        for (const step of defaultSteps) {
          await supabase
            .from('onboarding_steps')
            .insert({
              workflow_id: workflow.id,
              step_name: step.name,
              step_number: step.order,
              step_status: 'pending',
              step_data: {
                step_description: step.description,
                is_required: true,
                estimated_time_minutes: 15,
                step_type: 'standard',
                step_config: {},
                display_name: this.getDisplayNameForStepName(step.name)
              }
            });
        }
        
        return { isValid: true, repaired: true, issues: [] };
      }
      
      // Check if we have the expected number of steps (6)
      if (steps.length < 6) {
        console.log('OnboardingValidationService: Missing steps, found:', steps.length);
        return { isValid: false, repaired: false, issues: [`Expected 6 steps, found ${steps.length}`] };
      }
      
      console.log('OnboardingValidationService: Validation passed');
      return { isValid: true, repaired: false, issues: [] };
      
    } catch (error) {
      console.error('OnboardingValidationService: Validation failed:', error);
      return { 
        isValid: false, 
        repaired: false, 
        issues: [error instanceof Error ? error.message : 'Unknown validation error'] 
      };
    }
  }
  
  private getDisplayNameForStepName(stepName: string): string {
    const mapping: Record<string, string> = {
      'company_profile': 'Business Verification',
      'billing_plan': 'Subscription Plan',
      'branding': 'Branding Configuration',
      'feature_selection': 'Feature Selection',
      'data_import': 'Data Import',
      'users_and_roles': 'Team Setup'
    };
    return mapping[stepName] || stepName;
  }
  
  async forceRefreshOnboarding(tenantId: string) {
    try {
      console.log('OnboardingValidationService: Force refreshing onboarding for tenant:', tenantId);
      
      // Clear any cached data
      enhancedOnboardingService.clearCache();
      
      // Re-validate and repair if needed
      const validationResult = await this.validateAndRepairOnboarding(tenantId);
      
      return validationResult.isValid || validationResult.repaired;
    } catch (error) {
      console.error('OnboardingValidationService: Force refresh failed:', error);
      return false;
    }
  }
  
  async getOnboardingDebugInfo(tenantId: string) {
    try {
      const workflow = await enhancedOnboardingService.getOnboardingWorkflow(tenantId);
      const steps = workflow ? await enhancedOnboardingService.getOnboardingSteps(workflow.id) : [];
      
      return {
        tenantId,
        hasWorkflow: !!workflow,
        workflowId: workflow?.id,
        workflowStatus: workflow?.status,
        stepCount: steps.length,
        steps: steps.map(step => ({
          id: step.id,
          name: step.step_name,
          status: step.step_status,
          order: step.step_number,
          hasData: !!step.step_data && Object.keys(step.step_data).length > 0
        })),
        completedSteps: steps.filter(s => s.step_status === 'completed').length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        tenantId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const onboardingValidationService = new OnboardingValidationService();
