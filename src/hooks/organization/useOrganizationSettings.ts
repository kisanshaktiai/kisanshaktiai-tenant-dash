import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { useToast } from '@/hooks/use-toast';
import { organizationSettingsService, OrganizationSettings } from '@/services/OrganizationSettingsService';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useOrganizationSettings = () => {
  const { getTenantId } = useTenantIsolation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['organization-settings', getTenantId()],
    queryFn: async () => {
      return await organizationSettingsService.getSettings(getTenantId());
    },
    staleTime: 5 * 60 * 1000,
  });

  // Real-time subscription
  useEffect(() => {
    const tenantId = getTenantId();
    const channel = supabase
      .channel(`org-settings-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organization_settings',
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['organization-settings', tenantId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [getTenantId, queryClient]);

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<OrganizationSettings>) => {
      return await organizationSettingsService.upsertSettings(getTenantId(), updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-settings'] });
      toast({
        title: 'Success',
        description: 'Settings updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings',
        variant: 'destructive',
      });
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettings.mutateAsync,
    isUpdating: updateSettings.isPending,
  };
};
