
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/AnalyticsService';
import { queryKeys } from '@/lib/queryClient';
import { useAppSelector } from '@/store/hooks';

export const useEngagementQuery = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.engagementStats(currentTenant?.id || ''),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return analyticsService.getEngagementStats(currentTenant.id);
    },
    enabled: !!currentTenant,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
