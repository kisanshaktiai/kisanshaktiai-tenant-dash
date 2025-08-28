
import { supabase } from '@/integrations/supabase/client';
import type { OnboardingStep } from './EnhancedOnboardingService';

interface StepTemplate {
  step_name: string;
  display_name: string;
  step_order: number;
  step_description: string;
  is_required: boolean;
  estimated_time_minutes: number;
  step_type: string;
  step_config: any;
}

class OnboardingTemplateService {
  private getStepTemplatesForPlan(subscriptionPlan: string): StepTemplate[] {
    const baseSteps: StepTemplate[] = [
      {
        step_name: 'company_profile',
        display_name: 'Business Verification',
        step_order: 1,
        step_description: 'Verify your business information and upload required documents',
        is_required: true,
        estimated_time_minutes: 15,
        step_type: 'standard',
        step_config: {
          fields: ['companyName', 'ownerName', 'email', 'phone', 'address', 'businessRegistration']
        }
      },
      {
        step_name: 'billing_plan',
        display_name: 'Subscription Plan',
        step_order: 2,
        step_description: 'Choose your subscription plan and billing preferences',
        is_required: true,
        estimated_time_minutes: 5,
        step_type: 'standard',
        step_config: {
          availablePlans: ['Kisan_Basic', 'Shakti_Growth', 'AI_Enterprise']
        }
      },
      {
        step_name: 'branding',
        display_name: 'Branding Configuration',
        step_order: 3,
        step_description: 'Configure your brand colors, logo, and visual identity',
        is_required: true,
        estimated_time_minutes: 10,
        step_type: 'standard',
        step_config: {
          fields: ['appName', 'primaryColor', 'secondaryColor', 'logoUrl']
        }
      },
      {
        step_name: 'domain_and_whitelabel',
        display_name: 'Feature Selection',
        step_order: 4,
        step_description: 'Select platform features and configure settings',
        is_required: true,
        estimated_time_minutes: 10,
        step_type: 'standard',
        step_config: {
          featureCategories: ['core', 'communication', 'analytics', 'technology']
        }
      },
      {
        step_name: 'review_and_go_live',
        display_name: 'Data Import',
        step_order: 5,
        step_description: 'Import existing data and finalize setup',
        is_required: true,
        estimated_time_minutes: 20,
        step_type: 'standard',
        step_config: {
          importOptions: ['csv', 'excel', 'api', 'skip']
        }
      },
      {
        step_name: 'users_and_roles',
        display_name: 'Team Setup',
        step_order: 6,
        step_description: 'Invite team members and set up user roles',
        is_required: true,
        estimated_time_minutes: 5,
        step_type: 'standard',
        step_config: {
          roles: ['tenant_admin', 'tenant_manager', 'viewer']
        }
      }
    ];

    // Customize steps based on subscription plan
    if (subscriptionPlan === 'AI_Enterprise') {
      baseSteps.push({
        step_name: 'security_configuration',
        display_name: 'Security Configuration',
        step_order: 7,
        step_description: 'Set up SSO, API keys, and security policies',
        is_required: true,
        estimated_time_minutes: 30,
        step_type: 'enterprise',
        step_config: {
          features: ['sso', 'api_keys', 'security_policies']
        }
      });
    }

    return baseSteps;
  }

  async createStepsFromTemplate(workflowId: string, tenantId: string, subscriptionPlan: string = 'Kisan_Basic'): Promise<void> {
    const templates = this.getStepTemplatesForPlan(subscriptionPlan);
    
    console.log('OnboardingTemplateService: Creating steps from template:', {
      workflowId,
      tenantId,
      subscriptionPlan,
      stepCount: templates.length
    });

    for (const template of templates) {
      const { error } = await supabase
        .from('onboarding_steps')
        .insert({
          workflow_id: workflowId,
          step_name: template.step_name,
          step_number: template.step_order,
          step_status: 'pending',
          step_data: {
            step_description: template.step_description,
            is_required: template.is_required,
            estimated_time_minutes: template.estimated_time_minutes,
            step_type: template.step_type,
            step_config: template.step_config,
            display_name: template.display_name
          }
        });

      if (error) {
        console.error('OnboardingTemplateService: Error creating step:', {
          stepName: template.step_name,
          error
        });
        throw new Error(`Failed to create step ${template.step_name}: ${error.message}`);
      }
    }

    console.log('OnboardingTemplateService: Successfully created all steps from template');
  }

  getDisplayNameForStep(stepName: string): string {
    const mapping: Record<string, string> = {
      'company_profile': 'Business Verification',
      'billing_plan': 'Subscription Plan',
      'branding': 'Branding Configuration',
      'domain_and_whitelabel': 'Feature Selection',
      'review_and_go_live': 'Data Import',
      'users_and_roles': 'Team Setup',
      'security_configuration': 'Security Configuration'
    };

    return mapping[stepName] || stepName;
  }

  getStepNameFromDisplay(displayName: string): string {
    const mapping: Record<string, string> = {
      'Business Verification': 'company_profile',
      'Subscription Plan': 'billing_plan',
      'Branding Configuration': 'branding',
      'Feature Selection': 'domain_and_whitelabel',
      'Data Import': 'review_and_go_live',
      'Team Setup': 'users_and_roles',
      'Security Configuration': 'security_configuration'
    };

    return mapping[displayName] || displayName;
  }
}

export const onboardingTemplateService = new OnboardingTemplateService();
