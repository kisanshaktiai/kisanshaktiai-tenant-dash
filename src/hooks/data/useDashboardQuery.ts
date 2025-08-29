
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/DashboardService';
import { queryKeys } from '@/lib/queryClient';
import { useAppSelector } from '@/store/hooks';

export const useDashboardQuery = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.dashboardStats(currentTenant?.id || ''),
    queryFn: async () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      console.log('useDashboardQuery: Fetching dashboard stats for tenant:', currentTenant.id);
      
      try {
        const stats = await dashboardService.getDashboardStats(currentTenant.id);
        console.log('useDashboardQuery: Successfully fetched stats:', stats);
        return stats;
      } catch (error) {
        console.error('useDashboardQuery: Error fetching dashboard stats:', error);
        throw error;
      }
    },
    enabled: !!currentTenant,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if it's a tenant-related error
      if (error?.message?.includes('No tenant')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
};
