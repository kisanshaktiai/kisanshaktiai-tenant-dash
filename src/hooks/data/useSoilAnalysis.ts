import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { soilAnalysisService, LandWithSoil } from '@/services/SoilAnalysisService';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { toast } from 'sonner';

export function useSoilAnalysis() {
  const queryClient = useQueryClient();
  const { getTenantId } = useTenantIsolation();

  // Check API health
  const { data: healthStatus, isLoading: isCheckingHealth } = useQuery({
    queryKey: ['soil-api-health'],
    queryFn: () => soilAnalysisService.checkHealth(),
    refetchInterval: 60000, // Check every minute
    retry: 1,
  });

  // Fetch all lands with soil data
  const {
    data: landsWithSoil,
    isLoading: isLoadingLands,
    error: landsError,
    refetch: refetchLands,
  } = useQuery<LandWithSoil[]>({
    queryKey: ['lands-with-soil', getTenantId()],
    queryFn: () => soilAnalysisService.getLandsWithSoilData(getTenantId()),
    staleTime: 30000, // 30 seconds
  });

  // Mutation to update soil data for a single land
  const updateSoilDataMutation = useMutation({
    mutationFn: ({ landId, tenantId }: { landId: string; tenantId: string }) =>
      soilAnalysisService.fetchAndSaveSoilData(landId, tenantId),
    onSuccess: (data, variables) => {
      toast.success('✅ Soil data updated successfully');
      queryClient.invalidateQueries({ queryKey: ['lands-with-soil', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['soil-health-history', variables.landId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update soil data: ${error.message}`);
    },
  });

  // Mutation to batch update soil data for all lands
  const batchUpdateMutation = useMutation({
    mutationFn: async ({
      landIds,
      tenantId,
    }: {
      landIds: string[];
      tenantId: string;
    }) => {
      return soilAnalysisService.batchFetchAndSaveSoilData(landIds, tenantId);
    },
    onSuccess: (results, variables) => {
      const summary = results.summary || results;
      if (summary.saved > 0) {
        toast.success(`✅ Updated ${summary.saved} lands successfully`);
      }
      if (summary.skipped > 0) {
        toast.info(`ℹ️ Skipped ${summary.skipped} lands (already processed)`);
      }
      if (summary.failed > 0) {
        toast.warning(`⚠️ Failed to update ${summary.failed} lands`);
      }
      queryClient.invalidateQueries({ queryKey: ['lands-with-soil', variables.tenantId] });
    },
    onError: (error: Error) => {
      toast.error(`Batch update failed: ${error.message}`);
    },
  });

  // Get soil health history for a specific land
  const useSoilHealthHistory = (landId: string | null) => {
    return useQuery({
      queryKey: ['soil-health-history', landId],
      queryFn: () => soilAnalysisService.getSoilHealthHistory(landId!),
      enabled: !!landId,
      staleTime: 60000, // 1 minute
    });
  };

  return {
    // API health
    healthStatus,
    isCheckingHealth,
    isApiConnected: healthStatus?.status === 'connected' || healthStatus?.status === 'online' || healthStatus?.status === 'healthy',

    // Lands data
    landsWithSoil,
    isLoadingLands,
    landsError,
    refetchLands,

    // Mutations
    updateSoilData: updateSoilDataMutation.mutate,
    isUpdatingSoilData: updateSoilDataMutation.isPending,

    batchUpdateSoilData: batchUpdateMutation.mutate,
    isBatchUpdating: batchUpdateMutation.isPending,

    // Helper hook
    useSoilHealthHistory,
  };
}
