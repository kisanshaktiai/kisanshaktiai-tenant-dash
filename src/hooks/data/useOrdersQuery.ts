import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService } from '@/services/SalesService';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import type {
  SalesOrder,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderFilters,
} from '@/types/sales';
import { toast } from 'sonner';

export const ORDERS_QUERY_KEY = 'sales-orders';

// Fetch all orders with filters
export const useOrdersQuery = (filters?: OrderFilters) => {
  const { getTenantId } = useTenantIsolation();

  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, getTenantId(), filters],
    queryFn: async () => {
      const tenantId = getTenantId();
      return salesService.getOrders(tenantId, filters);
    },
    enabled: !!getTenantId(),
  });
};

// Fetch single order by ID
export const useOrderQuery = (orderId?: string) => {
  const { getTenantId } = useTenantIsolation();

  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, getTenantId(), orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID is required');
      const tenantId = getTenantId();
      return salesService.getOrderById(orderId, tenantId);
    },
    enabled: !!orderId && !!getTenantId(),
  });
};

// Fetch order items
export const useOrderItemsQuery = (orderId?: string) => {
  const { getTenantId } = useTenantIsolation();

  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, 'items', getTenantId(), orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID is required');
      const tenantId = getTenantId();
      return salesService.getOrderItems(orderId, tenantId);
    },
    enabled: !!orderId && !!getTenantId(),
  });
};

// Create order mutation
export const useCreateOrderMutation = () => {
  const { getTenantId } = useTenantIsolation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderRequest) => {
      const tenantId = getTenantId();
      return salesService.createOrder(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
      toast.success('Order created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create order: ${error.message}`);
    },
  });
};

// Update order status mutation
export const useUpdateOrderStatusMutation = () => {
  const { getTenantId } = useTenantIsolation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      updates,
    }: {
      orderId: string;
      updates: UpdateOrderStatusRequest;
    }) => {
      const tenantId = getTenantId();
      return salesService.updateOrderStatus(orderId, tenantId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
      toast.success('Order status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update order: ${error.message}`);
    },
  });
};

// Confirm order mutation
export const useConfirmOrderMutation = () => {
  const { getTenantId } = useTenantIsolation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const tenantId = getTenantId();
      return salesService.confirmOrder(orderId, tenantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
      toast.success('Order confirmed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to confirm order: ${error.message}`);
    },
  });
};

// Cancel order mutation
export const useCancelOrderMutation = () => {
  const { getTenantId } = useTenantIsolation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason?: string }) => {
      const tenantId = getTenantId();
      return salesService.cancelOrder(orderId, tenantId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
      toast.success('Order cancelled successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel order: ${error.message}`);
    },
  });
};
