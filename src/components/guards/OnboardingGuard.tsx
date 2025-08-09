
import { Navigate } from 'react-router-dom';
import { useOnboardingQuery } from '@/hooks/useOnboarding';
import { useAppSelector } from '@/store/hooks';
import { onboardingService } from '@/services/OnboardingService';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTenantData } from '@/hooks/useTenantData';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [initializationComplete, setInitializationComplete] = useState(false);
  
  // First, ensure tenant data is loaded
  const { currentTenant, userTenants } = useTenantData();
  
  // Create onboarding workflow mutation
  const createWorkflowMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      console.log('Creating onboarding workflow for tenant:', tenantId);
      return await onboardingService.startOnboardingWorkflow(tenantId);
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
      
      try {
        // First check if onboarding is complete
        const isCompleted = await onboardingService.isOnboardingComplete(currentTenant.id);
        console.log('Onboarding completion status:', isCompleted);
        
        if (isCompleted) {
          return true;
        }
        
        // If not complete, check if workflow exists
        const workflow = await onboardingService.getOnboardingWorkflow(currentTenant.id);
        console.log('Existing workflow:', workflow);
        
        // If no workflow exists, we'll need to create one
        if (!workflow) {
          console.log('No workflow found, will need to create one');
          return false;
        }
        
        return false; // Workflow exists but not complete
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        throw error;
      }
    },
    enabled: !!currentTenant?.id && !!user,
    retry: (failureCount, error) => {
      // Don't retry on tenant-not-found errors
      if (error && error.message?.includes('tenant')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Handle workflow creation when needed
  useEffect(() => {
    if (!currentTenant?.id || !user || isLoading || createWorkflowMutation.isPending) {
      return;
    }

    // If we determined we need to create a workflow
    if (isComplete === false && !createWorkflowMutation.isSuccess) {
      // Check if workflow actually exists before creating
      onboardingService.getOnboardingWorkflow(currentTenant.id).then(existingWorkflow => {
        if (!existingWorkflow) {
          console.log('Creating missing onboarding workflow');
          createWorkflowMutation.mutate(currentTenant.id, {
            onSuccess: () => {
              console.log('Onboarding workflow created successfully');
              refetch();
              setInitializationComplete(true);
            },
            onError: (error) => {
              console.error('Failed to create onboarding workflow:', error);
              setInitializationComplete(true); // Allow through even on error to prevent blocking
            }
          });
        } else {
          setInitializationComplete(true);
        }
      }).catch(error => {
        console.error('Error checking existing workflow:', error);
        setInitializationComplete(true); // Allow through on error
      });
    } else {
      setInitializationComplete(true);
    }
  }, [currentTenant?.id, user, isComplete, isLoading, createWorkflowMutation, refetch]);

  // Show loading while we're still initializing
  if (!user) {
    return <>{children}</>;
  }

  // Show loading while tenant data is loading or we're checking onboarding
  if (!currentTenant || isLoading || createWorkflowMutation.isPending || !initializationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle errors gracefully
  if (error) {
    console.error('OnboardingGuard error:', error);
    // For now, allow through on persistent errors to prevent blocking
    return <>{children}</>;
  }

  // If we have no user tenants, something is wrong with tenant setup
  if (userTenants.length === 0) {
    console.warn('User has no tenants, this should not happen in normal flow');
    return <>{children}</>;
  }

  // If onboarding is not complete, redirect to onboarding
  if (isComplete === false) {
    console.log('Redirecting to onboarding - not complete');
    return <Navigate to="/onboarding" replace />;
  }

  // If onboarding is complete or we can't determine status, allow through
  console.log('OnboardingGuard: allowing through, onboarding status:', isComplete);
  return <>{children}</>;
};
