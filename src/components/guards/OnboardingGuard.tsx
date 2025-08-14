
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { onboardingService } from '@/services/OnboardingService';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTenantData } from '@/hooks/useTenantData';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [initializationComplete, setInitializationComplete] = useState(false);
  
  // First, ensure tenant data is loaded
  const { currentTenant, userTenants, loading: tenantLoading } = useTenantData();

  console.log('OnboardingGuard: Current state:', {
    user: user?.id,
    currentTenant: currentTenant?.id,
    tenantLoading,
    userTenantsCount: userTenants.length,
    initializationComplete
  });

  // Only check onboarding status after both user and tenant are loaded
  const shouldCheckOnboarding = !!(user && currentTenant?.id && !tenantLoading);

  console.log('OnboardingGuard: Should check onboarding:', shouldCheckOnboarding);

  const { data: isComplete, isLoading, refetch, error } = useQuery({
    queryKey: ['onboarding-status', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) {
        console.log('OnboardingGuard: No current tenant available for onboarding check');
        return null;
      }
      
      console.log('OnboardingGuard: Checking onboarding status for tenant:', currentTenant.id);
      
      try {
        // Use the enhanced service to get complete onboarding data
        const onboardingData = await onboardingService.getCompleteOnboardingData(currentTenant.id);
        
        console.log('OnboardingGuard: Retrieved onboarding data:', onboardingData);
        
        if (!onboardingData?.workflow) {
          console.log('OnboardingGuard: No workflow found, onboarding not complete');
          return false;
        }

        const isCompleted = onboardingData.workflow.status === 'completed';
        console.log('OnboardingGuard: Onboarding completion status:', isCompleted);
        return isCompleted;
      } catch (error) {
        console.error('OnboardingGuard: Error in onboarding status check:', error);
        return false;
      }
    },
    enabled: shouldCheckOnboarding,
    staleTime: 30000, // 30 seconds
    retry: (failureCount, err: any) => {
      console.error('OnboardingGuard: Query retry:', { failureCount, error: err });
      if (err && typeof err.message === 'string' && err.message.includes('tenant')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Handle initialization when needed
  useEffect(() => {
    console.log('OnboardingGuard: useEffect triggered:', {
      shouldCheckOnboarding,
      isLoading,
      isComplete,
      initializationComplete
    });

    if (!shouldCheckOnboarding || isLoading) {
      return;
    }

    if (isComplete === false && !initializationComplete) {
      console.log('OnboardingGuard: Initializing onboarding workflow');
      onboardingService.ensureWorkflowExists(currentTenant!.id)
        .then(() => {
          console.log('OnboardingGuard: Onboarding workflow ensured successfully');
          refetch();
          setInitializationComplete(true);
        })
        .catch((error) => {
          console.error('OnboardingGuard: Failed to ensure onboarding workflow:', error);
          setInitializationComplete(true); // Allow through even on error to prevent blocking
        });
    } else {
      setInitializationComplete(true);
    }
  }, [shouldCheckOnboarding, isComplete, isLoading, initializationComplete, refetch, currentTenant]);

  // Show loading while we're still checking authentication or loading tenant data
  if (!user) {
    console.log('OnboardingGuard: No user, allowing through');
    return <>{children}</>;
  }

  // Show loading while tenant data is loading
  if (tenantLoading) {
    console.log('OnboardingGuard: Tenant data loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no tenant data available, let them through (this might be a new user)
  if (!currentTenant && userTenants.length === 0) {
    console.warn('OnboardingGuard: User has no tenants, allowing through');
    return <>{children}</>;
  }

  // Show loading while onboarding data is being fetched or initialized
  if (shouldCheckOnboarding && (isLoading || !initializationComplete)) {
    console.log('OnboardingGuard: Onboarding check in progress, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error('OnboardingGuard error:', error);
    // Allow through on persistent errors to prevent blocking
    return <>{children}</>;
  }

  if (isComplete === false) {
    console.log('OnboardingGuard: Redirecting to onboarding - not complete');
    return <Navigate to="/onboarding" replace />;
  }

  console.log('OnboardingGuard: Allowing through, onboarding status:', isComplete);
  return <>{children}</>;
};
