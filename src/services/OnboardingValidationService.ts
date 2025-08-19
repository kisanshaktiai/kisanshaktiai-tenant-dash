
import { supabase } from '@/integrations/supabase/client';
import { tenantDataService } from '@/services/TenantDataService';

interface OnboardingValidationResult {
  isValid: boolean;
  issues: string[];
  repaired: boolean;
  workflowId?: string;
}

export class OnboardingValidationService {
  /**
   * Validates and repairs onboarding data for a tenant
   */
  static async validateAndRepairOnboarding(tenantId: string): Promise<OnboardingValidationResult> {
    const issues: string[] = [];
    let repaired = false;
    let workflowId: string | undefined;

    try {
      console.log('OnboardingValidation: Starting validation for tenant:', tenantId);

      // Step 1: Check if tenant exists
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id, name, status, subscription_plan')
        .eq('id', tenantId)
        .single();

      if (tenantError || !tenant) {
        issues.push('Tenant not found or inaccessible');
        return { isValid: false, issues, repaired: false };
      }

      // Step 2: Check for onboarding workflow - using actual schema
      const { data: workflows, error: workflowError } = await supabase
        .from('onboarding_workflows')
        .select('id, status, created_at, updated_at')
        .eq('tenant_id', tenantId);

      if (workflowError) {
        console.error('OnboardingValidation: Error fetching workflows:', workflowError);
        issues.push(`Workflow query failed: ${workflowError.message}`);
      }

      if (!workflows || workflows.length === 0) {
        console.log('OnboardingValidation: No workflow found, creating one...');
        try {
          const result = await tenantDataService.ensureOnboardingWorkflow(tenantId);
          if (result && result.workflow_id) {
            workflowId = result.workflow_id;
            repaired = true;
            console.log('OnboardingValidation: Created workflow:', workflowId);
          } else {
            issues.push('Failed to create onboarding workflow');
          }
        } catch (error) {
          console.error('OnboardingValidation: Error creating workflow:', error);
          issues.push(`Failed to create workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        workflowId = workflows[0].id;
        console.log('OnboardingValidation: Found existing workflow:', workflowId);
      }

      // Step 3: Validate workflow steps if we have a workflow - using actual schema
      if (workflowId) {
        const { data: steps, error: stepsError } = await supabase
          .from('onboarding_steps')
          .select('id, step_name, step_status, step_order, created_at')
          .eq('workflow_id', workflowId)
          .order('step_order');

        if (stepsError) {
          console.error('OnboardingValidation: Error fetching steps:', stepsError);
          issues.push(`Steps query failed: ${stepsError.message}`);
        } else if (!steps || steps.length === 0) {
          issues.push('Workflow exists but has no steps');
          console.log('OnboardingValidation: Workflow has no steps, this should be fixed by the edge function');
        } else {
          console.log('OnboardingValidation: Found', steps.length, 'steps for workflow');
          
          // Validate step integrity - using actual schema fields
          const completedSteps = steps.filter(step => step.step_status === 'completed');
          if (steps.length > 0 && completedSteps.length === 0) {
            console.log('OnboardingValidation: All steps are pending - this is normal for new workflows');
          }

          // Check for step ordering gaps - using step_order instead of step_number
          const stepOrders = steps.map(s => s.step_order).sort((a, b) => a - b);
          for (let i = 1; i <= stepOrders.length; i++) {
            if (!stepOrders.includes(i)) {
              issues.push(`Missing step order ${i} in sequence`);
            }
          }
        }
      }

      // Step 4: Validate tenant branding and features (optional validation)
      const { data: branding } = await supabase
        .from('tenant_branding')
        .select('id, app_name')
        .eq('tenant_id', tenantId);

      const { data: features } = await supabase
        .from('tenant_features')
        .select('id')
        .eq('tenant_id', tenantId);

      if (!branding || branding.length === 0) {
        console.log('OnboardingValidation: No tenant branding found');
      }

      if (!features || features.length === 0) {
        console.log('OnboardingValidation: No tenant features found');
      }

      const isValid = issues.length === 0;
      
      console.log('OnboardingValidation: Validation complete:', {
        tenantId,
        isValid,
        issues: issues.length,
        repaired,
        workflowId
      });

      return {
        isValid,
        issues,
        repaired,
        workflowId
      };

    } catch (error) {
      console.error('OnboardingValidation: Validation failed:', error);
      issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, issues, repaired: false };
    }
  }

  /**
   * Force refresh onboarding data for a tenant
   */
  static async forceRefreshOnboarding(tenantId: string): Promise<boolean> {
    try {
      console.log('OnboardingValidation: Force refreshing onboarding for tenant:', tenantId);
      
      const validationResult = await this.validateAndRepairOnboarding(tenantId);
      
      if (validationResult.workflowId) {
        // Trigger a fresh fetch of complete onboarding data
        const onboardingData = await tenantDataService.getCompleteOnboardingData(tenantId);
        console.log('OnboardingValidation: Retrieved fresh onboarding data:', {
          workflowId: validationResult.workflowId,
          hasWorkflow: !!onboardingData?.workflow,
          stepCount: onboardingData?.steps?.length || 0
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('OnboardingValidation: Force refresh failed:', error);
      return false;
    }
  }

  /**
   * Get detailed onboarding status for debugging
   */
  static async getOnboardingDebugInfo(tenantId: string) {
    try {
      const [tenant, workflows, branding, features] = await Promise.all([
        supabase.from('tenants').select('*').eq('id', tenantId).single(),
        supabase.from('onboarding_workflows').select('*').eq('tenant_id', tenantId),
        supabase.from('tenant_branding').select('*').eq('tenant_id', tenantId),
        supabase.from('tenant_features').select('*').eq('tenant_id', tenantId)
      ]);

      let steps = null;
      if (workflows.data && workflows.data.length > 0) {
        const stepsQuery = await supabase
          .from('onboarding_steps')
          .select('*')
          .eq('workflow_id', workflows.data[0].id)
          .order('step_order');
        steps = stepsQuery.data;
      }

      return {
        tenant: tenant.data,
        workflows: workflows.data,
        steps: steps,
        branding: branding.data,
        features: features.data,
        errors: {
          tenant: tenant.error,
          workflows: workflows.error,
          branding: branding.error,
          features: features.error
        }
      };
    } catch (error) {
      console.error('OnboardingValidation: Debug info failed:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const onboardingValidationService = OnboardingValidationService;
