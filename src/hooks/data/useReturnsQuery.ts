import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService } from '@/services/SalesService';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import type { CreateReturnRequest } from '@/types/sales';
import { toast } from 'sonner';

export const RETURNS_QUERY_KEY = 'sales-returns';

// Fetch returns by order
export const useReturnsQuery = (orderId?: string) => {
  const { getTenantId } = useTenantIsolation();

  return useQuery({
    queryKey: [RETURNS_QUERY_KEY, getTenantId(), orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const tenantId = getTenantId();
      return salesService.getReturnsByOrder(orderId, tenantId);
    },
    enabled: !!orderId && !!getTenantId(),
  });
};

// Create return mutation
export const useCreateReturnMutation = () => {
  const { getTenantId, validateTenantAccess } = useTenantIsolation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      farmerId,
      data,
    }: {
      farmerId: string;
      data: CreateReturnRequest;
    }) => {
      const tenantId = getTenantId();
      return salesService.createReturn(tenantId, farmerId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RETURNS_QUERY_KEY] });
      toast.success('Return request created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create return: ${error.message}`);
    },
  });
};

// Approve return mutation
export const useApproveReturnMutation = () => {
  const { getTenantId } = useTenantIsolation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (returnId: string) => {
      const tenantId = getTenantId();
      return salesService.approveReturn(returnId, tenantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RETURNS_QUERY_KEY] });
      toast.success('Return approved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve return: ${error.message}`);
    },
  });
};

// Process refund mutation
export const useProcessRefundMutation = () => {
  const { getTenantId } = useTenantIsolation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      returnId,
      refundMethod,
    }: {
      returnId: string;
      refundMethod: string;
    }) => {
      const tenantId = getTenantId();
      return salesService.processRefund(returnId, tenantId, refundMethod);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RETURNS_QUERY_KEY] });
      toast.success('Refund processed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to process refund: ${error.message}`);
    },
  });
};
