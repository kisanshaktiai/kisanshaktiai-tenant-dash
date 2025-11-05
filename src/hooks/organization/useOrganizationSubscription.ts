import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface OrganizationSubscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  max_farmers?: number;
  max_dealers?: number;
  max_storage_gb?: number;
  created_at: string;
  updated_at: string;
  plan?: {
    name: string;
    price: number;
    billing_cycle: string;
    features: any;
  };
}

export const useOrganizationSubscription = () => {
  const { getTenantId, currentTenant } = useTenantIsolation();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['organization-subscription', currentTenant?.id],
    queryFn: async () => {
      const tenantId = getTenantId();
      const { data, error } = await supabase
        .from('tenant_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (error) throw error;
      return data as any;
    },
    enabled: !!currentTenant?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!currentTenant?.id) return;
    
    const tenantId = currentTenant.id;
    const channel = supabase
      .channel(`org-subscription-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenant_subscriptions',
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['organization-subscription', tenantId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, queryClient]);

  return {
    subscription,
    isLoading,
    error,
  };
};
