import { useQuery } from '@tanstack/react-query';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { organizationSettingsService } from '@/services/OrganizationSettingsService';

export const useOrganizationMetrics = () => {
  const { getTenantId } = useTenantIsolation();

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['organization-metrics', getTenantId()],
    queryFn: async () => {
      return await organizationSettingsService.getMetrics(getTenantId());
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  return {
    metrics,
    isLoading,
    error,
  };
};
