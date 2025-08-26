
import { useOptimizedDashboardQuery } from './useOptimizedDashboardQuery';
import { useConsolidatedRealtime } from '@/hooks/realtime/useConsolidatedRealtime';

export const useRealTimeDashboard = () => {
  const dashboardQuery = useOptimizedDashboardQuery();
  const { isConnected, activeChannels } = useConsolidatedRealtime();

  return {
    ...dashboardQuery,
    isLive: isConnected,
    activeChannels,
    lastUpdate: new Date()
  };
};
