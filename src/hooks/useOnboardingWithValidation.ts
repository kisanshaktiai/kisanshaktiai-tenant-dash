
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enhancedOnboardingService } from '@/services/EnhancedOnboardingService';
import { onboardingValidationService } from '@/services/OnboardingValidationService';
import { useTenantContext } from '@/contexts/TenantContext';
import { toast } from 'sonner';

export const useOnboardingWithValidation = () => {
  const { currentTenant } = useTenantContext();
  const queryClient = useQueryClient();
  
  const onboardingQuery = useQuery({
    queryKey: ['onboarding-validated', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) {
        console.log('useOnboardingWithValidation: No current tenant available');
        return null;
      }
      
      console.log('useOnboardingWithValidation: Validating and fetching onboarding for tenant:', currentTenant.id);
      
      try {
        // First validate and repair if needed
        const validationResult = await onboardingValidationService.validateAndRepairOnboarding(currentTenant.id);
        
        if (!validationResult.isValid && validationResult.issues.length > 0) {
          console.warn('useOnboardingWithValidation: Validation issues found:', validationResult.issues);
          
          if (!validationResult.repaired) {
            throw new Error(`Onboarding validation failed: ${validationResult.issues.join(', ')}`);
          } else {
            toast.success('Onboarding data has been repaired');
          }
        }
        
        // Then fetch the complete onboarding data
        const onboardingData = await enhancedOnboardingService.getOnboardingData(currentTenant.id);
        
        console.log('useOnboardingWithValidation: Retrieved validated onboarding data:', {
          hasWorkflow: !!onboardingData?.workflow,
          stepCount: onboardingData?.steps?.length || 0,
          workflowId: onboardingData?.workflow?.id
        });
        
        return {
          ...onboardingData,
          validationResult
        };
      } catch (error) {
        console.error('useOnboardingWithValidation: Error in validated query:', error);
        throw error;
      }
    },
    enabled: !!currentTenant?.id,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      console.error('useOnboardingWithValidation: Retry attempt:', { failureCount, error });
      return failureCount < 2;
    },
  });

  const validateMutation = useMutation({
    mutationFn: async () => {
      if (!currentTenant?.id) {
        throw new Error('No current tenant available');
      }
      return await onboardingValidationService.validateAndRepairOnboarding(currentTenant.id);
    },
    onSuccess: (result) => {
      if (result.repaired) {
        toast.success('Onboarding data has been repaired!');
        queryClient.invalidateQueries({ 
          queryKey: ['onboarding-validated', currentTenant?.id] 
        });
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

  const forceRefreshMutation = useMutation({
    mutationFn: async () => {
      if (!currentTenant?.id) {
        throw new Error('No current tenant available');
      }
      return await onboardingValidationService.forceRefreshOnboarding(currentTenant.id);
    },
    onSuccess: (success) => {
      if (success) {
        toast.success('Onboarding data refreshed successfully!');
        queryClient.invalidateQueries({ 
          queryKey: ['onboarding-validated', currentTenant?.id] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['onboarding', currentTenant?.id] 
        });
      } else {
        toast.warning('Failed to refresh onboarding data.');
      }
    },
    onError: (error) => {
      console.error('Force refresh failed:', error);
      toast.error('Failed to refresh onboarding data.');
    }
  });

  const debugInfoQuery = useQuery({
    queryKey: ['onboarding-debug', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      return await onboardingValidationService.getOnboardingDebugInfo(currentTenant.id);
    },
    enabled: false, // Only run when explicitly requested
  });

  return {
    onboardingData: onboardingQuery.data,
    isLoading: onboardingQuery.isLoading,
    error: onboardingQuery.error,
    validate: validateMutation.mutate,
    isValidating: validateMutation.isPending,
    forceRefresh: forceRefreshMutation.mutate,
    isRefreshing: forceRefreshMutation.isPending,
    getDebugInfo: debugInfoQuery.refetch,
    debugInfo: debugInfoQuery.data,
    refetch: onboardingQuery.refetch
  };
};
