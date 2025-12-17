
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enhancedOnboardingService } from '@/services/EnhancedOnboardingService';
import { useTenantContextOptimized } from '@/contexts/TenantContextOptimized';
import { toast } from 'sonner';

export const useOnboardingQuery = () => {
  const { currentTenant } = useTenantContextOptimized();
  
  return useQuery({
    queryKey: ['onboarding', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      
      try {
        const onboardingData = await enhancedOnboardingService.getOnboardingData(currentTenant.id);
        
        if (!onboardingData?.workflow) {
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
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error && typeof error.message === 'string' && error.message.includes('tenant')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

export const useCompleteStep = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenantContextOptimized();
  
  return useMutation({
    mutationFn: async ({ stepId, stepData }: { stepId: string; stepData?: any }) => {
      if (!currentTenant?.id) throw new Error('No current tenant available');
      
      const result = await enhancedOnboardingService.completeStep(stepId, stepData, currentTenant.id);
      if (!result) throw new Error('Failed to complete step');
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', currentTenant?.id] });
      queryClient.invalidateQueries({ queryKey: ['tenant-status', currentTenant?.id] });
    },
    onError: (error) => {
      console.error('useCompleteStep: Failed to complete step:', error);
      toast.error('Failed to save progress. Please try again.');
    }
  });
};

export const useUpdateStepStatus = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenantContextOptimized();
  
  return useMutation({
    mutationFn: async ({ stepId, status, stepData }: { 
      stepId: string; 
      status: 'pending' | 'in_progress' | 'completed' | 'skipped'; 
      stepData?: any 
    }) => {
      if (!currentTenant?.id) throw new Error('No current tenant available');
      
      const result = await enhancedOnboardingService.updateStepStatus(stepId, status, stepData, currentTenant.id);
      if (!result) throw new Error('Failed to update step status');
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', currentTenant?.id] });
    },
    onError: (error) => {
      console.error('useUpdateStepStatus: Failed to update step status:', error);
      toast.error('Failed to update step. Please try again.');
    }
  });
};

export const useIsOnboardingComplete = () => {
  const { currentTenant } = useTenantContextOptimized();
  
  return useQuery({
    queryKey: ['onboarding-complete', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return false;
      return await enhancedOnboardingService.isOnboardingComplete(currentTenant.id);
    },
    enabled: !!currentTenant?.id,
    staleTime: 60000,
    gcTime: 120000,
  });
};

export const useCompleteWorkflow = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenantContextOptimized();
  
  return useMutation({
    mutationFn: async (workflowId: string) => {
      if (!currentTenant?.id) throw new Error('No current tenant available');
      
      const result = await enhancedOnboardingService.completeWorkflow(workflowId, currentTenant.id);
      if (!result) throw new Error('Failed to complete workflow');
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', currentTenant?.id] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-complete', currentTenant?.id] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
    onError: (error) => {
      console.error('useCompleteWorkflow: Failed to complete workflow:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    }
  });
};

export const useOnboardingValidation = () => {
  const { currentTenant } = useTenantContextOptimized();
  
  return useMutation({
    mutationFn: async () => {
      if (!currentTenant?.id) throw new Error('No current tenant available');
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
