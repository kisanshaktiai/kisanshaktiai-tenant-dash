import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useOrganizationRealtime } from './useOrganizationRealtime';

export interface OrganizationBranding {
  id: string;
  tenant_id: string;
  logo_url?: string;
  favicon_url?: string;
  app_name?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  font_family?: string;
  custom_css?: string;
  created_at: string;
  updated_at: string;
}

export const useOrganizationBranding = () => {
  const { getTenantId } = useTenantIsolation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const realtimeStatus = useOrganizationRealtime();

  const { data: branding, isLoading, error } = useQuery({
    queryKey: ['organization-branding', getTenantId()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_branding')
        .select('*')
        .eq('tenant_id', getTenantId())
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as OrganizationBranding | null;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Real-time subscription
  useEffect(() => {
    const tenantId = getTenantId();
    const channel = supabase
      .channel(`org-branding-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenant_branding',
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['organization-branding', tenantId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [getTenantId, queryClient]);

  const updateBranding = useMutation({
    mutationFn: async (updates: Partial<OrganizationBranding>) => {
      const { data, error } = await supabase
        .from('tenant_branding')
        .upsert(
          {
            tenant_id: getTenantId(),
            ...updates,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'tenant_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-branding'] });
      toast({
        title: 'Success',
        description: 'Branding updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update branding',
        variant: 'destructive',
      });
    },
  });

  const uploadLogo = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${getTenantId()}/logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('tenant-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tenant-assets')
        .getPublicUrl(fileName);

      await updateBranding.mutateAsync({ logo_url: publicUrl });

      return publicUrl;
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload logo',
        variant: 'destructive',
      });
    },
  });

  return {
    branding,
    isLoading,
    error,
    updateBranding: updateBranding.mutateAsync,
    uploadLogo: uploadLogo.mutateAsync,
    isUpdating: updateBranding.isPending,
    isUploading: uploadLogo.isPending,
    realtimeStatus,
  };
};
