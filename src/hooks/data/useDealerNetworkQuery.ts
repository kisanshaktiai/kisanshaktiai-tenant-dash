
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealerNetworkService, type TerritoryListOptions, type PerformanceListOptions } from '@/services/DealerNetworkService';
import { queryKeys } from '@/lib/queryClient';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

export const useTerritoriesQuery = (options: TerritoryListOptions = {}) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.territories(currentTenant?.id || '', options),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return dealerNetworkService.getTerritories(currentTenant.id, options);
    },
    enabled: !!currentTenant,
  });
};

export const useCreateTerritoryMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useMutation({
    mutationFn: async (data: any) => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return dealerNetworkService.createTerritory({
        ...data,
        tenant_id: currentTenant.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.territories(currentTenant?.id || '') });
      toast.success('Territory created successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create territory');
    },
  });
};

export const useDealerPerformanceQuery = (options: PerformanceListOptions = {}) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.dealerPerformance(currentTenant?.id || '', options),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return dealerNetworkService.getDealerPerformance(currentTenant.id, options);
    },
    enabled: !!currentTenant,
  });
};

export const useDealerCommunicationsQuery = (options: TerritoryListOptions = {}) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.dealerCommunications(currentTenant?.id || '', options),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return dealerNetworkService.getDealerCommunications(currentTenant.id, options);
    },
    enabled: !!currentTenant,
  });
};

export const useCreateCommunicationMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { user } = useAppSelector((state) => state.auth);

  return useMutation({
    mutationFn: async (data: any) => {
      if (!currentTenant || !user) {
        throw new Error('No tenant or user selected');
      }
      return dealerNetworkService.createCommunication({
        ...data,
        tenant_id: currentTenant.id,
        sender_id: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dealerCommunications(currentTenant?.id || '') });
      toast.success('Communication sent successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to send communication');
    },
  });
};

export const useDealerIncentivesQuery = (options: TerritoryListOptions = {}) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.dealerIncentives(currentTenant?.id || '', options),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return dealerNetworkService.getDealerIncentives(currentTenant.id, options);
    },
    enabled: !!currentTenant,
  });
};

export const useCreateIncentiveMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { user } = useAppSelector((state) => state.auth);

  return useMutation({
    mutationFn: async (data: any) => {
      if (!currentTenant || !user) {
        throw new Error('No tenant or user selected');
      }
      return dealerNetworkService.createIncentive({
        ...data,
        tenant_id: currentTenant.id,
        created_by: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dealerIncentives(currentTenant?.id || '') });
      toast.success('Incentive created successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create incentive');
    },
  });
};

export const useDealerOnboardingStepsQuery = (dealerId: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.dealerOnboarding(dealerId, currentTenant?.id || ''),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return dealerNetworkService.getDealerOnboardingSteps(dealerId, currentTenant.id);
    },
    enabled: !!currentTenant && !!dealerId,
  });
};

export const useUpdateOnboardingStepMutation = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useMutation({
    mutationFn: async ({ stepId, dealerId, data }: { stepId: string; dealerId: string; data: any }) => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return dealerNetworkService.updateOnboardingStep(stepId, currentTenant.id, data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.dealerOnboarding(variables.dealerId, currentTenant?.id || '') 
      });
      toast.success('Onboarding step updated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update onboarding step');
    },
  });
};
