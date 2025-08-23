
import { useQuery } from '@tanstack/react-query';
import { farmersService } from '@/services/FarmersService';
import { queryKeys } from '@/lib/queryClient';
import { useAppSelector } from '@/store/hooks';

export const useFarmersQuery = (options?: { search?: string; limit?: number }) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: [queryKeys.farmersList(currentTenant?.id || ''), options],
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return farmersService.getFarmers(currentTenant.id, options);
    },
    enabled: !!currentTenant,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
