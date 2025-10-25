import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { renderNDVIService } from '@/services/RenderNDVIService';
import { useAppSelector } from '@/store/hooks';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useNDVIQueue = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();

  // Get request queue
  const { data: queueData, isLoading: queueLoading, refetch: refetchQueue } = useQuery({
    queryKey: ['ndvi-request-queue', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      return await renderNDVIService.getRequestQueue(currentTenant.id);
    },
    enabled: !!currentTenant?.id,
    refetchInterval: 10000, // Poll every 10 seconds
    staleTime: 5000,
  });

  // Get queue status
  const { data: queueStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['ndvi-queue-status'],
    queryFn: () => renderNDVIService.getQueueStatus(),
    refetchInterval: 15000,
    staleTime: 10000,
  });

  // Create analysis request mutation
  const createRequestMutation = useMutation({
    mutationFn: async ({ landIds, tileId }: { landIds: string[]; tileId: string }) => {
      if (!currentTenant?.id) throw new Error('No tenant ID available');
      return await renderNDVIService.createAnalysisRequest(currentTenant.id, landIds, tileId);
    },
    onSuccess: () => {
      toast({
        title: "NDVI Analysis Requested",
        description: "Your lands have been queued for NDVI analysis",
      });
      queryClient.invalidateQueries({ queryKey: ['ndvi-request-queue'] });
      queryClient.invalidateQueries({ queryKey: ['ndvi-queue-status'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Request Analysis",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Process queue (calls edge function)
  const processQueueMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('ndvi-queue-processor', {
        body: { action: 'process_queue', limit: 10 },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Queue Processing Started",
        description: `Processing ${data?.total || 0} requests`,
      });
      queryClient.invalidateQueries({ queryKey: ['ndvi-request-queue'] });
      queryClient.invalidateQueries({ queryKey: ['ndvi-stats'] });
      queryClient.invalidateQueries({ queryKey: ['ndvi-data-summary'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Process Queue",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    // Queue data
    queueData: queueData?.queue || [],
    queueCount: queueData?.count || 0,
    queueStatus,
    activeJobs: queueStatus?.active_jobs || 0,
    
    // Loading states
    queueLoading,
    statusLoading,
    isCreatingRequest: createRequestMutation.isPending,
    isProcessingQueue: processQueueMutation.isPending,
    
    // Actions
    createRequest: createRequestMutation.mutate,
    processQueue: processQueueMutation.mutate,
    refetchQueue,
  };
};
