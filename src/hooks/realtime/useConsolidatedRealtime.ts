
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { consolidatedRealtimeService } from '@/services/realtime/ConsolidatedRealtimeService';
import { queryKeys } from '@/lib/queryClient';

export const useConsolidatedRealtime = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentTenant?.id) return;

    // Initialize service with query client
    consolidatedRealtimeService.initialize(queryClient);

    // Define all subscriptions for the tenant
    const subscriptions = [
      {
        table: 'farmers',
        filter: `tenant_id=eq.${currentTenant.id}`,
        queryKeys: queryKeys.farmers(currentTenant.id),
      },
      {
        table: 'dealers',
        filter: `tenant_id=eq.${currentTenant.id}`,
        queryKeys: queryKeys.dealers(currentTenant.id),
      },
      {
        table: 'products',
        filter: `tenant_id=eq.${currentTenant.id}`,
        queryKeys: queryKeys.products(currentTenant.id),
      },
      {
        table: 'analytics_reports',
        filter: `tenant_id=eq.${currentTenant.id}`,
        queryKeys: queryKeys.analytics(currentTenant.id),
      },
      {
        table: 'onboarding_workflows',
        filter: `tenant_id=eq.${currentTenant.id}`,
        queryKeys: ['onboarding', currentTenant.id],
      },
      {
        table: 'tenant_branding',
        filter: `tenant_id=eq.${currentTenant.id}`,
        queryKeys: ['tenants'],
      }
    ];

    // Subscribe to all changes
    consolidatedRealtimeService.subscribe(currentTenant.id, subscriptions);

    return () => {
      consolidatedRealtimeService.unsubscribe();
    };
  }, [currentTenant?.id, queryClient]);

  return consolidatedRealtimeService.getConnectionStatus();
};
