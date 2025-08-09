
import React, { useEffect } from 'react';
import { TenantOnboardingFlow } from '@/components/onboarding/TenantOnboardingFlow';
import { useAppSelector } from '@/store/hooks';
import { useEnsureOnboardingWorkflow } from '@/hooks/useEnsureOnboardingWorkflow';
import { useOnboardingRealtime } from '@/hooks/useOnboardingRealtime';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const OnboardingPage = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const ensureWorkflowMutation = useEnsureOnboardingWorkflow();
  
  // Enable real-time updates
  const { isConnected } = useOnboardingRealtime();

  // Ensure workflow exists when component mounts
  useEffect(() => {
    if (currentTenant?.id && !ensureWorkflowMutation.isSuccess && !ensureWorkflowMutation.isPending) {
      ensureWorkflowMutation.mutate(currentTenant.id);
    }
  }, [currentTenant?.id, ensureWorkflowMutation]);

  // Show loading while ensuring workflow
  if (!currentTenant || ensureWorkflowMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Setting up your onboarding...</h3>
            <p className="text-muted-foreground text-sm">
              We're preparing your personalized setup experience.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Real-time connection indicator */}
      {isConnected && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-1.5 rounded-full text-xs font-medium border border-success/20">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            Live updates
          </div>
        </div>
      )}
      
      <TenantOnboardingFlow />
    </div>
  );
};

export default OnboardingPage;
