
import React, { useEffect, useRef, Suspense } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useTenantContext } from '@/contexts/TenantContext';
import { useOnboardingRealtime } from '@/hooks/useOnboardingRealtime';
import { useOnboardingWithValidation } from '@/hooks/useOnboardingWithValidation';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { DisconnectBanner } from '@/components/ui/DisconnectBanner';
import { OnboardingSkeleton } from '@/components/ui/OnboardingSkeleton';
import { Building2, AlertTriangle, RefreshCw, Settings, Bug } from 'lucide-react';

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
  const { currentTenant, loading: tenantLoading } = useTenantContext();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Enhanced real-time connection with reconnect capability
  const { isConnected, isReconnecting, reconnectAttempts, reconnect } = useOnboardingRealtime();
  
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

  // Loading state with skeleton and accessibility
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

  // Show error state with recovery options
  if (onboardingError || !onboardingData) {
    console.log('OnboardingPage: Showing recovery panel:', { 
      error: onboardingError?.message, 
      hasData: !!onboardingData 
    });
    
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

        {/* Error Alert */}
        {onboardingError && (
          <div className="fixed top-20 left-4 right-4 z-40">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {onboardingError.message}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <MissingStepsPanel
          onRetry={() => {
            queryClient.invalidateQueries({ 
              queryKey: ['onboarding-validated', currentTenant.id] 
            });
            refetch();
          }}
          onValidate={validate}
          onForceRefresh={forceRefresh}
          onDebugInfo={() => getDebugInfo()}
          isValidating={isValidating}
          isRefreshing={isRefreshing}
        />

        {/* Debug Info Display */}
        {debugInfo && (
          <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2">Debug Information</h4>
                <pre className="text-xs overflow-auto max-h-40 bg-muted p-2 rounded">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  console.log('OnboardingPage: Rendering main onboarding flow');

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
