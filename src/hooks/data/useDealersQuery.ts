
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealersService, type DealersListOptions, type CreateDealerData, type UpdateDealerData } from '@/services/DealersService';
import { queryKeys } from '@/lib/queryClient';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

export const useDealersQuery = (options: DealersListOptions = {}) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.dealersList(currentTenant?.id || ''),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return dealersService.getDealers(currentTenant.id, options);
    },
    enabled: !!currentTenant,
  });
};

export const useDealerQuery = (dealerId: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.dealer(dealerId, currentTenant?.id || ''),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return dealersService.getDealer(dealerId, currentTenant.id);
    },
    enabled: !!currentTenant && !!dealerId,
  });
};

export const useCreateDealerMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useMutation({
    mutationFn: async (data: Omit<CreateDealerData, 'tenant_id' | 'dealer_code'>) => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }

      // Get dealer count and generate code
      const count = await dealersService.getDealerCount(currentTenant.id);
      const dealerCode = await dealersService.generateDealerCode(currentTenant.slug, count);

      const createData: CreateDealerData = {
        ...data,
        tenant_id: currentTenant.id,
        dealer_code: dealerCode,
      };

      return dealersService.createDealer(createData);
    },
    onSuccess: (data) => {
      // Invalidate and refetch dealers list
      queryClient.invalidateQueries({ queryKey: queryKeys.dealers(currentTenant?.id || '') });
      
      toast.success('Dealer created successfully');
      return data;
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create dealer');
    },
  });
};

export const useUpdateDealerMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useMutation({
    mutationFn: ({ dealerId, data }: { dealerId: string; data: UpdateDealerData }) => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return dealersService.updateDealer(dealerId, currentTenant.id, data);
    },
    onSuccess: (data, variables) => {
      // Update the specific dealer in cache
      queryClient.setQueryData(queryKeys.dealer(variables.dealerId, currentTenant?.id || ''), data);
      
      // Invalidate dealers list
      queryClient.invalidateQueries({ queryKey: queryKeys.dealers(currentTenant?.id || '') });
      
      toast.success('Dealer updated successfully');
      return data;
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update dealer');
    },
  });
};

export const useDeleteDealerMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useMutation({
    mutationFn: (dealerId: string) => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return dealersService.deleteDealer(dealerId, currentTenant.id);
    },
    onSuccess: (_, dealerId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.dealer(dealerId, currentTenant?.id || '') });
      
      // Invalidate dealers list
      queryClient.invalidateQueries({ queryKey: queryKeys.dealers(currentTenant?.id || '') });
      
      toast.success('Dealer deleted successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete dealer');
    },
  });
};
