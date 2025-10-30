
import { useDashboardQuery } from './useDashboardQuery';
import { useTenantRealtime } from './useTenantRealtime';

export const useRealTimeDashboard = () => {
  const dashboardQuery = useDashboardQuery();
  const { isConnected, activeChannels, lastUpdate } = useTenantRealtime();

  // Ensure we always return valid data structure
  const safeData = dashboardQuery.data || {
    farmers: { total: 0, active: 0, new_this_week: 0, recent: [] },
    campaigns: { active: 0, total: 0 },
    products: { total: 0, categories: 0, out_of_stock: 0 },
    dealers: { total: 0, active: 0 },
  };

  return {
    data: safeData,
    isLoading: dashboardQuery.isLoading,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch,
    isLive: isConnected,
    activeChannels,
    lastUpdate
  };
};
