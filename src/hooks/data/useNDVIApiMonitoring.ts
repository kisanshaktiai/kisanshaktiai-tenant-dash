import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { renderNDVIService, NDVIRequestPayload } from '@/services/RenderNDVIService';
import { useAppSelector } from '@/store/hooks';
import { toast } from '@/hooks/use-toast';

export const useNDVIApiMonitoring = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();

  // Health check
  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ['ndvi-api-health'],
    queryFn: () => renderNDVIService.checkHealth(),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
  });

  // Global stats
  const { data: globalStats, isLoading: statsLoading } = useQuery({
    queryKey: ['ndvi-global-stats'],
    queryFn: () => renderNDVIService.getGlobalStats(),
    refetchInterval: 15000, // Refetch every 15 seconds
    retry: 2,
  });

  // Queue status
  const { data: queueStatus, isLoading: queueLoading } = useQuery({
    queryKey: ['ndvi-queue-status'],
    queryFn: () => renderNDVIService.getQueueStatus(),
    refetchInterval: 10000, // Refetch every 10 seconds
    retry: 2,
  });

  // NDVI requests list
  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ['ndvi-requests', currentTenant?.id],
    queryFn: () => renderNDVIService.getRequests(currentTenant?.id),
    enabled: !!currentTenant?.id,
    refetchInterval: 15000,
  });

  // NDVI data summary
  const { data: dataSummary, isLoading: dataSummaryLoading } = useQuery({
    queryKey: ['ndvi-data-summary', currentTenant?.id],
    queryFn: () => renderNDVIService.getNDVIData(currentTenant?.id),
    enabled: !!currentTenant?.id,
    refetchInterval: 30000,
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
  };
};