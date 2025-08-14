
import React, { useEffect, useRef, Suspense } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useOnboardingRealtime } from '@/hooks/useOnboardingRealtime';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { DisconnectBanner } from '@/components/ui/DisconnectBanner';
import { OnboardingSkeleton } from '@/components/ui/OnboardingSkeleton';
import { Building2, AlertTriangle, RefreshCw } from 'lucide-react';
import { onboardingService } from '@/services/OnboardingService';
import { useTenantData } from '@/hooks/useTenantData';

// Lazy load the onboarding flow
const TenantOnboardingFlow = React.lazy(() => 
  import('@/components/onboarding/TenantOnboardingFlow').then(module => ({
    default: module.TenantOnboardingFlow
  }))
);

const MissingStepsPanel = ({ onRetry }: { onRetry: () => void }) => (
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
        <Button onClick={onRetry} variant="outline" className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Steps
        </Button>
      </CardContent>
    </Card>
  </div>
);

const OnboardingPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant, loading: tenantLoading } = useTenantData();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Enhanced real-time connection with reconnect capability
  const { isConnected, isReconnecting, reconnectAttempts, reconnect } = useOnboardingRealtime();

  console.log('OnboardingPage: Current state:', {
    user: user?.id,
    currentTenant: currentTenant?.id,
    tenantLoading
  });

  // Initialize onboarding workflow when tenant is available
  useEffect(() => {
    if (currentTenant?.id && !tenantLoading) {
      console.log('OnboardingPage: Ensuring onboarding workflow for tenant:', currentTenant.id);
      
      onboardingService.ensureWorkflowExists(currentTenant.id)
        .then((workflowId) => {
          console.log('OnboardingPage: Onboarding workflow ensured:', workflowId);
          
          // Invalidate queries to refetch fresh data
          queryClient.invalidateQueries({ 
            queryKey: ['onboarding', currentTenant.id] 
          });
          
          // Focus main content
          setTimeout(() => {
            mainContentRef.current?.focus();
          }, 200);
        })
        .catch((error) => {
          console.error('OnboardingPage: Error ensuring onboarding workflow:', error);
        });
    }
  }, [currentTenant?.id, tenantLoading, queryClient]);

  // Loading state with skeleton and accessibility
  if (!user) {
    console.log('OnboardingPage: No user, showing skeleton');
    return (
      <div role="main" aria-live="polite" aria-label="Setting up your onboarding">
        <OnboardingSkeleton />
        <div className="sr-only">
          Setting up your onboarding...
        </div>
      </div>
    );
  }

  if (tenantLoading) {
    console.log('OnboardingPage: Tenant loading, showing skeleton');
    return (
      <div role="main" aria-live="polite" aria-label="Loading tenant data">
        <OnboardingSkeleton />
        <div className="sr-only">
          Loading tenant data...
        </div>
      </div>
    );
  }

  if (!currentTenant) {
    console.log('OnboardingPage: No current tenant, showing skeleton');
    return (
      <div role="main" aria-live="polite" aria-label="Setting up tenant">
        <OnboardingSkeleton />
        <div className="sr-only">
          Setting up tenant...
        </div>
      </div>
    );
  }

  const handleRetry = () => {
    console.log('OnboardingPage: Retry requested');
    if (currentTenant?.id) {
      queryClient.invalidateQueries({ 
        queryKey: ['onboarding', currentTenant.id] 
      });
    }
  };

  console.log('OnboardingPage: Rendering main content');

  return (
    <div className="relative" role="main">
      {/* Live Updates Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <LiveIndicator isConnected={isConnected} activeChannels={1} />
      </div>

      {/* Disconnect Banner */}
      {!isConnected && (
        <DisconnectBanner
          isReconnecting={isReconnecting}
          reconnectAttempts={reconnectAttempts}
          onReconnect={reconnect}
        />
      )}
      
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
