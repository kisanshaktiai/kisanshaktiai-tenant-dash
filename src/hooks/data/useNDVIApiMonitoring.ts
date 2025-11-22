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

  // Stats - manual refresh only (v5.1.0)
  const { data: globalStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['ndvi-stats', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) {
        throw new Error('No tenant ID available');
      }
      return renderNDVIService.getStats(currentTenant.id);
    },
    enabled: !!currentTenant?.id,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 or client errors
      if (error?.message?.includes('404') || error?.message?.includes('400')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // NDVI data summary - manual refresh only (v5.1.0)
  const { data: dataSummary, isLoading: dataSummaryLoading, error: dataError, refetch: refetchData } = useQuery({
    queryKey: ['ndvi-data-summary', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) {
        throw new Error('No tenant ID available');
      }
      return renderNDVIService.getNDVIData(currentTenant.id);
    },
    enabled: !!currentTenant?.id,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('404') || error?.message?.includes('400')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 120000,
    refetchOnWindowFocus: false,
  });

  return {
    healthData,
    healthLoading,
    globalStats,
    statsLoading,
    statsError,
    dataSummary,
    dataSummaryLoading,
    dataError,
    isHealthy: healthData?.status === 'running' || healthData?.status === 'healthy' || healthData?.status === 'ok',
    isWarming,
    // Manual refresh functions
    refetchHealth,
    refetchStats,
    refetchData,
  };
};