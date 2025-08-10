
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
      
      try {
        // Use the enhanced service to get complete onboarding data
        const onboardingData = await onboardingService.getCompleteOnboardingData(currentTenant.id);
        
        if (!onboardingData?.workflow) {
          console.log('No workflow found for tenant:', currentTenant.id);
          return null;
        }
        
        console.log('Found workflow with steps:', { 
          workflow: onboardingData.workflow, 
          stepCount: onboardingData.steps.length 
        });
        
        return onboardingData;
      } catch (error) {
        console.error('Error in useOnboardingQuery:', error);
        throw error;
      }
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
      if (!currentTenant?.id) {
        throw new Error('No current tenant available');
      }

      console.log('Completing step:', { stepId, stepData, tenantId: currentTenant.id });
      
      const result = await onboardingService.completeStep(stepId, stepData, currentTenant.id);
      if (!result) {
        throw new Error('Failed to complete step');
      }
      
      return result;
    },
    onSuccess: () => {
      console.log('Step completed successfully, invalidating queries');
      
      // Invalidate and refetch onboarding queries
      queryClient.invalidateQueries({ 
        queryKey: ['onboarding', currentTenant?.id] 
      });
      
      // Also invalidate tenant status queries
      queryClient.invalidateQueries({ 
        queryKey: ['tenant-status', currentTenant?.id] 
      });
      
      // Refetch tenant data
      queryClient.invalidateQueries({ 
        queryKey: ['tenants'] 
      });
      
      // Force refetch after a short delay to ensure data consistency
      setTimeout(() => {
        queryClient.refetchQueries({ 
          queryKey: ['onboarding', currentTenant?.id] 
        });
      }, 500);
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
      if (!currentTenant?.id) {
        throw new Error('No current tenant available');
      }

      console.log('Updating step status:', { stepId, status, stepData, tenantId: currentTenant.id });
      
      const result = await onboardingService.updateStepStatus(stepId, status, stepData, currentTenant.id);
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
      
      // Force refetch to ensure UI synchronization
      setTimeout(() => {
        queryClient.refetchQueries({ 
          queryKey: ['onboarding', currentTenant?.id] 
        });
      }, 300);
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

// Enhanced hook for workflow completion
export const useCompleteWorkflow = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  
  return useMutation({
    mutationFn: async (workflowId: string) => {
      if (!currentTenant?.id) {
        throw new Error('No current tenant available');
      }

      console.log('Completing workflow:', { workflowId, tenantId: currentTenant.id });
      
      const result = await onboardingService.completeWorkflow(workflowId, currentTenant.id);
      if (!result) {
        throw new Error('Failed to complete workflow');
      }
      
      return result;
    },
    onSuccess: () => {
      console.log('Workflow completed successfully');
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['onboarding', currentTenant?.id] 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['onboarding-complete', currentTenant?.id] 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['tenants'] 
      });
      
      toast.success('🎉 Onboarding completed successfully! Welcome aboard!');
    },
    onError: (error) => {
      console.error('Failed to complete workflow:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    }
  });
};
