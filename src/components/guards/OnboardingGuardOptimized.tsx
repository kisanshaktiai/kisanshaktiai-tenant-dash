
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useTenantContextOptimized } from '@/contexts/TenantContextOptimized';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useRef } from 'react';
import { enhancedOnboardingService } from '@/services/EnhancedOnboardingService';

interface OnboardingGuardOptimizedProps {
  children: React.ReactNode;
}

export const OnboardingGuardOptimized: React.FC<OnboardingGuardOptimizedProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant, loading: tenantLoading, isInitialized } = useTenantContextOptimized();
  const [initializationComplete, setInitializationComplete] = useState(false);
  const initializationAttempted = useRef(false);

  console.log('OnboardingGuardOptimized: Current state:', {
    user: user?.id,
    currentTenant: currentTenant?.id,  
    tenantLoading,
    isInitialized,
    initializationComplete,
    initializationAttempted: initializationAttempted.current
  });

  // Only check onboarding if user is authenticated and tenant is loaded
  const shouldCheckOnboarding = !!(user && currentTenant?.id && isInitialized && !tenantLoading);

  const { data: isComplete, isLoading, error } = useQuery({
    queryKey: ['onboarding-status-optimized', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) {
        console.log('OnboardingGuardOptimized: No current tenant available for onboarding check');
        return null;
      }
      
      console.log('OnboardingGuardOptimized: Checking onboarding status for tenant:', currentTenant.id);
      
      try {
        const isCompleted = await enhancedOnboardingService.isOnboardingComplete(currentTenant.id);
        console.log('OnboardingGuardOptimized: Onboarding completion status for tenant', currentTenant.id, ':', isCompleted);
        return isCompleted;
      } catch (error) {
        console.error('OnboardingGuardOptimized: Error checking onboarding status for tenant', currentTenant.id, ':', error);
        return false; // Assume not complete on error
      }
    },
    enabled: shouldCheckOnboarding,
    staleTime: 60000, // Cache for 1 minute
    retry: 1, // Reduced retries to prevent loops
  });

  // Handle initialization when needed - prevent multiple attempts
  useEffect(() => {
    if (!shouldCheckOnboarding || isLoading || initializationComplete || initializationAttempted.current) {
      return;
    }

    if (isComplete === false) {
      console.log('OnboardingGuardOptimized: Onboarding not complete for tenant:', currentTenant?.id);
      initializationAttempted.current = true;
      setInitializationComplete(true);
    } else if (isComplete === true) {
      console.log('OnboardingGuardOptimized: Onboarding complete for tenant:', currentTenant?.id);
      initializationAttempted.current = true;
      setInitializationComplete(true);
    }
  }, [shouldCheckOnboarding, isComplete, isLoading, initializationComplete, currentTenant?.id]);

  // Show loading while authentication or tenant data is loading
  if (!user) {
    console.log('OnboardingGuardOptimized: No user, allowing through');
    return <>{children}</>;
  }

  if (tenantLoading || !isInitialized) {
    console.log('OnboardingGuardOptimized: Tenant data loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no tenant available after initialization, show loading or redirect
  if (!currentTenant) {
    console.warn('OnboardingGuardOptimized: User has no current tenant');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show loading while onboarding data is being checked
  if (shouldCheckOnboarding && (isLoading || !initializationComplete)) {
    console.log('OnboardingGuardOptimized: Onboarding check in progress for tenant:', currentTenant.id);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error('OnboardingGuardOptimized error for tenant', currentTenant.id, ':', error);
    // Allow through on persistent errors to prevent blocking
    return <>{children}</>;
  }

  // Bidirectional redirect logic
  const currentPath = window.location.pathname;
  
  // If onboarding is incomplete and not on onboarding page, redirect there
  if (isComplete === false && currentPath !== '/onboarding') {
    console.log('OnboardingGuardOptimized: Onboarding NOT complete, redirecting to /onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // If onboarding IS complete and user is on onboarding page, redirect to dashboard
  if (isComplete === true && currentPath === '/onboarding') {
    console.log('OnboardingGuardOptimized: Onboarding complete but on onboarding page, redirecting to dashboard');
    return <Navigate to="/app/dashboard" replace />;
  }

  // Allow through if onboarding is complete
  if (isComplete === true) {
    console.log('OnboardingGuardOptimized: Onboarding complete, allowing through');
    return <>{children}</>;
  }

  console.log('OnboardingGuardOptimized: Allowing through for tenant:', currentTenant.id, 'onboarding status:', isComplete);
  return <>{children}</>;
};
