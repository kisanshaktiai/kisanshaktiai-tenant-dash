
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useTenantContextOptimized } from '@/contexts/TenantContextOptimized';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { enhancedOnboardingService } from '@/services/EnhancedOnboardingService';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant, loading: tenantLoading, isInitialized } = useTenantContextOptimized();
  const [initializationComplete, setInitializationComplete] = useState(false);

  console.log('OnboardingGuard: Current state:', {
    user: user?.id,
    currentTenant: currentTenant?.id,
    tenantLoading,
    isInitialized,
    initializationComplete
  });

  // Only check onboarding if user is authenticated and tenant is loaded
  const shouldCheckOnboarding = !!(user && currentTenant?.id && isInitialized && !tenantLoading);

  const { data: isComplete, isLoading, refetch, error } = useQuery({
    queryKey: ['onboarding-status', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) {
        console.log('OnboardingGuard: No current tenant available for onboarding check');
        return null;
      }
      
      console.log('OnboardingGuard: Checking onboarding status for tenant:', currentTenant.id);
      
      try {
        const isCompleted = await enhancedOnboardingService.isOnboardingComplete(currentTenant.id);
        console.log('OnboardingGuard: Onboarding completion status for tenant', currentTenant.id, ':', isCompleted);
        return isCompleted;
      } catch (error) {
        console.error('OnboardingGuard: Error checking onboarding status for tenant', currentTenant.id, ':', error);
        return false; // Assume not complete on error
      }
    },
    enabled: shouldCheckOnboarding,
    staleTime: 30000,
    retry: (failureCount, err: any) => {
      console.error('OnboardingGuard: Query retry for tenant', currentTenant?.id, ':', { failureCount, error: err });
      return failureCount < 2;
    },
  });

  // Handle initialization when needed
  useEffect(() => {
    if (!shouldCheckOnboarding || isLoading || initializationComplete) {
      return;
    }

    if (isComplete === false) {
      console.log('OnboardingGuard: Onboarding not complete for tenant:', currentTenant?.id);
      setInitializationComplete(true);
    } else if (isComplete === true) {
      console.log('OnboardingGuard: Onboarding complete for tenant:', currentTenant?.id);
      setInitializationComplete(true);
    }
  }, [shouldCheckOnboarding, isComplete, isLoading, initializationComplete, currentTenant?.id]);

  // Show loading while authentication or tenant data is loading
  if (!user) {
    console.log('OnboardingGuard: No user, allowing through');
    return <>{children}</>;
  }

  if (tenantLoading || !isInitialized) {
    console.log('OnboardingGuard: Tenant data loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no tenant available, redirect to tenant selection or registration
  if (!currentTenant) {
    console.warn('OnboardingGuard: User has no current tenant, redirecting to setup');
    return <Navigate to="/tenant-setup" replace />;
  }

  // Show loading while onboarding data is being checked
  if (shouldCheckOnboarding && (isLoading || !initializationComplete)) {
    console.log('OnboardingGuard: Onboarding check in progress for tenant:', currentTenant.id);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error('OnboardingGuard error for tenant', currentTenant.id, ':', error);
    // Allow through on persistent errors to prevent blocking
    return <>{children}</>;
  }

  if (isComplete === false) {
    console.log('OnboardingGuard: Redirecting to onboarding for tenant:', currentTenant.id);
    return <Navigate to="/onboarding" replace />;
  }

  console.log('OnboardingGuard: Allowing through for tenant:', currentTenant.id, 'onboarding status:', isComplete);
  return <>{children}</>;
};
