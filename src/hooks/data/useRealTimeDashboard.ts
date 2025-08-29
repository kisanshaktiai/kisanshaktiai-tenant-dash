
import { useDashboardQuery } from './useDashboardQuery';
import { useTenantRealtime } from './useTenantRealtime';

export const useRealTimeDashboard = () => {
  const dashboardQuery = useDashboardQuery();
  const { isConnected, activeChannels, lastUpdate } = useTenantRealtime();

  return {
    data: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch,
    isLive: isConnected,
    activeChannels,
    lastUpdate
  };
};
