
import { Navigate } from 'react-router-dom';
import { useOnboardingQuery } from '@/hooks/useOnboarding';
import { useAppSelector } from '@/store/hooks';
import { onboardingService } from '@/services/OnboardingService';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  
  // Create onboarding workflow mutation
  const createWorkflowMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      return await onboardingService.startOnboardingWorkflow(tenantId);
    },
  });

  const { data: isComplete, isLoading, refetch } = useQuery({
    queryKey: ['onboarding-status', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return false;
      
      // First check if onboarding is complete
      const isCompleted = await onboardingService.isOnboardingComplete(currentTenant.id);
      
      // If not complete, check if workflow exists
      if (!isCompleted) {
        const workflow = await onboardingService.getOnboardingWorkflow(currentTenant.id);
        
        // If no workflow exists, create one
        if (!workflow) {
          console.log('No onboarding workflow found, creating one...');
          await onboardingService.startOnboardingWorkflow(currentTenant.id);
          return false; // Still not complete, but workflow now exists
        }
      }
      
      return isCompleted;
    },
    enabled: !!currentTenant?.id,
    retry: 1,
  });

  // Auto-create workflow if tenant exists but no workflow found
  useEffect(() => {
    if (currentTenant?.id && !isLoading && isComplete === false) {
      // Check if we need to create a workflow
      onboardingService.getOnboardingWorkflow(currentTenant.id).then(workflow => {
        if (!workflow && !createWorkflowMutation.isPending) {
          console.log('Creating onboarding workflow for tenant:', currentTenant.id);
          createWorkflowMutation.mutate(currentTenant.id, {
            onSuccess: () => {
              console.log('Onboarding workflow created successfully');
              refetch();
            },
            onError: (error) => {
              console.error('Failed to create onboarding workflow:', error);
            }
          });
        }
      });
    }
  }, [currentTenant?.id, isComplete, isLoading, createWorkflowMutation, refetch]);

  if (isLoading || createWorkflowMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no current tenant, let the app handle tenant selection
  if (!currentTenant) {
    return <>{children}</>;
  }

  // If onboarding is not complete, redirect to onboarding
  if (!isComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
