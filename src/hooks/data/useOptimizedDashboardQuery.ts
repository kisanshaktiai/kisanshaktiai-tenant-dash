
import { useQuery } from '@tanstack/react-query';
import { optimizedDashboardService } from '@/services/OptimizedDashboardService';
import { queryKeys } from '@/lib/queryClient';
import { useAppSelector } from '@/store/hooks';
import { useMemo } from 'react';

export const useOptimizedDashboardQuery = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  const queryKey = useMemo(() => 
    queryKeys.dashboardStats(currentTenant?.id || ''), 
    [currentTenant?.id]
  );

  return useQuery({
    queryKey,
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return optimizedDashboardService.getDashboardStats(currentTenant.id);
    },
    enabled: !!currentTenant,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
