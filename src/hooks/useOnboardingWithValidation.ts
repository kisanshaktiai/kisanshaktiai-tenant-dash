
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enhancedOnboardingService } from '@/services/EnhancedOnboardingService';
import { onboardingValidationService } from '@/services/OnboardingValidationService';
import { useTenantContextOptimized } from '@/contexts/TenantContextOptimized';
import { useErrorHandler } from '@/hooks/core/useErrorHandler';
import { globalErrorHandler } from '@/services/GlobalErrorHandler';

export const useOnboardingWithValidation = () => {
  const { currentTenant } = useTenantContextOptimized();
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler({
    component: 'useOnboardingWithValidation'
  });
  
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
        handleError(error, 'Failed to load onboarding data', {
          operation: 'validateAndFetch',
          tenantId: currentTenant.id
        });
        throw error;
      }
    },
    enabled: !!currentTenant?.id,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry client errors or circuit breaker errors
      if (error?.message?.includes('Circuit breaker') || 
          error?.message?.includes('required') ||
          error?.isClientError) {
        return false;
      }
      return failureCount < 1; // Reduced retry attempts
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
        globalErrorHandler.handleError('Onboarding data repaired successfully', {
          component: 'useOnboardingWithValidation',
          operation: 'validate',
          tenantId: currentTenant?.id
        }, {
          severity: 'low',
          showToast: true
        });
        
        queryClient.invalidateQueries({ 
          queryKey: ['onboarding-validated', currentTenant?.id] 
        });
      } else if (result.isValid) {
        globalErrorHandler.handleError('Onboarding data is valid', {
          component: 'useOnboardingWithValidation',
          operation: 'validate',
          tenantId: currentTenant?.id
        }, {
          severity: 'low',
          showToast: true
        });
      }
    },
    onError: (error) => {
      handleError(error, 'Failed to validate onboarding data', {
        operation: 'validate',
        tenantId: currentTenant?.id
      });
    }
  });

  const forceRefreshMutation = useMutation({
    mutationFn: async () => {
      if (!currentTenant?.id) {
        throw new Error('No current tenant available');
      }
      
      // Clear caches
      enhancedOnboardingService.clearCache();
      
      return await onboardingValidationService.forceRefreshOnboarding(currentTenant.id);
    },
    onSuccess: (success) => {
      if (success) {
        globalErrorHandler.handleError('Onboarding data refreshed successfully', {
          component: 'useOnboardingWithValidation',
          operation: 'forceRefresh',
          tenantId: currentTenant?.id
        }, {
          severity: 'low',
          showToast: true
        });
        
        queryClient.invalidateQueries({ 
          queryKey: ['onboarding-validated', currentTenant?.id] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['onboarding', currentTenant?.id] 
        });
      }
    },
    onError: (error) => {
      handleError(error, 'Failed to refresh onboarding data', {
        operation: 'forceRefresh',
        tenantId: currentTenant?.id
      });
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
