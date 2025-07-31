
import { useQuery } from '@tanstack/react-query';
import { farmersService } from '@/services/FarmersService';
import { queryKeys } from '@/lib/queryClient';
import { useAppSelector } from '@/store/hooks';

export const useFarmersData = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.farmersList(currentTenant?.id || ''),
    queryFn: async () => {
      if (!currentTenant) {
        return { data: [], count: 0 };
      }
      return farmersService.getFarmers(currentTenant.id);
    },
    enabled: !!currentTenant,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
