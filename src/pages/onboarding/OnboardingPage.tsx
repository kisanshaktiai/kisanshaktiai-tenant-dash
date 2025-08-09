
import React, { useEffect, useRef, Suspense } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useRetryableMutation } from '@/hooks/core/useRetryableMutation';
import { useOnboardingRealtime } from '@/hooks/useOnboardingRealtime';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { DisconnectBanner } from '@/components/ui/DisconnectBanner';
import { OnboardingSkeleton } from '@/components/ui/OnboardingSkeleton';
import { Building2, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

  // Retryable workflow initialization
  const ensureWorkflowMutation = useRetryableMutation(
    async (tenantId: string) => {
      console.log('Ensuring onboarding workflow for tenant:', tenantId);
      
      const { data, error } = await supabase.rpc('ensure_onboarding_workflow', { 
        p_tenant_id: tenantId 
      });
      
      if (error) {
        console.error('Failed to ensure onboarding workflow:', error);
        throw error;
      }
      
      console.log('Onboarding workflow ensured:', data);
      return data as string | null;
    },
    {
      onSuccess: (workflowId, tenantId) => {
        console.log('Successfully ensured workflow:', workflowId);
        
        // Invalidate onboarding queries to refetch fresh data
        queryClient.invalidateQueries({ 
          queryKey: ['onboarding', tenantId] 
        });
        
        // Small delay to ensure data is available before focusing
        setTimeout(() => {
          mainContentRef.current?.focus();
        }, 200);
      },
      onError: (error) => {
        console.error('Error ensuring onboarding workflow:', error);
      }
    },
    {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 5000,
    }
  );

  // Initialize workflow when tenant is available
  useEffect(() => {
    if (currentTenant?.id && !ensureWorkflowMutation.isSuccess && !ensureWorkflowMutation.isPending) {
      ensureWorkflowMutation.mutate(currentTenant.id);
    }
  }, [currentTenant?.id, ensureWorkflowMutation]);

  // Loading state with skeleton and accessibility
  if (!currentTenant || ensureWorkflowMutation.isPending) {
    return (
      <div role="main" aria-live="polite" aria-label="Setting up your onboarding">
        <OnboardingSkeleton />
        <div className="sr-only">
          {ensureWorkflowMutation.retryState.isRetrying 
            ? `Retrying setup (attempt ${ensureWorkflowMutation.retryState.attempt})...`
            : "Setting up your onboarding..."
          }
        </div>
      </div>
    );
  }

  // Error state with retry functionality
  if (ensureWorkflowMutation.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <Alert className="border-destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="mt-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-destructive mb-2">
                      Setup Failed
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We couldn't initialize your onboarding workflow. 
                      {ensureWorkflowMutation.retryState.attempt > 0 && 
                        ` Attempted ${ensureWorkflowMutation.retryState.attempt} times.`
                      }
                    </p>
                  </div>
                  
                  <Button 
                    onClick={ensureWorkflowMutation.retry}
                    disabled={ensureWorkflowMutation.isPending}
                    className="w-full"
                  >
                    {ensureWorkflowMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      'Try Again'
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
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
