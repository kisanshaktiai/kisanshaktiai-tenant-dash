
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useEnsureOnboardingWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tenantId: string) => {
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
    onSuccess: (workflowId, tenantId) => {
      console.log('Successfully ensured workflow:', workflowId);
      // Invalidate onboarding queries to refetch fresh data
      queryClient.invalidateQueries({ 
        queryKey: ['onboarding', tenantId] 
      });
    },
    onError: (error) => {
      console.error('Error ensuring onboarding workflow:', error);
      toast.error('Failed to initialize onboarding. Please try again.');
    }
  });
};
