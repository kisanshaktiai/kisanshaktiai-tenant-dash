
import type { OnboardingWorkflow, OnboardingStep } from '@/services/EnhancedOnboardingService';
import { onboardingTemplateService } from '@/services/OnboardingTemplateService';

// Transform database step to frontend format with proper name mapping
export const transformDbStepToFrontend = (dbStep: any): OnboardingStep => {
  const stepData = typeof dbStep.step_data === 'object' ? dbStep.step_data : {};
  const displayName = stepData.display_name || onboardingTemplateService.getDisplayNameForStep(dbStep.step_name);
  
  return {
    id: dbStep.id,
    workflow_id: dbStep.workflow_id,
    step_order: dbStep.step_number,
    step_name: displayName, // Always use display name for frontend
    step_type: stepData.step_type || 'standard',
    step_config: stepData.step_config || {},
    step_data: stepData,
    step_status: dbStep.step_status === 'failed' ? 'pending' : dbStep.step_status,
    completed_at: dbStep.completed_at,
    created_at: dbStep.created_at,
    updated_at: dbStep.updated_at,
    step_number: dbStep.step_number,
    step_description: stepData.step_description || getDefaultStepDescription(dbStep.step_name),
    is_required: stepData.is_required !== false,
    estimated_time_minutes: stepData.estimated_time_minutes || getDefaultEstimatedTime(dbStep.step_name),
    started_at: dbStep.started_at || null
  };
};

// Transform frontend step data for database storage
export const transformFrontendStepToDb = (frontendStep: Partial<OnboardingStep>, stepData?: any) => {
  const dbStepName = frontendStep.step_name ? onboardingTemplateService.getStepNameFromDisplay(frontendStep.step_name) : undefined;
  
  return {
    step_name: dbStepName,
    step_number: frontendStep.step_order || frontendStep.step_number,
    step_status: frontendStep.step_status,
    step_data: {
      ...stepData,
      step_type: frontendStep.step_type,
      step_config: frontendStep.step_config,
      step_description: frontendStep.step_description,
      is_required: frontendStep.is_required,
      estimated_time_minutes: frontendStep.estimated_time_minutes,
      display_name: frontendStep.step_name
    },
    completed_at: frontendStep.completed_at,
    started_at: frontendStep.started_at
  };
};

// Get default step description based on step name
const getDefaultStepDescription = (stepName: string): string => {
  const descriptions = {
    'company_profile': 'Verify your business information and upload required documents',
    'branding': 'Configure your brand colors, logo, and visual identity', 
    'users_and_roles': 'Invite team members and set up user roles',
    'billing_plan': 'Choose your subscription plan and billing preferences',
    'domain_and_whitelabel': 'Select platform features and configure settings',
    'review_and_go_live': 'Import existing data and finalize setup'
  };
  
  return descriptions[stepName as keyof typeof descriptions] || 'Complete this onboarding step';
};

// Get default estimated time based on step name  
const getDefaultEstimatedTime = (stepName: string): number => {
  const times = {
    'company_profile': 15,
    'branding': 10, 
    'users_and_roles': 5,
    'billing_plan': 5,
    'domain_and_whitelabel': 10,
    'review_and_go_live': 20
  };
  
  return times[stepName as keyof typeof times] || 10;
};

// Transform workflow progress calculation
export const calculateWorkflowProgress = (steps: OnboardingStep[]): number => {
  if (steps.length === 0) return 0;
  
  const completedSteps = steps.filter(step => step.step_status === 'completed').length;
  return Math.round((completedSteps / steps.length) * 100);
};
