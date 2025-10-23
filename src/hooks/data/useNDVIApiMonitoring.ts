import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { renderNDVIService, NDVIRequestPayload } from '@/services/RenderNDVIService';
import { useAppSelector } from '@/store/hooks';
import { toast } from '@/hooks/use-toast';

export const useNDVIApiMonitoring = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const [isWarming, setIsWarming] = useState(false);

  // Warm up the API on mount
  useEffect(() => {
    const warmUpApi = async () => {
      try {
        setIsWarming(true);
        await renderNDVIService.ping();
        setIsWarming(false);
      } catch (error) {
        console.log('API warm-up in progress...');
        setIsWarming(false);
      }
    };

    warmUpApi();
  }, []);

  // Health check - manual refresh only
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['ndvi-api-health'],
    queryFn: () => renderNDVIService.checkHealth(),
    retry: 2,
    staleTime: 60000,
  });

  // Stats - manual refresh only (v4.1.0) - ALWAYS pass tenant_id
  const { data: globalStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['ndvi-stats', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) {
        console.warn('useNDVIApiMonitoring: No tenant ID available for stats fetch');
        return null;
      }
      console.log('🔄 useNDVIApiMonitoring: Fetching stats for tenant:', currentTenant.id);
      try {
        const result = await renderNDVIService.getStats(currentTenant.id);
        console.log('✅ useNDVIApiMonitoring: Stats fetched successfully', result);
        return result;
      } catch (error) {
        console.error('❌ useNDVIApiMonitoring: Stats fetch failed:', error);
        throw error;
      }
    },
    enabled: !!currentTenant?.id,
    retry: 1,
    retryDelay: 5000,
    staleTime: 60000,
  });

  // NDVI data summary - manual refresh only (v4.1.0 - uses ndvi_micro_tiles)
  const { data: dataSummary, isLoading: dataSummaryLoading, refetch: refetchData } = useQuery({
    queryKey: ['ndvi-data-summary', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) {
        console.warn('useNDVIApiMonitoring: No tenant ID available for data summary fetch');
        return null;
      }
      console.log('🔄 useNDVIApiMonitoring: Fetching data summary for tenant:', currentTenant.id);
      try {
        const result = await renderNDVIService.getNDVIData(currentTenant.id, undefined, 1000);
        console.log('✅ useNDVIApiMonitoring: Data summary fetched successfully', result);
        return result;
      } catch (error) {
        console.error('❌ useNDVIApiMonitoring: Data summary fetch failed:', error);
        throw error;
      }
    },
    enabled: !!currentTenant?.id,
    retry: 1,
    retryDelay: 5000,
    staleTime: 120000,
  });

  return {
    healthData,
    healthLoading,
    globalStats,
    statsLoading,
    dataSummary,
    dataSummaryLoading,
    isHealthy: healthData?.status === 'running' || healthData?.status === 'healthy' || healthData?.status === 'ok',
    isWarming,
    // Manual refresh functions
    refetchHealth,
    refetchStats,
    refetchData,
  };
};