
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useTenantContext } from '@/contexts/TenantContext';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { enhancedOnboardingService } from '@/services/EnhancedOnboardingService';
import { tenantValidationService } from '@/services/TenantValidationService';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant, loading: tenantLoading, isInitialized } = useTenantContext();

  // Memoize the validation check to prevent unnecessary re-runs
  const shouldValidate = useMemo(() => {
    return !!(user?.email && !tenantLoading && isInitialized);
  }, [user?.email, tenantLoading, isInitialized]);

  // Single query for tenant validation
  const { data: tenantValidation, isLoading: isValidating } = useQuery({
    queryKey: ['tenant-validation', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      
      const validation = await tenantValidationService.checkUserCanLogin(user.email);
      return validation;
    },
    enabled: shouldValidate,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Single query for onboarding status
  const { data: isOnboardingComplete, isLoading: isCheckingOnboarding } = useQuery({
    queryKey: ['onboarding-complete', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      return await enhancedOnboardingService.isOnboardingComplete(currentTenant.id);
    },
    enabled: !!(currentTenant?.id && tenantValidation?.canLogin && !tenantValidation.needsOnboarding),
    staleTime: 30000,
    retry: 1,
  });

  // Early returns for loading states
  if (!user) {
    return <>{children}</>;
  }

  if (isValidating || tenantLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle tenant validation results
  if (tenantValidation && !tenantValidation.canLogin) {
    return <Navigate to="/auth" replace />;
  }

  if (tenantValidation?.needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!currentTenant) {
    return <Navigate to="/auth" replace />;
  }

  // Handle detailed onboarding check
  if (isCheckingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isOnboardingComplete === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
