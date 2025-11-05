import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useOrganizationRealtime } from './useOrganizationRealtime';

export interface OrganizationProfile {
  id: string;
  name: string;
  slug: string;
  type: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  timezone?: string;
  established_date?: string;
  registration_number?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useOrganizationProfile = () => {
  const { getTenantId } = useTenantIsolation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const realtimeStatus = useOrganizationRealtime();
  const tenantId = getTenantId();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['organization-profile', getTenantId()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', getTenantId())
        .single();

      if (error) throw error;
      return data as OrganizationProfile;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Real-time subscription
  useEffect(() => {
    const tenantId = getTenantId();
    const channel = supabase
      .channel(`org-profile-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tenants',
          filter: `id=eq.${tenantId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['organization-profile', tenantId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [getTenantId, queryClient]);

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<OrganizationProfile>) => {
      const { status, type, ...cleanUpdates } = updates;
      const { data, error } = await supabase
        .from('tenants')
        .update({
          ...cleanUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', getTenantId())
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (updates) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['organization-profile', tenantId] });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData<OrganizationProfile>(['organization-profile', tenantId]);
      
      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<OrganizationProfile>(
          ['organization-profile', tenantId],
          { ...previousData, ...updates }
        );
      }
      
      return { previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-profile', tenantId] });
      toast({
        title: 'Success',
        description: 'Organization profile updated successfully',
      });
    },
    onError: (error: any, variables, context: any) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['organization-profile', tenantId], context.previousData);
      }
      toast({
        title: 'Error',
        description: error.message || 'Failed to update organization profile',
        variant: 'destructive',
      });
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfile.mutateAsync,
    isUpdating: updateProfile.isPending,
    realtimeStatus,
  };
};
