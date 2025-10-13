import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { renderNDVIService, NDVIRequestPayload } from '@/services/RenderNDVIService';
import { useAppSelector } from '@/store/hooks';
import { toast } from '@/hooks/use-toast';

export const useNDVIApiMonitoring = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();

  // Health check - manual refresh only
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['ndvi-api-health'],
    queryFn: () => renderNDVIService.checkHealth(),
    retry: 2,
    staleTime: 60000, // Consider data fresh for 1 minute
  });

  // Global stats - manual refresh only
  const { data: globalStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['ndvi-global-stats'],
    queryFn: () => renderNDVIService.getGlobalStats(),
    retry: 2,
    staleTime: 60000,
  });

  // Queue status - manual refresh only
  const { data: queueStatus, isLoading: queueLoading, refetch: refetchQueue } = useQuery({
    queryKey: ['ndvi-queue-status', currentTenant?.id],
    queryFn: () => renderNDVIService.getQueueStatus(currentTenant?.id || ''),
    enabled: !!currentTenant?.id,
    retry: 2,
    staleTime: 30000,
  });

  // NDVI requests list - manual refresh only
  const { data: requests, isLoading: requestsLoading, refetch: refetchRequests } = useQuery({
    queryKey: ['ndvi-requests', currentTenant?.id],
    queryFn: () => renderNDVIService.getRequests(currentTenant?.id),
    enabled: !!currentTenant?.id,
    staleTime: 60000,
  });

  // NDVI data summary - manual refresh only
  const { data: dataSummary, isLoading: dataSummaryLoading, refetch: refetchData } = useQuery({
    queryKey: ['ndvi-data-summary', currentTenant?.id],
    queryFn: () => renderNDVIService.getNDVIData(currentTenant?.id),
    enabled: !!currentTenant?.id,
    staleTime: 120000, // 2 minutes
  });

  // Create NDVI request
  const createRequest = useMutation({
    mutationFn: (payload: NDVIRequestPayload) => renderNDVIService.createRequest(payload),
    onSuccess: (data) => {
      toast({
        title: '✅ Request Created',
        description: `Request ${data.request_id} created successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['ndvi-global-stats'] });
      queryClient.invalidateQueries({ queryKey: ['ndvi-requests'] });
      queryClient.invalidateQueries({ queryKey: ['ndvi-queue-status'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Request Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Retry failed request
  const retryRequest = useMutation({
    mutationFn: (requestId: string) => renderNDVIService.retryRequest(requestId),
    onSuccess: (data) => {
      toast({
        title: '✅ Request Retried',
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['ndvi-requests'] });
      queryClient.invalidateQueries({ queryKey: ['ndvi-queue-status'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Retry Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    healthData,
    healthLoading,
    globalStats,
    statsLoading,
    queueStatus,
    queueLoading,
    requests,
    requestsLoading,
    dataSummary,
    dataSummaryLoading,
    isHealthy: healthData?.status === 'running' || healthData?.status === 'healthy' || healthData?.status === 'ok',
    createRequest: createRequest.mutate,
    isCreatingRequest: createRequest.isPending,
    retryRequest: retryRequest.mutate,
    isRetryingRequest: retryRequest.isPending,
    // Manual refresh functions
    refetchHealth,
    refetchStats,
    refetchQueue,
    refetchRequests,
    refetchData,
  };
};