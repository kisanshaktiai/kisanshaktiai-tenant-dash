import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService } from '@/services/SalesService';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { toast } from 'sonner';

export const FULFILLMENT_QUERY_KEY = 'order-fulfillment';

// Fetch fulfillment by order
export const useFulfillmentQuery = (orderId?: string) => {
  const { getTenantId } = useTenantIsolation();

  return useQuery({
    queryKey: [FULFILLMENT_QUERY_KEY, getTenantId(), orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const tenantId = getTenantId();
      return salesService.getFulfillmentByOrder(orderId, tenantId);
    },
    enabled: !!orderId && !!getTenantId(),
  });
};

// Create fulfillment mutation
export const useCreateFulfillmentMutation = () => {
  const { getTenantId } = useTenantIsolation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      dealerId,
    }: {
      orderId: string;
      dealerId?: string;
    }) => {
      const tenantId = getTenantId();
      return salesService.createFulfillment(orderId, tenantId, dealerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FULFILLMENT_QUERY_KEY] });
      toast.success('Fulfillment created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create fulfillment: ${error.message}`);
    },
  });
};

// Update fulfillment status mutation
export const useUpdateFulfillmentStatusMutation = () => {
  const { getTenantId } = useTenantIsolation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fulfillmentId,
      status,
      notes,
    }: {
      fulfillmentId: string;
      status: string;
      notes?: string;
    }) => {
      const tenantId = getTenantId();
      return salesService.updateFulfillmentStatus(fulfillmentId, tenantId, status, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FULFILLMENT_QUERY_KEY] });
      toast.success('Fulfillment status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update fulfillment: ${error.message}`);
    },
  });
};
