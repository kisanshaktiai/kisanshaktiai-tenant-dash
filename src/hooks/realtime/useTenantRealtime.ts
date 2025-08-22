
import { useFocusedRealtime } from './useFocusedRealtime';
import { useAppSelector } from '@/store/hooks';
import { queryKeys } from '@/lib/queryClient';

export const useTenantRealtime = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  // Farmers realtime subscription
  const farmersRealtime = useFocusedRealtime({
    table: 'farmers',
    filter: currentTenant?.id ? `tenant_id=eq.${currentTenant.id}` : '',
    queryKeys: currentTenant?.id ? queryKeys.farmers(currentTenant.id) : [],
    enabled: !!currentTenant?.id,
  });

  // Dealers realtime subscription
  const dealersRealtime = useFocusedRealtime({
    table: 'dealers',
    filter: currentTenant?.id ? `tenant_id=eq.${currentTenant.id}` : '',
    queryKeys: currentTenant?.id ? queryKeys.dealers(currentTenant.id) : [],
    enabled: !!currentTenant?.id,
  });

  // Products realtime subscription
  const productsRealtime = useFocusedRealtime({
    table: 'products',
    filter: currentTenant?.id ? `tenant_id=eq.${currentTenant.id}` : '',
    queryKeys: currentTenant?.id ? queryKeys.products(currentTenant.id) : [],
    enabled: !!currentTenant?.id,
  });

  // Analytics realtime subscription
  const analyticsRealtime = useFocusedRealtime({
    table: 'analytics_reports',
    filter: currentTenant?.id ? `tenant_id=eq.${currentTenant.id}` : '',
    queryKeys: currentTenant?.id ? queryKeys.analytics(currentTenant.id) : [],
    enabled: !!currentTenant?.id,
  });

  return {
    isConnected: farmersRealtime.isConnected || 
                dealersRealtime.isConnected || 
                productsRealtime.isConnected || 
                analyticsRealtime.isConnected,
    farmers: farmersRealtime,
    dealers: dealersRealtime,
    products: productsRealtime,
    analytics: analyticsRealtime,
  };
};
