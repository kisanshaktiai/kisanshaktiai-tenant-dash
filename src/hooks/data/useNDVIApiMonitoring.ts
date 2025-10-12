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
        description: `Request ${data.request_id} created for ${data.land_count} lands`,
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

  // Trigger jobs (API v3.6: only limit parameter)
  const triggerJobs = useMutation({
    mutationFn: (limit: number = 10) => 
      renderNDVIService.triggerJobs(limit),
    onSuccess: (data) => {
      toast({
        title: '✅ Worker Started',
        description: `Processing ${data.limit} jobs. Status: ${data.status}`,
      });
      queryClient.invalidateQueries({ queryKey: ['ndvi-api-stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Worker Failed',
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
    triggerJobs: triggerJobs.mutate,
    isTriggeringJobs: triggerJobs.isPending,
  };
};