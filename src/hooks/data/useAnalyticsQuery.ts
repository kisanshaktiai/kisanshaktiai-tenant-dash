
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/AnalyticsService';
import { queryKeys } from '@/lib/queryClient';
import { useAppSelector } from '@/store/hooks';
import type { AnalyticsFilters } from '@/types/analytics';

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

export const useExecutiveDashboardQuery = (filters?: AnalyticsFilters) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.executiveDashboard(currentTenant?.id || '', filters),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return analyticsService.getExecutiveDashboardData(currentTenant.id, filters);
    },
    enabled: !!currentTenant,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useFarmerAnalyticsQuery = (filters?: AnalyticsFilters) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.farmerAnalytics(currentTenant?.id || '', filters),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return analyticsService.getFarmerAnalytics(currentTenant.id, filters);
    },
    enabled: !!currentTenant,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useProductAnalyticsQuery = (filters?: AnalyticsFilters) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.productAnalytics(currentTenant?.id || '', filters),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return analyticsService.getProductAnalytics(currentTenant.id, filters);
    },
    enabled: !!currentTenant,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useCustomReportsQuery = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.customReports(currentTenant?.id || ''),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return analyticsService.getCustomReports(currentTenant.id);
    },
    enabled: !!currentTenant,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const usePredictiveAnalyticsQuery = (modelType?: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.predictiveAnalytics(currentTenant?.id || '', modelType),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return analyticsService.getPredictiveAnalytics(currentTenant.id, modelType);
    },
    enabled: !!currentTenant,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useExportLogsQuery = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  return useQuery({
    queryKey: queryKeys.exportLogs(currentTenant?.id || ''),
    queryFn: () => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return analyticsService.getExportLogs(currentTenant.id);
    },
    enabled: !!currentTenant,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
