
import React, { useEffect, useRef, Suspense, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useTenantContextOptimized } from '@/contexts/TenantContextOptimized';
import { useOnboardingRealtime } from '@/hooks/useOnboardingRealtime';
import { useOnboardingWithValidation } from '@/hooks/useOnboardingWithValidation';
import { useJWTReady } from '@/hooks/useJWTReady';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { OnboardingSkeleton } from '@/components/ui/OnboardingSkeleton';
import { OnboardingBypass } from '@/components/onboarding/OnboardingBypass';
import { SessionRecovery } from '@/components/auth/SessionRecovery';
import { Building2, RefreshCw, Settings, Bug, Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

// Lazy load the onboarding flow
const TenantOnboardingFlow = React.lazy(() => 
  import('@/components/onboarding/TenantOnboardingFlow')
);

const MissingStepsPanel = ({ onRetry, onValidate, onForceRefresh, onDebugInfo, isValidating, isRefreshing }: { 
  onRetry: () => void;
  onValidate: () => void;
  onForceRefresh: () => void;
  onDebugInfo: () => void;
  isValidating: boolean;
  isRefreshing: boolean;
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
    <Card className="w-full max-w-md">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Loading Onboarding Steps</h3>
        <p className="text-muted-foreground text-sm mb-6">
          We're preparing your onboarding experience. This might take a moment if you just started.
        </p>
        
        <div className="space-y-2">
          <Button onClick={onRetry} variant="outline" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Steps
          </Button>
          
          <Button 
            onClick={onValidate} 
            variant="secondary" 
            className="w-full"
            disabled={isValidating}
          >
            <Settings className="w-4 h-4 mr-2" />
            {isValidating ? 'Validating...' : 'Validate & Repair'}
          </Button>
          
          <Button 
            onClick={onForceRefresh} 
            variant="secondary" 
            className="w-full"
            disabled={isRefreshing}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {isRefreshing ? 'Refreshing...' : 'Force Refresh'}
          </Button>
          
          <Button onClick={onDebugInfo} variant="ghost" size="sm" className="w-full text-xs">
            <Bug className="w-3 h-3 mr-1" />
            Debug Info
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

const OnboardingPage = () => {
  // ⚠️ CRITICAL: ALL HOOKS MUST BE CALLED AT THE TOP - NO CONDITIONAL HOOKS!
  // React Rule of Hooks: Hooks must be called in the same order every render
  
  // 1. Redux selectors (FIRST)
  const { user } = useAppSelector((state) => state.auth);
  
  // 2. All custom hooks (BEFORE any returns)
  const { isReady: jwtReady, error: jwtError } = useJWTReady();
  const { currentTenant, loading: tenantLoading, initializeOnboarding, error: tenantError, retryFetch } = useTenantContextOptimized();
  const { isConnected } = useOnboardingRealtime();
  const { 
    onboardingData, 
    isLoading: onboardingLoading, 
    error: onboardingError,
    validate,
    isValidating,
    forceRefresh,
    isRefreshing,
    getDebugInfo,
    debugInfo,
    refetch
  } = useOnboardingWithValidation();
  
  // 3. Refs and state
  const mainContentRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [showTimeout, setShowTimeout] = useState(false);

  // 4. All effects
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (tenantLoading || onboardingLoading) {
        console.warn('OnboardingPage: Loading timeout reached');
        setShowTimeout(true);
      }
    }, 8000);

    return () => clearTimeout(timeout);
  }, [tenantLoading, onboardingLoading]);

  // ✅ NOW safe to do conditional rendering after ALL hooks are called
  console.log('OnboardingPage: Current state:', {
    user: user?.id,
    currentTenant: currentTenant?.id,
    onboardingCompleted: currentTenant?.onboarding_completed,
    tenantLoading,
    tenantError,
    onboardingLoading,
    jwtReady,
    hasOnboardingData: !!onboardingData,
    onboardingError: onboardingError?.message,
    showTimeout
  });

  // If tenant onboarding is complete, redirect to dashboard immediately
  if (currentTenant?.onboarding_completed && jwtReady) {
    console.log('OnboardingPage: Tenant onboarding already completed, redirecting to dashboard');
    return <Navigate to="/app/dashboard" replace />;
  }

  // Block until JWT is ready
  if (user && !jwtReady) {
    if (jwtError) {
      console.error('OnboardingPage: JWT synchronization failed:', jwtError);
      return <SessionRecovery error={jwtError} onRetry={retryFetch} />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Synchronizing Authentication</h3>
            <p className="text-muted-foreground text-sm">
              Preparing your workspace securely...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if we should show bypass options instead of loading/error states
  const shouldShowBypass = user && currentTenant && !tenantLoading && !onboardingLoading && (!onboardingData || onboardingError);

  // Show tenant error with retry option
  if (tenantError && showTimeout) {
    console.log('OnboardingPage: Tenant error detected, showing error state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Unable to Load Tenant Data</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {tenantError}
            </p>
            <div className="space-y-2">
              <Button onClick={retryFetch} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button onClick={() => window.location.href = '/app/dashboard'} variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    console.log('OnboardingPage: No user, showing skeleton');
    if (showTimeout) {
      console.warn('OnboardingPage: No user after timeout, redirecting to auth');
      return <Navigate to="/auth" replace />;
    }
    return (
      <div role="main" aria-live="polite" aria-label="Setting up your onboarding">
        <OnboardingSkeleton />
        <div className="sr-only">Setting up your onboarding...</div>
      </div>
    );
  }

  if (tenantLoading) {
    console.log('OnboardingPage: Tenant loading, showing skeleton');
    if (showTimeout) {
      console.warn('OnboardingPage: Tenant loading timeout, showing error');
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Loading is taking longer than expected</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Please refresh the page or try again later.
              </p>
              <div className="space-y-2">
                <Button onClick={retryFetch} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    return (
      <div role="main" aria-live="polite" aria-label="Loading tenant data">
        <OnboardingSkeleton />
        <div className="sr-only">Loading tenant data...</div>
      </div>
    );
  }

  if (!currentTenant) {
    console.log('OnboardingPage: No current tenant, showing skeleton');
    if (showTimeout) {
      console.warn('OnboardingPage: No tenant after timeout, redirecting to dashboard');
      return <Navigate to="/app/dashboard" replace />;
    }
    return (
      <div role="main" aria-live="polite" aria-label="Setting up tenant">
        <OnboardingSkeleton />
        <div className="sr-only">Setting up tenant...</div>
      </div>
    );
  }

  if (onboardingLoading) {
    console.log('OnboardingPage: Onboarding loading, showing skeleton');
    if (showTimeout) {
      console.warn('OnboardingPage: Onboarding loading timeout');
      return (
        <MissingStepsPanel
          onRetry={() => refetch()}
          onValidate={validate}
          onForceRefresh={forceRefresh}
          onDebugInfo={getDebugInfo}
          isValidating={isValidating}
          isRefreshing={isRefreshing}
        />
      );
    }
    return (
      <div role="main" aria-live="polite" aria-label="Loading onboarding data">
        <OnboardingSkeleton />
        <div className="sr-only">Loading onboarding data...</div>
      </div>
    );
  }

  // Check if onboarding is already completed
  if (onboardingData?.workflow?.status === 'completed') {
    console.log('OnboardingPage: Onboarding already completed, redirecting to dashboard');
    return <Navigate to="/app/dashboard" replace />;
  }

  // Check if all steps are completed
  const allStepsCompleted = onboardingData?.steps?.every(
    (step: any) => step.step_status === 'completed'
  );

  if (allStepsCompleted && onboardingData?.steps?.length > 0) {
    console.log('OnboardingPage: All steps completed, redirecting to dashboard');
    return <Navigate to="/app/dashboard" replace />;
  }

  // Show bypass options when there's an error or no data
  if (shouldShowBypass) {
    console.log('OnboardingPage: Showing bypass options');
    return <OnboardingBypass />;
  }

  console.log('OnboardingPage: Rendering main onboarding flow');

  return (
    <div className="relative" role="main">
      {/* Live Updates Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <LiveIndicator isConnected={isConnected} activeChannels={1} />
      </div>
      
      {/* Main onboarding flow with focus management */}
      <div ref={mainContentRef} tabIndex={-1} className="focus:outline-none">
        <Suspense fallback={<OnboardingSkeleton />}>
          <TenantOnboardingFlow />
        </Suspense>
      </div>
    </div>
  );
};

export default OnboardingPage;
