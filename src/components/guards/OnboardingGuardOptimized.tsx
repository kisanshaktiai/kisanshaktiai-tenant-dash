
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
  const { currentTenant, loading: tenantLoading, isInitialized, error: tenantError } = useTenantContextOptimized();
  const [initializationComplete, setInitializationComplete] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const initializationAttempted = useRef(false);

  // Only check onboarding if user is authenticated and tenant is loaded
  const shouldCheckOnboarding = !!(user && currentTenant?.id && isInitialized && !tenantLoading);

  const { data: isComplete, isLoading, error } = useQuery({
    queryKey: ['onboarding-status-optimized', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      
      try {
        const isCompleted = await enhancedOnboardingService.isOnboardingComplete(currentTenant.id);
        return isCompleted;
      } catch (error) {
        console.error('OnboardingGuardOptimized: Error checking onboarding:', error);
        return false;
      }
    },
    enabled: shouldCheckOnboarding,
    staleTime: 60000,
    retry: 1,
  });

  // Set timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  // Handle initialization when needed - prevent multiple attempts
  useEffect(() => {
    if (!shouldCheckOnboarding || isLoading || initializationComplete || initializationAttempted.current) {
      return;
    }

    if (isComplete !== undefined) {
      console.log('OnboardingGuardOptimized: Onboarding status determined:', isComplete);
      initializationAttempted.current = true;
      setInitializationComplete(true);
    }
  }, [shouldCheckOnboarding, isComplete, isLoading, initializationComplete]);

  // Show loading while authentication or tenant data is loading
  if (!user) {
    console.log('OnboardingGuardOptimized: No user, allowing through');
    return <>{children}</>;
  }

  if (tenantLoading || !isInitialized) {
    if (loadingTimeout) {
      console.warn('OnboardingGuardOptimized: Loading timeout, allowing through');
      return <>{children}</>;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading tenant data...</p>
        </div>
      </div>
    );
  }

  // If tenant error or timeout, allow through to show error
  if (tenantError && loadingTimeout) {
    console.warn('OnboardingGuardOptimized: Tenant error with timeout, allowing through');
    return <>{children}</>;
  }

  // If no tenant available after initialization, show loading or allow through
  if (!currentTenant) {
    if (loadingTimeout) {
      console.warn('OnboardingGuardOptimized: No tenant after timeout, allowing through');
      return <>{children}</>;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  // Show loading while onboarding data is being checked
  if (shouldCheckOnboarding && (isLoading || !initializationComplete)) {
    if (loadingTimeout) {
      console.warn('OnboardingGuardOptimized: Onboarding check timeout, allowing through');
      return <>{children}</>;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Checking onboarding status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('OnboardingGuardOptimized error:', error);
    // Allow through on error to prevent blocking
    return <>{children}</>;
  }

  // Bidirectional redirect logic
  const currentPath = window.location.pathname;
  
  // If onboarding is incomplete and not on onboarding page, redirect there
  if (isComplete === false && currentPath !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // If onboarding IS complete and user is on onboarding page, redirect to dashboard
  if (isComplete === true && currentPath === '/onboarding') {
    return <Navigate to="/app/dashboard" replace />;
  }

  // Allow through if onboarding is complete
  if (isComplete === true) {
    return <>{children}</>;
  }

  return <>{children}</>;
};
