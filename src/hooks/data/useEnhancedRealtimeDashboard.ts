import { useQuery } from '@tanstack/react-query';
import { enhancedDashboardService } from '@/services/EnhancedDashboardService';
import { useAppSelector } from '@/store/hooks';
import { useTenantRealtime } from './useTenantRealtime';

export const useEnhancedRealtimeDashboard = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { isConnected, activeChannels, lastUpdate } = useTenantRealtime();

  const query = useQuery({
    queryKey: ['enhanced-dashboard', currentTenant?.id, lastUpdate],
    queryFn: async () => {
      if (!currentTenant?.id) {
        console.warn('useEnhancedRealtimeDashboard: No tenant available');
        return null;
      }

      return enhancedDashboardService.getDashboardStats(currentTenant.id);
    },
    enabled: !!currentTenant?.id,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    retry: 2,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isLive: isConnected,
    activeChannels,
    lastUpdate,
  };
};
