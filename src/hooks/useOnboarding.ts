
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingService, OnboardingWorkflow, OnboardingStep } from '@/services/OnboardingService';
import { useAppSelector } from '@/store/hooks';

export const useOnboardingQuery = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  
  return useQuery({
    queryKey: ['onboarding', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      
      const workflow = await onboardingService.getWorkflowByTenantId(currentTenant.id);
      if (!workflow) return null;
      
      const steps = await onboardingService.getWorkflowSteps(workflow.id);
      
      return {
        workflow,
        steps
      };
    },
    enabled: !!currentTenant?.id,
  });
};

export const useCompleteStep = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  
  return useMutation({
    mutationFn: async ({ stepId, stepData }: { stepId: string; stepData?: any }) => {
      return await onboardingService.completeStep(stepId, stepData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', currentTenant?.id] });
    },
  });
};

export const useUpdateStepStatus = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  
  return useMutation({
    mutationFn: async ({ stepId, status, stepData }: { 
      stepId: string; 
      status: OnboardingStep['step_status']; 
      stepData?: any 
    }) => {
      return await onboardingService.updateStepStatus(stepId, status, stepData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', currentTenant?.id] });
    },
  });
};
