import { useQuery } from '@tanstack/react-query';
import { predictiveSalesService } from '@/services/PredictiveSalesService';
import { useAppSelector } from '@/store/hooks';

export const useFarmerUpcomingNeeds = (farmerId?: string, days = 30) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: ['farmer-upcoming-needs', currentTenant?.id, farmerId, days],
    queryFn: async () => {
      if (!currentTenant?.id || !farmerId) {
        return [];
      }
      return predictiveSalesService.getFarmerUpcomingNeeds(
        currentTenant.id,
        farmerId,
        days
      );
    },
    enabled: !!currentTenant?.id && !!farmerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTenantDemandForecast = (days = 30) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: ['tenant-demand-forecast', currentTenant?.id, days],
    queryFn: async () => {
      if (!currentTenant?.id) {
        return [];
      }
      return predictiveSalesService.getTenantDemandForecast(currentTenant.id, days);
    },
    enabled: !!currentTenant?.id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useInventoryGap = (days = 30) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: ['inventory-gap', currentTenant?.id, days],
    queryFn: async () => {
      if (!currentTenant?.id) {
        return [];
      }
      return predictiveSalesService.matchInventoryWithDemand(currentTenant.id, days);
    },
    enabled: !!currentTenant?.id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProactiveSalesOpportunities = (days = 7) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: ['proactive-sales-opportunities', currentTenant?.id, days],
    queryFn: async () => {
      if (!currentTenant?.id) {
        return [];
      }
      return predictiveSalesService.getProactiveSalesOpportunities(currentTenant.id, days);
    },
    enabled: !!currentTenant?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const usePredictiveSalesMetrics = (days = 30) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: ['predictive-sales-metrics', currentTenant?.id, days],
    queryFn: async () => {
      if (!currentTenant?.id) {
        return {
          totalFarmersWithNeeds: 0,
          totalPredictedValue: 0,
          productsLowStock: 0,
          urgentContacts: 0,
        };
      }
      return predictiveSalesService.getPredictiveSalesMetrics(currentTenant.id, days);
    },
    enabled: !!currentTenant?.id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFarmerContactList = (productType?: string, days = 7) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: ['farmer-contact-list', currentTenant?.id, productType, days],
    queryFn: async () => {
      if (!currentTenant?.id || !productType) {
        return [];
      }
      return predictiveSalesService.generateFarmerContactList(
        currentTenant.id,
        productType,
        days
      );
    },
    enabled: !!currentTenant?.id && !!productType,
    staleTime: 5 * 60 * 1000,
  });
};
