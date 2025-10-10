import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ndviLandService, FetchNDVIResult } from '@/services/NDVILandService';
import { useAppSelector } from '@/store/hooks';
import { toast } from '@/hooks/use-toast';

export const useNDVILandData = (farmerId?: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();

  // Fetch cached NDVI data
  const {
    data: cachedData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ndvi-land-data', currentTenant?.id, farmerId],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      return await ndviLandService.getCachedNDVIData(currentTenant.id, farmerId);
    },
    enabled: !!currentTenant?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Auto-fetch NDVI data on mount (respects cache)
  const autoFetch = useMutation({
    mutationFn: async () => {
      if (!currentTenant?.id) throw new Error('No tenant selected');
      return await ndviLandService.fetchNDVIForLands(
        currentTenant.id,
        farmerId,
        false // Don't force refresh on auto-fetch
      );
    },
    onSuccess: (results: FetchNDVIResult[]) => {
      const successCount = results.filter(r => r.success).length;
      const cachedCount = results.filter(r => r.cached).length;
      const failedCount = results.filter(r => !r.success).length;

      if (failedCount > 0) {
        const failedLands = results
          .filter(r => !r.success)
          .map(r => r.land_name)
          .join(', ');
        
        toast({
          title: 'Some lands failed to fetch NDVI data',
          description: `Failed lands: ${failedLands}`,
          variant: 'destructive',
        });
      }

      if (successCount > 0) {
        queryClient.invalidateQueries({ 
          queryKey: ['ndvi-land-data', currentTenant?.id, farmerId] 
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to fetch NDVI data',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Manual refresh (bypasses cache)
  const manualRefresh = useMutation({
    mutationFn: async () => {
      if (!currentTenant?.id) throw new Error('No tenant selected');
      return await ndviLandService.fetchNDVIForLands(
        currentTenant.id,
        farmerId,
        true // Force refresh
      );
    },
    onSuccess: (results: FetchNDVIResult[]) => {
      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        toast({
          title: '✅ NDVI data refreshed successfully',
          description: `Successfully refreshed ${successCount} land(s)${
            failedCount > 0 ? `, ${failedCount} failed` : ''
          }`,
        });
        
        queryClient.invalidateQueries({ 
          queryKey: ['ndvi-land-data', currentTenant?.id, farmerId] 
        });
      }

      if (failedCount > 0) {
        const failedLands = results
          .filter(r => !r.success)
          .map(r => `${r.land_name}: ${r.error}`)
          .join('\n');
        
        toast({
          title: 'Some lands failed to refresh',
          description: failedLands,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to refresh NDVI data',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    cachedData,
    isLoading,
    error,
    refetch,
    autoFetch: autoFetch.mutate,
    isAutoFetching: autoFetch.isPending,
    manualRefresh: manualRefresh.mutate,
    isRefreshing: manualRefresh.isPending,
  };
};
