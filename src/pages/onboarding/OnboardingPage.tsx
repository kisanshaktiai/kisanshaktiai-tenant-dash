
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

// Lazy load the onboarding flow
const TenantOnboardingFlow = React.lazy(() => 
  import('@/components/onboarding/TenantOnboardingFlow').then(module => ({
    default: module.TenantOnboardingFlow
  }))
);

const OnboardingPage = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Enhanced real-time connection with reconnect capability
  const { isConnected, isReconnecting, reconnectAttempts, reconnect } = useOnboardingRealtime();

  // Initialize onboarding workflow when tenant is available
  useEffect(() => {
    if (currentTenant?.id) {
      console.log('Ensuring onboarding workflow for tenant:', currentTenant.id);
      
      onboardingService.ensureWorkflowExists(currentTenant.id)
        .then((workflowId) => {
          console.log('Onboarding workflow ensured:', workflowId);
          
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
          console.error('Error ensuring onboarding workflow:', error);
        });
    }
  }, [currentTenant?.id, queryClient]);

  // Loading state with skeleton and accessibility
  if (!currentTenant) {
    return (
      <div role="main" aria-live="polite" aria-label="Setting up your onboarding">
        <OnboardingSkeleton />
        <div className="sr-only">
          Setting up your onboarding...
        </div>
      </div>
    );
  }

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
