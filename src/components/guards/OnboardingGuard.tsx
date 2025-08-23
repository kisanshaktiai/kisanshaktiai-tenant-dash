
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useTenantContext } from '@/contexts/TenantContext';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { enhancedOnboardingService } from '@/services/EnhancedOnboardingService';
import { tenantValidationService } from '@/services/TenantValidationService';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant, loading: tenantLoading, isInitialized } = useTenantContext();
  const [initializationComplete, setInitializationComplete] = useState(false);
  const [tenantValidation, setTenantValidation] = useState<{
    isValid: boolean;
    needsOnboarding: boolean;
    tenantData?: any;
  } | null>(null);

  console.log('OnboardingGuard: Current state:', {
    user: user?.id,
    currentTenant: currentTenant?.id,
    tenantLoading,
    isInitialized,
    initializationComplete,
    tenantValidation
  });

  // Validate tenant ownership and onboarding status when user is available
  useEffect(() => {
    const validateTenantAndOnboarding = async () => {
      if (!user?.email) {
        console.log('OnboardingGuard: No user email available');
        return;
      }

      try {
        console.log('OnboardingGuard: Validating tenant for user:', user.email);
        const validation = await tenantValidationService.checkUserCanLogin(user.email);
        
        if (!validation.canLogin) {
          console.log('OnboardingGuard: User cannot login:', validation.reason);
          setTenantValidation({
            isValid: false,
            needsOnboarding: false
          });
          return;
        }

        const tenantData = validation.tenantData!;
        const needsOnboarding = !tenantData.onboarding_complete;
        
        console.log('OnboardingGuard: Tenant validation result:', {
          isValid: true,
          needsOnboarding,
          tenantData
        });

        setTenantValidation({
          isValid: true,
          needsOnboarding,
          tenantData
        });
      } catch (error) {
        console.error('OnboardingGuard: Error validating tenant:', error);
        setTenantValidation({
          isValid: false,
          needsOnboarding: false
        });
      }
    };

    if (user && !tenantValidation) {
      validateTenantAndOnboarding();
    }
  }, [user, tenantValidation]);

  // Only check detailed onboarding if tenant is valid and we have current tenant
  const shouldCheckDetailedOnboarding = !!(
    user && 
    currentTenant?.id && 
    isInitialized && 
    !tenantLoading &&
    tenantValidation?.isValid &&
    !tenantValidation.needsOnboarding
  );

  const { data: isComplete, isLoading, error } = useQuery({
    queryKey: ['onboarding-status', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) {
        console.log('OnboardingGuard: No current tenant available for detailed onboarding check');
        return null;
      }
      
      console.log('OnboardingGuard: Checking detailed onboarding status for tenant:', currentTenant.id);
      
      try {
        const isCompleted = await enhancedOnboardingService.isOnboardingComplete(currentTenant.id);
        console.log('OnboardingGuard: Detailed onboarding completion status for tenant', currentTenant.id, ':', isCompleted);
        return isCompleted;
      } catch (error) {
        console.error('OnboardingGuard: Error checking detailed onboarding status for tenant', currentTenant.id, ':', error);
        return false;
      }
    },
    enabled: shouldCheckDetailedOnboarding,
    staleTime: 30000,
    retry: (failureCount, err: any) => {
      console.error('OnboardingGuard: Query retry for tenant', currentTenant?.id, ':', { failureCount, error: err });
      return failureCount < 2;
    },
  });

  // Handle initialization completion
  useEffect(() => {
    if (!initializationComplete && tenantValidation !== null) {
      if (!tenantValidation.isValid) {
        console.log('OnboardingGuard: Invalid tenant, marking initialization complete');
        setInitializationComplete(true);
      } else if (tenantValidation.needsOnboarding) {
        console.log('OnboardingGuard: Needs onboarding, marking initialization complete');
        setInitializationComplete(true);
      } else if (shouldCheckDetailedOnboarding && (isComplete !== undefined || error)) {
        console.log('OnboardingGuard: Detailed check complete, marking initialization complete');
        setInitializationComplete(true);
      }
    }
  }, [tenantValidation, shouldCheckDetailedOnboarding, isComplete, error, initializationComplete]);

  // Show loading while authentication or tenant data is loading
  if (!user) {
    console.log('OnboardingGuard: No user, allowing through');
    return <>{children}</>;
  }

  // Show loading while validating tenant
  if (!tenantValidation) {
    console.log('OnboardingGuard: Validating tenant, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If tenant validation failed, redirect to login
  if (!tenantValidation.isValid) {
    console.warn('OnboardingGuard: Invalid tenant access, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // If basic tenant validation shows onboarding needed, redirect immediately
  if (tenantValidation.needsOnboarding) {
    console.log('OnboardingGuard: Basic validation shows onboarding needed, redirecting');
    return <Navigate to="/onboarding" replace />;
  }

  if (tenantLoading || !isInitialized) {
    console.log('OnboardingGuard: Tenant data loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no tenant available, something went wrong - redirect to auth
  if (!currentTenant) {
    console.warn('OnboardingGuard: User has valid tenant but no current tenant loaded, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Show loading while detailed onboarding check is in progress
  if (shouldCheckDetailedOnboarding && (isLoading || !initializationComplete)) {
    console.log('OnboardingGuard: Detailed onboarding check in progress for tenant:', currentTenant.id);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error('OnboardingGuard detailed error for tenant', currentTenant.id, ':', error);
    // Allow through on persistent errors to prevent blocking
    return <>{children}</>;
  }

  if (isComplete === false) {
    console.log('OnboardingGuard: Detailed check shows onboarding incomplete, redirecting to onboarding for tenant:', currentTenant.id);
    return <Navigate to="/onboarding" replace />;
  }

  console.log('OnboardingGuard: All checks passed, allowing through for tenant:', currentTenant.id, 'onboarding status:', isComplete);
  return <>{children}</>;
};
