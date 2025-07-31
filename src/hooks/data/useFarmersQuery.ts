
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { farmersService, type FarmersListOptions, type CreateFarmerData, type UpdateFarmerData } from '@/services/FarmersService';
import { queryKeys } from '@/lib/queryClient';
import { useAppSelector } from '@/store/hooks';
import { useErrorHandler } from '@/hooks/core/useErrorHandler';
import { toast } from 'sonner';

export const useFarmersQuery = (options: FarmersListOptions = {}) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { handleError } = useErrorHandler();

  return useQuery({
    queryKey: queryKeys.farmersList(currentTenant?.id || '', options),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return farmersService.getFarmers(currentTenant.id, options);
    },
    enabled: !!currentTenant,
    onError: (error) => {
      handleError(error, 'Failed to fetch farmers');
    },
  });
};

export const useFarmerQuery = (farmerId: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { handleError } = useErrorHandler();

  return useQuery({
    queryKey: queryKeys.farmer(farmerId),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return farmersService.getFarmer(farmerId, currentTenant.id);
    },
    enabled: !!currentTenant && !!farmerId,
    onError: (error) => {
      handleError(error, 'Failed to fetch farmer details');
    },
  });
};

export const useCreateFarmerMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async (data: Omit<CreateFarmerData, 'tenant_id' | 'farmer_code'>) => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }

      // Get farmer count and generate code
      const count = await farmersService.getFarmerCount(currentTenant.id);
      const farmerCode = await farmersService.generateFarmerCode(currentTenant.slug, count);

      const createData: CreateFarmerData = {
        ...data,
        tenant_id: currentTenant.id,
        farmer_code: farmerCode,
      };

      return farmersService.createFarmer(createData);
    },
    onSuccess: (data) => {
      // Invalidate and refetch farmers list
      queryClient.invalidateQueries({ queryKey: queryKeys.farmers });
      queryClient.invalidateQueries({ queryKey: queryKeys.farmerStats(currentTenant?.id || '') });
      
      toast.success('Farmer created successfully');
      return data;
    },
    onError: (error) => {
      handleError(error, 'Failed to create farmer');
    },
  });
};

export const useUpdateFarmerMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({ farmerId, data }: { farmerId: string; data: UpdateFarmerData }) => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return farmersService.updateFarmer(farmerId, currentTenant.id, data);
    },
    onSuccess: (data, variables) => {
      // Update the specific farmer in cache
      queryClient.setQueryData(queryKeys.farmer(variables.farmerId), data);
      
      // Invalidate farmers list
      queryClient.invalidateQueries({ queryKey: queryKeys.farmers });
      
      toast.success('Farmer updated successfully');
      return data;
    },
    onError: (error) => {
      handleError(error, 'Failed to update farmer');
    },
  });
};

export const useDeleteFarmerMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (farmerId: string) => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return farmersService.deleteFarmer(farmerId, currentTenant.id);
    },
    onSuccess: (_, farmerId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.farmer(farmerId) });
      
      // Invalidate farmers list
      queryClient.invalidateQueries({ queryKey: queryKeys.farmers });
      queryClient.invalidateQueries({ queryKey: queryKeys.farmerStats(currentTenant?.id || '') });
      
      toast.success('Farmer deleted successfully');
    },
    onError: (error) => {
      handleError(error, 'Failed to delete farmer');
    },
  });
};
