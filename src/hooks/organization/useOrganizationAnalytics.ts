import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';

export interface OrganizationAnalytics {
  id: string;
  tenant_id: string;
  total_farmers: number;
  active_farmers: number;
  total_dealers: number;
  active_dealers: number;
  total_products: number;
  active_products: number;
  total_campaigns: number;
  engagement_rate: number;
  revenue_impact: number;
  storage_used_mb: number;
  api_calls_today: number;
  last_activity_at?: string;
  calculated_at: string;
  created_at: string;
  updated_at: string;
}

export const useOrganizationAnalytics = () => {
  const { getTenantId } = useTenantIsolation();
  const queryClient = useQueryClient();

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['organization-analytics', getTenantId()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_analytics')
        .select('*')
        .eq('tenant_id', getTenantId())
        .maybeSingle();

      if (error) throw error;
      return data as OrganizationAnalytics | null;
    },
    staleTime: 60 * 1000, // 1 minute
  });

  const refreshAnalytics = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('refresh_organization_analytics', {
        p_tenant_id: getTenantId(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-analytics', getTenantId()] });
    },
  });

  return {
    analytics,
    isLoading,
    error,
    refreshAnalytics: refreshAnalytics.mutate,
    isRefreshing: refreshAnalytics.isPending,
  };
};
