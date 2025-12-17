import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService } from '@/services/SalesService';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { toast } from 'sonner';

export const DELIVERY_QUERY_KEY = 'order-deliveries';

// Fetch delivery by order
export const useDeliveryQuery = (orderId?: string) => {
  const { getTenantId } = useTenantIsolation();

  return useQuery({
    queryKey: [DELIVERY_QUERY_KEY, getTenantId(), orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const tenantId = getTenantId();
      return salesService.getDeliveryByOrder(orderId, tenantId);
    },
    enabled: !!orderId && !!getTenantId(),
  });
};

// Track delivery by tracking number
export const useTrackDeliveryQuery = (trackingNumber?: string) => {
  return useQuery({
    queryKey: [DELIVERY_QUERY_KEY, 'track', trackingNumber],
    queryFn: async () => {
      if (!trackingNumber) return null;
      return salesService.trackDelivery(trackingNumber);
    },
    enabled: !!trackingNumber,
  });
};

// Schedule delivery mutation
export const useScheduleDeliveryMutation = () => {
  const { getTenantId } = useTenantIsolation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      farmerId,
      data,
    }: {
      orderId: string;
      farmerId: string;
      data: {
        delivery_method: string;
        courier_name?: string;
        expected_delivery_date?: string;
        dealer_id?: string;
      };
    }) => {
      const tenantId = getTenantId();
      return salesService.scheduleDelivery(orderId, farmerId, tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DELIVERY_QUERY_KEY] });
      toast.success('Delivery scheduled');
    },
    onError: (error: Error) => {
      toast.error(`Failed to schedule delivery: ${error.message}`);
    },
  });
};

// Update delivery status mutation
export const useUpdateDeliveryStatusMutation = () => {
  const { getTenantId } = useTenantIsolation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      deliveryId,
      status,
      notes,
    }: {
      deliveryId: string;
      status: string;
      notes?: string;
    }) => {
      const tenantId = getTenantId();
      return salesService.updateDeliveryStatus(deliveryId, tenantId, status, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DELIVERY_QUERY_KEY] });
      toast.success('Delivery status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update delivery: ${error.message}`);
    },
  });
};
