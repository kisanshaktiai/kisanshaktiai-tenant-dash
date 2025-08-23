
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { farmersService, type CreateFarmerData, type UpdateFarmerData } from '@/services/FarmersService';
import { queryKeys } from '@/lib/queryClient';
import { useAppSelector } from '@/store/hooks';

export const useFarmersQuery = (options?: { search?: string; limit?: number }) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.farmersList(currentTenant?.id || ''),
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

export const useCreateFarmerMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useMutation({
    mutationFn: async (data: Omit<CreateFarmerData, 'tenant_id' | 'farmer_code'>) => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }

      // Generate farmer code
      const count = await farmersService.getFarmerCount(currentTenant.id);
      const farmerCode = await farmersService.generateFarmerCode(currentTenant.slug, count);

      const createData: CreateFarmerData = {
        ...data,
        tenant_id: currentTenant.id,
        farmer_code: farmerCode,
      };

      return farmersService.createFarmer(createData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.farmers(currentTenant?.id || '') 
      });
    },
  });
};

export const useUpdateFarmerMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useMutation({
    mutationFn: async ({ farmerId, data }: { farmerId: string; data: UpdateFarmerData }) => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return farmersService.updateFarmer(farmerId, currentTenant.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.farmers(currentTenant?.id || '') 
      });
    },
  });
};
