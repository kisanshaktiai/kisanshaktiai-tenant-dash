
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { useQuery } from '@tanstack/react-query';
import { enhancedOnboardingService } from '@/services/EnhancedOnboardingService';
import { tenantValidationService } from '@/services/TenantValidationService';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user, loading: authLoading, initialized } = useAuth();
  const { currentTenant, loading: tenantLoading, isInitialized } = useTenant();

  // Tenant validation check
  const { data: tenantValidation, isLoading: isValidating } = useQuery({
    queryKey: ['tenant-validation', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      return await tenantValidationService.checkUserCanLogin(user.email);
    },
    enabled: !!(user?.email && !tenantLoading && isInitialized),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Onboarding status check
  const { data: isOnboardingComplete, isLoading: isCheckingOnboarding } = useQuery({
    queryKey: ['onboarding-complete', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      return await enhancedOnboardingService.isOnboardingComplete(currentTenant.id);
    },
    enabled: !!(currentTenant?.id && tenantValidation?.canLogin),
    staleTime: 30000,
    retry: 1,
  });

  // Show loading while initializing
  if (!initialized || authLoading || !isInitialized || isValidating || isCheckingOnboarding) {
    return <LoadingScreen />;
  }

  // Redirect unauthenticated users
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Handle tenant validation
  if (tenantValidation && !tenantValidation.canLogin) {
    return <Navigate to="/auth/login" replace />;
  }

  // Redirect if no tenant
  if (!currentTenant) {
    return <Navigate to="/tenant-setup" replace />;
  }

  // Check onboarding completion
  if (tenantValidation?.tenantData && !tenantValidation.tenantData.onboarding_complete) {
    return <Navigate to="/onboarding" replace />;
  }

  if (isOnboardingComplete === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
