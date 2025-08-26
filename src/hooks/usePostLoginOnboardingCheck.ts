
import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { enhancedOnboardingService } from '@/services/EnhancedOnboardingService';
import { globalErrorHandler } from '@/services/GlobalErrorHandler';
import { toast } from 'sonner';

interface PostLoginOnboardingCheckOptions {
  delayMs?: number;
  skipOnOnboardingPage?: boolean;
  showNotification?: boolean;
}

export const usePostLoginOnboardingCheck = (options: PostLoginOnboardingCheckOptions = {}) => {
  const {
    delayMs = 30000, // 30 seconds default
    skipOnOnboardingPage = true,
    showNotification = true
  } = options;

  const navigate = useNavigate();
  const location = useLocation();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { user } = useAppSelector((state) => state.auth);
  
  const checkTimeoutRef = useRef<NodeJS.Timeout>();
  const hasCheckedRef = useRef(false);
  const lastTenantIdRef = useRef<string | null>(null);

  const performOnboardingCheck = useCallback(async (tenantId: string) => {
    try {
      console.log('PostLoginOnboardingCheck: Performing onboarding status check for tenant:', tenantId);
      
      // Check if onboarding is complete
      const isComplete = await enhancedOnboardingService.isOnboardingComplete(tenantId);
      
      console.log('PostLoginOnboardingCheck: Onboarding completion status:', {
        tenantId,
        isComplete,
        currentPath: location.pathname
      });

      if (!isComplete) {
        // Only redirect if not already on onboarding page
        if (skipOnOnboardingPage && location.pathname.includes('/onboarding')) {
          console.log('PostLoginOnboardingCheck: Already on onboarding page, skipping redirect');
          return;
        }

        if (showNotification) {
          toast.info('Please complete your onboarding to access all features', {
            description: 'You will be redirected to continue your setup process.',
            duration: 5000,
          });
        }

        // Small delay to allow toast to show
        setTimeout(() => {
          console.log('PostLoginOnboardingCheck: Redirecting to onboarding');
          navigate('/onboarding', { replace: true });
        }, 1000);
      } else {
        console.log('PostLoginOnboardingCheck: Onboarding is complete, no action needed');
        
        if (showNotification && location.pathname === '/onboarding') {
          toast.success('Onboarding completed! Welcome to your dashboard.');
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (error) {
      console.error('PostLoginOnboardingCheck: Error checking onboarding status:', error);
      
      globalErrorHandler.handleError(error, {
        component: 'usePostLoginOnboardingCheck',
        operation: 'performOnboardingCheck',
        tenantId
      }, {
        severity: 'medium',
        showToast: true,
        fallbackMessage: 'Unable to verify onboarding status'
      });
    }
  }, [navigate, location.pathname, skipOnOnboardingPage, showNotification]);

  const scheduleOnboardingCheck = useCallback((tenantId: string) => {
    // Clear any existing timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    console.log('PostLoginOnboardingCheck: Scheduling onboarding check in', delayMs / 1000, 'seconds for tenant:', tenantId);

    checkTimeoutRef.current = setTimeout(() => {
      performOnboardingCheck(tenantId);
    }, delayMs);
  }, [delayMs, performOnboardingCheck]);

  // Main effect for monitoring tenant login
  useEffect(() => {
    if (!user || !currentTenant) {
      // Reset state when user logs out or tenant is cleared
      hasCheckedRef.current = false;
      lastTenantIdRef.current = null;
      
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
        checkTimeoutRef.current = undefined;
      }
      return;
    }

    const currentTenantId = currentTenant.id;
    
    // Check if this is a new tenant login
    const isNewTenantLogin = (
      !hasCheckedRef.current || 
      lastTenantIdRef.current !== currentTenantId
    );

    if (isNewTenantLogin) {
      console.log('PostLoginOnboardingCheck: New tenant login detected:', {
        tenantId: currentTenantId,
        tenantName: currentTenant.name,
        previousTenantId: lastTenantIdRef.current
      });

      // Update tracking refs
      hasCheckedRef.current = true;
      lastTenantIdRef.current = currentTenantId;

      // Schedule the onboarding check
      scheduleOnboardingCheck(currentTenantId);
    }

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [user, currentTenant, scheduleOnboardingCheck]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  // Return manual trigger function for testing/debugging
  const triggerManualCheck = useCallback(() => {
    if (currentTenant?.id) {
      console.log('PostLoginOnboardingCheck: Manual trigger requested');
      performOnboardingCheck(currentTenant.id);
    } else {
      console.warn('PostLoginOnboardingCheck: No current tenant for manual trigger');
    }
  }, [currentTenant?.id, performOnboardingCheck]);

  return {
    triggerManualCheck,
    isScheduled: !!checkTimeoutRef.current,
    currentTenant: currentTenant?.id || null
  };
};
