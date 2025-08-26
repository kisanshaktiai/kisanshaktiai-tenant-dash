
import { useDashboardQuery } from './useDashboardQuery';
import { useTenantRealtime } from './useTenantRealtime';

export const useRealTimeDashboard = () => {
  const dashboardQuery = useDashboardQuery();
  const { isConnected, activeChannels, lastUpdate } = useTenantRealtime();

  return {
    ...dashboardQuery,
    isLive: isConnected,
    activeChannels,
    lastUpdate
  };
};
