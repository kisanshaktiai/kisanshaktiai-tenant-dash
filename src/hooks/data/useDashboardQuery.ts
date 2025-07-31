
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/DashboardService';
import { queryKeys } from '@/lib/queryClient';
import { useAppSelector } from '@/store/hooks';

export const useDashboardQuery = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.dashboardStats(currentTenant?.id || ''),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return dashboardService.getDashboardStats(currentTenant.id);
    },
    enabled: !!currentTenant,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
