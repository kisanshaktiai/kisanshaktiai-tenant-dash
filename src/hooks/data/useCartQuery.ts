import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService } from '@/services/SalesService';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import type { AddToCartRequest } from '@/types/sales';
import { toast } from 'sonner';

export const CART_QUERY_KEY = 'shopping-cart';

// Fetch active cart
export const useCartQuery = (farmerId?: string) => {
  const { getTenantId } = useTenantIsolation();

  return useQuery({
    queryKey: [CART_QUERY_KEY, getTenantId(), farmerId],
    queryFn: async () => {
      if (!farmerId) return null;
      const tenantId = getTenantId();
      return salesService.getActiveCart(farmerId, tenantId);
    },
    enabled: !!farmerId && !!getTenantId(),
  });
};

// Fetch cart items
export const useCartItemsQuery = (cartId?: string) => {
  const { getTenantId } = useTenantIsolation();

  return useQuery({
    queryKey: [CART_QUERY_KEY, 'items', getTenantId(), cartId],
    queryFn: async () => {
      if (!cartId) return [];
      const tenantId = getTenantId();
      return salesService.getCartItems(cartId, tenantId);
    },
    enabled: !!cartId && !!getTenantId(),
  });
};

// Create cart mutation
export const useCreateCartMutation = () => {
  const { getTenantId } = useTenantIsolation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      farmerId,
      dealerId,
    }: {
      farmerId: string;
      dealerId?: string;
    }) => {
      const tenantId = getTenantId();
      return salesService.createCart(farmerId, tenantId, dealerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });
    },
  });
};

// Add to cart mutation
export const useAddToCartMutation = () => {
  const { getTenantId } = useTenantIsolation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cartId,
      farmerId,
      data,
    }: {
      cartId: string;
      farmerId: string;
      data: AddToCartRequest;
    }) => {
      const tenantId = getTenantId();
      return salesService.addToCart(cartId, farmerId, tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });
      toast.success('Item added to cart');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add item: ${error.message}`);
    },
  });
};

// Update cart item mutation
export const useUpdateCartItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      return salesService.updateCartItem(itemId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });
      toast.success('Cart updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update cart: ${error.message}`);
    },
  });
};

// Remove from cart mutation
export const useRemoveFromCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      return salesService.removeFromCart(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });
      toast.success('Item removed from cart');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove item: ${error.message}`);
    },
  });
};

// Clear cart mutation
export const useClearCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartId: string) => {
      return salesService.clearCart(cartId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });
      toast.success('Cart cleared');
    },
    onError: (error: Error) => {
      toast.error(`Failed to clear cart: ${error.message}`);
    },
  });
};
