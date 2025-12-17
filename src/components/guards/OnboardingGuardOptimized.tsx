import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useTenantContextOptimized } from '@/contexts/TenantContextOptimized';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useRef, useMemo } from 'react';
import { enhancedOnboardingService } from '@/services/EnhancedOnboardingService';

interface OnboardingGuardOptimizedProps {
  children: React.ReactNode;
}

const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

export const OnboardingGuardOptimized: React.FC<OnboardingGuardOptimizedProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant, loading: tenantLoading, isInitialized, error: tenantError } = useTenantContextOptimized();
  const [initializationComplete, setInitializationComplete] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const initializationAttempted = useRef(false);

  const shouldCheckOnboarding = !!(user && currentTenant?.id && isInitialized && !tenantLoading);

  const { data: isComplete, isLoading, error } = useQuery({
    queryKey: ['onboarding-status-optimized', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      try {
        return await enhancedOnboardingService.isOnboardingComplete(currentTenant.id);
      } catch {
        return false;
      }
    },
    enabled: shouldCheckOnboarding,
    staleTime: 60000,
    gcTime: 120000,
    retry: 1,
  });

  useEffect(() => {
    const timeout = setTimeout(() => setLoadingTimeout(true), 4000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!shouldCheckOnboarding || isLoading || initializationComplete || initializationAttempted.current) return;
    if (isComplete !== undefined) {
      initializationAttempted.current = true;
      setInitializationComplete(true);
    }
  }, [shouldCheckOnboarding, isComplete, isLoading, initializationComplete]);

  // Memoize navigation decision
  const navigationResult = useMemo(() => {
    // No user - allow through
    if (!user) return { type: 'allow' as const };
    
    // Tenant loading
    if ((tenantLoading || !isInitialized) && !loadingTimeout) {
      return { type: 'loading' as const, message: 'Loading tenant data...' };
    }
    
    // Tenant error with timeout
    if ((tenantError && loadingTimeout) || (!currentTenant && loadingTimeout)) {
      return { type: 'allow' as const };
    }
    
    // No tenant
    if (!currentTenant && !loadingTimeout) {
      return { type: 'loading' as const, message: 'Initializing...' };
    }
    
    // Onboarding check loading
    if (shouldCheckOnboarding && (isLoading || !initializationComplete) && !loadingTimeout) {
      return { type: 'loading' as const, message: 'Checking onboarding status...' };
    }
    
    // Error - allow through
    if (error) return { type: 'allow' as const };
    
    // Navigate based on onboarding status
    const currentPath = window.location.pathname;
    if (isComplete === false && currentPath !== '/onboarding') {
      return { type: 'redirect' as const, to: '/onboarding' };
    }
    if (isComplete === true && currentPath === '/onboarding') {
      return { type: 'redirect' as const, to: '/app/dashboard' };
    }
    
    return { type: 'allow' as const };
  }, [user, tenantLoading, isInitialized, loadingTimeout, tenantError, currentTenant, shouldCheckOnboarding, isLoading, initializationComplete, error, isComplete]);

  if (navigationResult.type === 'loading') {
    return <LoadingSpinner message={navigationResult.message} />;
  }
  
  if (navigationResult.type === 'redirect') {
    return <Navigate to={navigationResult.to} replace />;
  }

  return <>{children}</>;
};
