import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export interface OrganizationFeatures {
  id: string;
  tenant_id: string;
  farmer_management: boolean;
  dealer_management: boolean;
  product_catalog: boolean;
  mobile_app: boolean;
  analytics_basic: boolean;
  analytics_advanced: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  voice_calls_enabled: boolean;
  weather_forecast: boolean;
  satellite_imagery: boolean;
  iot_integration: boolean;
  marketplace_enabled: boolean;
  ecommerce_enabled: boolean;
  payment_gateway: boolean;
  api_access: boolean;
  webhooks_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const useOrganizationFeatures = () => {
  const { getTenantId } = useTenantIsolation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: features, isLoading, error } = useQuery({
    queryKey: ['organization-features', getTenantId()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_features')
        .select('*')
        .eq('tenant_id', getTenantId())
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as any;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Real-time subscription
  useEffect(() => {
    const tenantId = getTenantId();
    const channel = supabase
      .channel(`org-features-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenant_features',
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['organization-features', tenantId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [getTenantId, queryClient]);

  const updateFeatures = useMutation({
    mutationFn: async (updates: Partial<OrganizationFeatures>) => {
      const { data, error } = await supabase
        .from('tenant_features')
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
      queryClient.invalidateQueries({ queryKey: ['organization-features'] });
      toast({
        title: 'Success',
        description: 'Features updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update features',
        variant: 'destructive',
      });
    },
  });

  const toggleFeature = async (featureName: keyof OrganizationFeatures, enabled: boolean) => {
    await updateFeatures.mutateAsync({ [featureName]: enabled });
  };

  return {
    features,
    isLoading,
    error,
    updateFeatures: updateFeatures.mutateAsync,
    toggleFeature,
    isUpdating: updateFeatures.isPending,
  };
};
