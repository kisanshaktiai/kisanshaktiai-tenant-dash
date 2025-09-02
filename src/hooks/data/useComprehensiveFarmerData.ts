
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { enhancedFarmerDataService, type ComprehensiveFarmerData, type FarmerMetrics } from '@/services/EnhancedFarmerDataService';
import { useAppSelector } from '@/store/hooks';
import { useTenantRealtime } from './useTenantRealtime';

export const useComprehensiveFarmerData = (farmerId: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { isConnected } = useTenantRealtime();

  return useQuery({
    queryKey: ['comprehensive-farmer', currentTenant?.id, farmerId],
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return enhancedFarmerDataService.getComprehensiveFarmerData(currentTenant.id, farmerId);
    },
    enabled: !!currentTenant && !!farmerId,
    staleTime: isConnected ? 30000 : 5 * 60 * 1000, // 30s if realtime, 5min otherwise
    refetchInterval: isConnected ? 60000 : false, // Refetch every minute if realtime
  });
};

export const useEnhancedFarmersQuery = (options: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
} = {}) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: ['enhanced-farmers', currentTenant?.id, options],
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return enhancedFarmerDataService.getFarmersWithPagination(currentTenant.id, options);
    },
    enabled: !!currentTenant,
    staleTime: 2 * 60 * 1000, // 2 minutes
    keepPreviousData: true, // For smooth pagination
  });
};

export const useFarmerMetrics = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: ['farmer-metrics', currentTenant?.id],
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return enhancedFarmerDataService.getFarmerMetrics(currentTenant.id);
    },
    enabled: !!currentTenant,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
};

export const useFarmerActivityStream = (farmerId: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();

  // Simulate real-time updates for demo
  const simulateRealTimeUpdates = () => {
    if (!currentTenant || !farmerId) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ 
        queryKey: ['comprehensive-farmer', currentTenant.id, farmerId] 
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  };

  return {
    startListening: simulateRealTimeUpdates,
    isListening: true
  };
};
