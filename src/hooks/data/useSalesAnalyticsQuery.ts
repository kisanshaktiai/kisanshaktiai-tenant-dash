import { useQuery } from '@tanstack/react-query';
import { salesService } from '@/services/SalesService';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';

export const SALES_ANALYTICS_QUERY_KEY = 'sales-analytics';

// Fetch sales analytics
export const useSalesAnalyticsQuery = (dateFrom?: string, dateTo?: string) => {
  const { getTenantId } = useTenantIsolation();

  return useQuery({
    queryKey: [SALES_ANALYTICS_QUERY_KEY, getTenantId(), dateFrom, dateTo],
    queryFn: async () => {
      const tenantId = getTenantId();
      return salesService.getSalesAnalytics(tenantId, dateFrom, dateTo);
    },
    enabled: !!getTenantId(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
