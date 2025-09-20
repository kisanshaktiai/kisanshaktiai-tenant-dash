import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { whiteLabelService } from '@/services/WhiteLabelService';
import type { WhiteLabelConfig } from '@/services/WhiteLabelService';
import { useTenantAuthStable } from '@/hooks/useTenantAuthStable';
import { useToast } from '@/hooks/use-toast';

export const useWhiteLabelSettings = () => {
  const { currentTenant } = useTenantAuthStable();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['white-label-settings', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      return whiteLabelService.getWhiteLabelConfig(currentTenant.id);
    },
    enabled: !!currentTenant?.id,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep cache for 10 minutes
    refetchOnWindowFocus: false, // Prevent refetch on tab focus
    refetchOnMount: false, // Prevent refetch on component mount
    refetchInterval: false, // Disable automatic refetching
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<WhiteLabelConfig>) => {
      if (!currentTenant?.id) throw new Error('No tenant selected');
      
      return whiteLabelService.upsertWhiteLabelConfig({
        ...updates,
        tenant_id: currentTenant.id,
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['white-label-settings', currentTenant?.id], data);
      toast({
        title: "Settings updated",
        description: "Your white label configuration has been saved.",
      });
    },
    onError: (error) => {
      console.error('Failed to update white label settings:', error);
      toast({
        title: "Update failed",
        description: "Failed to save white label configuration. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
};