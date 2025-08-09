
import { Navigate } from 'react-router-dom';
import { useOnboardingQuery } from '@/hooks/useOnboarding';
import { useAppSelector } from '@/store/hooks';
import { onboardingService } from '@/services/OnboardingService';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTenantData } from '@/hooks/useTenantData';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [initializationComplete, setInitializationComplete] = useState(false);
  
  // First, ensure tenant data is loaded
  const { currentTenant, userTenants } = useTenantData();
  
  // Ensure onboarding workflow mutation (uses RPC to create minimal flow if missing)
  const ensureWorkflowMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      console.log('Ensuring onboarding workflow exists for tenant:', tenantId);
      const { data, error } = await supabase.rpc('ensure_onboarding_workflow', { p_tenant_id: tenantId });
      if (error) {
        console.error('ensure_onboarding_workflow RPC error:', error);
        throw error;
      }
      console.log('ensure_onboarding_workflow result:', data);
      return data as string | null; // workflow_id
    },
  });

  // Check onboarding status only after tenant is loaded
  const { data: isComplete, isLoading, refetch, error } = useQuery({
    queryKey: ['onboarding-status', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) {
        console.log('No current tenant available for onboarding check');
        return null;
      }
      
      console.log('Checking onboarding status for tenant:', currentTenant.id);
      
      // First check if onboarding is complete
      const isCompleted = await onboardingService.isOnboardingComplete(currentTenant.id);
      console.log('Onboarding completion status:', isCompleted);
      if (isCompleted) {
        return true;
      }
      
      // Check if workflow exists
      const workflow = await onboardingService.getOnboardingWorkflow(currentTenant.id);
      console.log('Existing workflow (maybe null):', workflow);
      if (!workflow) {
        // No workflow found, indicate we need to create
        return false;
      }
      
      // Workflow exists but not complete
      return false;
    },
    enabled: !!currentTenant?.id && !!user,
    retry: (failureCount, err: any) => {
      if (err && typeof err.message === 'string' && err.message.includes('tenant')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Handle workflow creation when needed
  useEffect(() => {
    if (!currentTenant?.id || !user || isLoading || ensureWorkflowMutation.isPending) {
      return;
    }

    if (isComplete === false && !ensureWorkflowMutation.isSuccess) {
      onboardingService.getOnboardingWorkflow(currentTenant.id).then(existingWorkflow => {
        if (!existingWorkflow) {
          console.log('No workflow found, calling ensure_onboarding_workflow');
          ensureWorkflowMutation.mutate(currentTenant.id, {
            onSuccess: () => {
              console.log('Onboarding workflow ensured successfully');
              refetch();
              setInitializationComplete(true);
            },
            onError: (rpcError) => {
              console.error('Failed to ensure onboarding workflow:', rpcError);
              setInitializationComplete(true); // Allow through even on error to prevent blocking
            }
          });
        } else {
          setInitializationComplete(true);
        }
      }).catch(checkError => {
        console.error('Error checking existing workflow:', checkError);
        setInitializationComplete(true); // Allow through on error
      });
    } else {
      setInitializationComplete(true);
    }
  }, [currentTenant?.id, user, isComplete, isLoading, ensureWorkflowMutation, refetch]);

  // Show loading while we're still initializing
  if (!user) {
    return <>{children}</>;
  }

  if (!currentTenant || isLoading || ensureWorkflowMutation.isPending || !initializationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error('OnboardingGuard error:', error);
    // Allow through on persistent errors to prevent blocking
    return <>{children}</>;
  }

  if (userTenants.length === 0) {
    console.warn('User has no tenants, this should not happen in normal flow');
    return <>{children}</>;
  }

  if (isComplete === false) {
    console.log('Redirecting to onboarding - not complete');
    return <Navigate to="/onboarding" replace />;
  }

  console.log('OnboardingGuard: allowing through, onboarding status:', isComplete);
  return <>{children}</>;
};
