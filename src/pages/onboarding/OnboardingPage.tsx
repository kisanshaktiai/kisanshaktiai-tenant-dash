
import React, { useEffect, useRef, Suspense } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useTenantContextOptimized } from '@/contexts/TenantContextOptimized';
import { useOnboardingRealtime } from '@/hooks/useOnboardingRealtime';
import { useOnboardingWithValidation } from '@/hooks/useOnboardingWithValidation';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { OnboardingSkeleton } from '@/components/ui/OnboardingSkeleton';
import { OnboardingBypass } from '@/components/onboarding/OnboardingBypass';
import { Building2, RefreshCw, Settings, Bug } from 'lucide-react';

// Lazy load the onboarding flow
const TenantOnboardingFlow = React.lazy(() => 
  import('@/components/onboarding/TenantOnboardingFlow').then(module => ({
    default: module.TenantOnboardingFlow
  }))
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
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant, loading: tenantLoading, initializeOnboarding } = useTenantContextOptimized();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Real-time connection
  const { isConnected } = useOnboardingRealtime();
  
  // Use the enhanced onboarding hook with validation
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

  console.log('OnboardingPage: Current state:', {
    user: user?.id,
    currentTenant: currentTenant?.id,
    tenantLoading,
    onboardingLoading,
    hasOnboardingData: !!onboardingData,
    onboardingError: onboardingError?.message
  });

  // Check if we should show bypass options instead of loading/error states
  const shouldShowBypass = user && currentTenant && !tenantLoading && !onboardingLoading && (!onboardingData || onboardingError);

  // Initialize onboarding workflow when tenant is available
  useEffect(() => {
    if (currentTenant?.id && !tenantLoading && !onboardingLoading && !onboardingData && !shouldShowBypass) {
      console.log('OnboardingPage: Auto-initializing onboarding for tenant:', currentTenant.id);
      
      initializeOnboarding(currentTenant.id)
        .then((result) => {
          console.log('OnboardingPage: Auto-initialization result:', result);
          if (result) {
            // Trigger a refetch of onboarding data
            setTimeout(() => {
              refetch();
            }, 1000);
          }
        })
        .catch((error) => {
          console.error('OnboardingPage: Auto-initialization failed:', error);
        });
    }
  }, [currentTenant?.id, tenantLoading, onboardingLoading, onboardingData, initializeOnboarding, refetch, shouldShowBypass]);

  if (!user) {
    console.log('OnboardingPage: No user, showing skeleton');
    return (
      <div role="main" aria-live="polite" aria-label="Setting up your onboarding">
        <OnboardingSkeleton />
        <div className="sr-only">Setting up your onboarding...</div>
      </div>
    );
  }

  if (tenantLoading) {
    console.log('OnboardingPage: Tenant loading, showing skeleton');
    return (
      <div role="main" aria-live="polite" aria-label="Loading tenant data">
        <OnboardingSkeleton />
        <div className="sr-only">Loading tenant data...</div>
      </div>
    );
  }

  if (!currentTenant) {
    console.log('OnboardingPage: No current tenant, showing skeleton');
    return (
      <div role="main" aria-live="polite" aria-label="Setting up tenant">
        <OnboardingSkeleton />
        <div className="sr-only">Setting up tenant...</div>
      </div>
    );
  }

  if (onboardingLoading) {
    console.log('OnboardingPage: Onboarding loading, showing skeleton');
    return (
      <div role="main" aria-live="polite" aria-label="Loading onboarding data">
        <OnboardingSkeleton />
        <div className="sr-only">Loading onboarding data...</div>
      </div>
    );
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
