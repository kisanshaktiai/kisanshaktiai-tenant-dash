
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enhancedOnboardingService } from '@/services/EnhancedOnboardingService';
import { useTenantContext } from '@/contexts/TenantContext';
import { toast } from 'sonner';

export const useOnboardingQuery = () => {
  const { currentTenant } = useTenantContext();
  
  return useQuery({
    queryKey: ['onboarding', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) {
        console.log('useOnboardingQuery: No current tenant available for onboarding query');
        return null;
      }
      
      console.log('useOnboardingQuery: Fetching onboarding data for tenant:', currentTenant.id);
      
      try {
        const onboardingData = await enhancedOnboardingService.getOnboardingData(currentTenant.id);
        
        console.log('useOnboardingQuery: Retrieved onboarding data:', onboardingData);
        
        if (!onboardingData?.workflow) {
          console.log('useOnboardingQuery: No workflow found, initializing...');
          return await enhancedOnboardingService.initializeOnboardingWorkflow(currentTenant.id);
        }
        
        return onboardingData;
      } catch (error) {
        console.error('useOnboardingQuery: Error in query:', error);
        throw error;
      }
    },
    enabled: !!currentTenant?.id,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      console.error('useOnboardingQuery: Retry attempt:', { failureCount, error });
      if (error && typeof error.message === 'string' && error.message.includes('tenant')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

export const useCompleteStep = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenantContext();
  
  return useMutation({
    mutationFn: async ({ stepId, stepData }: { stepId: string; stepData?: any }) => {
      if (!currentTenant?.id) {
        throw new Error('No current tenant available');
      }

      console.log('useCompleteStep: Completing step:', { stepId, stepData, tenantId: currentTenant.id });
      
      const result = await enhancedOnboardingService.completeStep(stepId, stepData, currentTenant.id);
      if (!result) {
        throw new Error('Failed to complete step');
      }
      
      return result;
    },
    onSuccess: () => {
      console.log('useCompleteStep: Step completed successfully, invalidating queries');
      
      queryClient.invalidateQueries({ 
        queryKey: ['onboarding', currentTenant?.id] 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['tenant-status', currentTenant?.id] 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['tenants'] 
      });
      
      setTimeout(() => {
        queryClient.refetchQueries({ 
          queryKey: ['onboarding', currentTenant?.id] 
        });
      }, 500);
    },
    onError: (error) => {
      console.error('useCompleteStep: Failed to complete step:', error);
      toast.error('Failed to save progress. Please try again.');
    }
  });
};

export const useUpdateStepStatus = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenantContext();
  
  return useMutation({
    mutationFn: async ({ stepId, status, stepData }: { 
      stepId: string; 
      status: 'pending' | 'in_progress' | 'completed' | 'skipped'; 
      stepData?: any 
    }) => {
      if (!currentTenant?.id) {
        throw new Error('No current tenant available');
      }

      console.log('useUpdateStepStatus: Updating step status:', { stepId, status, stepData, tenantId: currentTenant.id });
      
      const result = await enhancedOnboardingService.updateStepStatus(stepId, status, stepData, currentTenant.id);
      if (!result) {
        throw new Error('Failed to update step status');
      }
      
      return result;
    },
    onSuccess: (_, variables) => {
      console.log('useUpdateStepStatus: Step status updated successfully');
      
      queryClient.invalidateQueries({ 
        queryKey: ['onboarding', currentTenant?.id] 
      });
      
      setTimeout(() => {
        queryClient.refetchQueries({ 
          queryKey: ['onboarding', currentTenant?.id] 
        });
      }, 300);
    },
    onError: (error) => {
      console.error('useUpdateStepStatus: Failed to update step status:', error);
      toast.error('Failed to update step. Please try again.');
    }
  });
};

export const useIsOnboardingComplete = () => {
  const { currentTenant } = useTenantContext();
  
  return useQuery({
    queryKey: ['onboarding-complete', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) {
        console.log('useIsOnboardingComplete: No tenant ID available');
        return false;
      }
      
      console.log('useIsOnboardingComplete: Checking completion for tenant:', currentTenant.id);
      return await enhancedOnboardingService.isOnboardingComplete(currentTenant.id);
    },
    enabled: !!currentTenant?.id,
    staleTime: 60000,
  });
};

export const useCompleteWorkflow = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenantContext();
  
  return useMutation({
    mutationFn: async (workflowId: string) => {
      if (!currentTenant?.id) {
        throw new Error('No current tenant available');
      }

      console.log('useCompleteWorkflow: Completing workflow:', { workflowId, tenantId: currentTenant.id });
      
      const result = await enhancedOnboardingService.completeWorkflow(workflowId, currentTenant.id);
      if (!result) {
        throw new Error('Failed to complete workflow');
      }
      
      return result;
    },
    onSuccess: () => {
      console.log('useCompleteWorkflow: Workflow completed successfully');
      
      queryClient.invalidateQueries({ 
        queryKey: ['onboarding', currentTenant?.id] 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['onboarding-complete', currentTenant?.id] 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['tenants'] 
      });
    },
    onError: (error) => {
      console.error('useCompleteWorkflow: Failed to complete workflow:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    }
  });
};

export const useOnboardingValidation = () => {
  const { currentTenant } = useTenantContext();
  
  return useMutation({
    mutationFn: async () => {
      if (!currentTenant?.id) {
        throw new Error('No current tenant available');
      }
      
      return await enhancedOnboardingService.validateOnboardingIntegrity(currentTenant.id);
    },
    onSuccess: (result) => {
      if (result.repaired) {
        toast.success('Onboarding data has been repaired successfully!');
      } else if (result.isValid) {
        toast.success('Onboarding data is valid!');
      } else {
        toast.warning('Onboarding data has issues that need attention.');
      }
    },
    onError: (error) => {
      console.error('Onboarding validation failed:', error);
      toast.error('Failed to validate onboarding data.');
    }
  });
};
