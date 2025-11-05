
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

  // Handle initialization when needed - prevent multiple attempts
  useEffect(() => {
    if (!shouldCheckOnboarding || isLoading || initializationComplete || initializationAttempted.current) {
      return;
    }

    if (isComplete !== undefined) {
      initializationAttempted.current = true;
      setInitializationComplete(true);
    }
  }, [shouldCheckOnboarding, isComplete, isLoading, initializationComplete]);

  // Show loading while authentication or tenant data is loading
  if (!user) {
    return <>{children}</>;
  }

  if (tenantLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no tenant available after initialization, show loading
  if (!currentTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show loading while onboarding data is being checked
  if (shouldCheckOnboarding && (isLoading || !initializationComplete)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error('OnboardingGuardOptimized error:', error);
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
