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
    retry: 3,
  });

  // API stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['ndvi-api-stats'],
    queryFn: () => renderNDVIService.getStats(),
    retry: 2,
  });

  // Create NDVI request
  const createRequest = useMutation({
    mutationFn: (payload: NDVIRequestPayload) => renderNDVIService.createRequest(payload),
    onSuccess: (data) => {
      toast({
        title: '✅ Request Created',
        description: `Request ${data.request_id} created for ${data.lands_count} lands`,
      });
      queryClient.invalidateQueries({ queryKey: ['ndvi-api-stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Request Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get request status
  const getRequestStatus = useMutation({
    mutationFn: (requestId: string) => renderNDVIService.getRequestStatus(requestId),
    onError: (error: Error) => {
      toast({
        title: 'Failed to get status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Trigger jobs
  const triggerJobs = useMutation({
    mutationFn: (params: { limit?: number; use_queue?: boolean }) => 
      renderNDVIService.triggerJobs({
        ...params,
        tenant_id: currentTenant?.id,
      }),
    onSuccess: (data) => {
      toast({
        title: '✅ Jobs Triggered',
        description: `${data.jobs_triggered} jobs started successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['ndvi-api-stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Job Trigger Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    healthData,
    healthLoading,
    stats,
    statsLoading,
    isHealthy: healthData?.status === 'running' || healthData?.status === 'healthy',
    createRequest: createRequest.mutate,
    isCreatingRequest: createRequest.isPending,
    getRequestStatus: getRequestStatus.mutate,
    isGettingStatus: getRequestStatus.isPending,
    requestStatusData: getRequestStatus.data,
    triggerJobs: triggerJobs.mutate,
    isTriggeringJobs: triggerJobs.isPending,
  };
};