
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
      console.log('useDashboardQuery: Fetching dashboard data for tenant:', currentTenant.id);
      
      try {
        const data = await dashboardService.getDashboardData(currentTenant.id);
        console.log('useDashboardQuery: Successfully fetched data:', data);
        return data;
      } catch (error) {
        console.error('useDashboardQuery: Error fetching dashboard data:', error);
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
