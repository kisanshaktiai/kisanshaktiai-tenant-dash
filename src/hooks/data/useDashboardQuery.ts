
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/DashboardService';
import { queryKeys } from '@/lib/queryClient';
import { useAppSelector } from '@/store/hooks';

export const useDashboardQuery = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.dashboardStats(currentTenant?.id || ''),
    queryFn: async () => {
      if (!currentTenant?.id) {
        console.warn('useDashboardQuery: No tenant available, returning default empty data');
        return {
          farmers: { total: 0, active: 0, new_this_week: 0, recent: [] },
          campaigns: { active: 0, total: 0 },
          products: { total: 0, categories: 0, out_of_stock: 0 },
          dealers: { total: 0, active: 0 },
        };
      }
      
      console.log('useDashboardQuery: Fetching dashboard data for tenant:', currentTenant.id);
      
      try {
        const data = await dashboardService.getDashboardStats(currentTenant.id);
        console.log('useDashboardQuery: Successfully fetched data:', data);
        return data;
      } catch (error) {
        console.error('useDashboardQuery: Error fetching dashboard data:', error);
        // Return safe default data structure
        return {
          farmers: { total: 0, active: 0, new_this_week: 0, recent: [] },
          campaigns: { active: 0, total: 0 },
          products: { total: 0, categories: 0, out_of_stock: 0 },
          dealers: { total: 0, active: 0 },
        };
      }
    },
    enabled: true,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('No tenant') || !currentTenant?.id) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
};
