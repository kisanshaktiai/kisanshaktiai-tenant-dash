
import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useUpdateStepStatus } from './useOnboarding';

export const useOnboardingAutoProgress = (steps: any[], workflowId?: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const updateStepMutation = useUpdateStepStatus();

  useEffect(() => {
    if (!currentTenant || !steps.length || !workflowId) return;

    // Auto-detect completed steps based on tenant data
    steps.forEach(async (step) => {
      if (step.step_status === 'completed') return;

      let shouldMarkComplete = false;

      switch (step.step_name) {
        case 'Business Verification':
          shouldMarkComplete = !!(
            currentTenant.metadata?.verification?.gst_number &&
            currentTenant.metadata?.verification?.pan_number
          );
          break;

        case 'Subscription Plan':
          shouldMarkComplete = !!(
            currentTenant.subscription_plan &&
            currentTenant.subscription_plan !== 'trial'
          );
          break;

        case 'Branding Configuration':
          shouldMarkComplete = !!(
            currentTenant.branding?.app_name &&
            currentTenant.branding?.primary_color
          );
          break;

        case 'Feature Selection':
          shouldMarkComplete = !!currentTenant.features;
          break;

        case 'Data Import':
          // Mark as complete if user has skipped or if migration jobs exist
          shouldMarkComplete = !!(
            step.step_data?.skipped ||
            step.step_data?.importMethod === 'skip'
          );
          break;

        case 'Team Invites':
          // Mark as complete if user has sent invites or skipped
          shouldMarkComplete = !!(
            step.step_data?.invitesSent ||
            step.step_data?.skipped
          );
          break;
      }

      if (shouldMarkComplete && step.step_status === 'pending') {
        updateStepMutation.mutate({
          stepId: step.id,
          status: 'completed',
          stepData: step.step_data
        });
      }
    });
  }, [currentTenant, steps, workflowId, updateStepMutation]);
};
