import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService } from '@/services/SalesService';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { toast } from 'sonner';

export const COMMISSIONS_QUERY_KEY = 'dealer-commissions';

// Fetch dealer commissions
export const useCommissionsQuery = (dealerId?: string, status?: string) => {
  const { getTenantId } = useTenantIsolation();

  return useQuery({
    queryKey: [COMMISSIONS_QUERY_KEY, getTenantId(), dealerId, status],
    queryFn: async () => {
      if (!dealerId) return [];
      const tenantId = getTenantId();
      return salesService.getDealerCommissions(dealerId, tenantId, status);
    },
    enabled: !!dealerId && !!getTenantId(),
  });
};

// Calculate commission mutation
export const useCalculateCommissionMutation = () => {
  const { getTenantId } = useTenantIsolation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      commissionRate,
    }: {
      orderId: string;
      commissionRate?: number;
    }) => {
      const tenantId = getTenantId();
      return salesService.calculateCommission(orderId, tenantId, commissionRate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMMISSIONS_QUERY_KEY] });
      toast.success('Commission calculated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to calculate commission: ${error.message}`);
    },
  });
};

// Approve commission mutation
export const useApproveCommissionMutation = () => {
  const { getTenantId } = useTenantIsolation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commissionId: string) => {
      const tenantId = getTenantId();
      return salesService.approveCommission(commissionId, tenantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMMISSIONS_QUERY_KEY] });
      toast.success('Commission approved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve commission: ${error.message}`);
    },
  });
};

// Pay commission mutation
export const usePayCommissionMutation = () => {
  const { getTenantId } = useTenantIsolation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commissionId,
      paymentReference,
    }: {
      commissionId: string;
      paymentReference: string;
    }) => {
      const tenantId = getTenantId();
      return salesService.payCommission(commissionId, tenantId, paymentReference);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMMISSIONS_QUERY_KEY] });
      toast.success('Commission paid');
    },
    onError: (error: Error) => {
      toast.error(`Failed to pay commission: ${error.message}`);
    },
  });
};
