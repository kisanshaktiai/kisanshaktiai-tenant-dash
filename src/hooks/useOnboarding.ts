
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingService, OnboardingWorkflow, OnboardingStep } from '@/services/OnboardingService';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

export const useOnboardingQuery = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  
  return useQuery({
    queryKey: ['onboarding', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      
      console.log('Fetching onboarding data for tenant:', currentTenant.id);
      
      const workflow = await onboardingService.getWorkflowByTenantId(currentTenant.id);
      if (!workflow) {
        console.log('No workflow found for tenant:', currentTenant.id);
        return null;
      }
      
      const steps = await onboardingService.getWorkflowSteps(workflow.id);
      console.log('Found workflow with steps:', { workflow, stepCount: steps.length });
      
      return {
        workflow,
        steps: steps.sort((a, b) => a.step_number - b.step_number)
      };
    },
    enabled: !!currentTenant?.id,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      console.error('Onboarding query error:', error);
      if (error && typeof error.message === 'string' && error.message.includes('tenant')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

export const useCompleteStep = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  
  return useMutation({
    mutationFn: async ({ stepId, stepData }: { stepId: string; stepData?: any }) => {
      console.log('Completing step:', { stepId, stepData });
      
      const result = await onboardingService.completeStep(stepId, stepData);
      if (!result) {
        throw new Error('Failed to complete step');
      }
      
      return result;
    },
    onSuccess: () => {
      console.log('Step completed successfully, invalidating queries');
      
      // Invalidate onboarding queries to trigger refetch
      queryClient.invalidateQueries({ 
        queryKey: ['onboarding', currentTenant?.id] 
      });
      
      // Also invalidate any dashboard queries that might depend on onboarding status
      queryClient.invalidateQueries({ 
        queryKey: ['tenant-status', currentTenant?.id] 
      });
    },
    onError: (error) => {
      console.error('Failed to complete step:', error);
      toast.error('Failed to save progress. Please try again.');
    }
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
      console.log('Updating step status:', { stepId, status, stepData });
      
      const result = await onboardingService.updateStepStatus(stepId, status, stepData);
      if (!result) {
        throw new Error('Failed to update step status');
      }
      
      return result;
    },
    onSuccess: (_, variables) => {
      console.log('Step status updated successfully');
      
      // Invalidate queries for real-time updates
      queryClient.invalidateQueries({ 
        queryKey: ['onboarding', currentTenant?.id] 
      });
      
      // Show success message for completed steps
      if (variables.status === 'completed') {
        toast.success('Step completed successfully!');
      }
    },
    onError: (error) => {
      console.error('Failed to update step status:', error);
      toast.error('Failed to update step. Please try again.');
    }
  });
};

// Helper hook to check if onboarding is complete
export const useIsOnboardingComplete = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  
  return useQuery({
    queryKey: ['onboarding-complete', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return false;
      return await onboardingService.isOnboardingComplete(currentTenant.id);
    },
    enabled: !!currentTenant?.id,
    staleTime: 60000, // 1 minute
  });
};
