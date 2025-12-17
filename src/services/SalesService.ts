import { supabase } from '@/integrations/supabase/client';
import type {
  SalesOrder,
  SalesOrderItem,
  ShoppingCart,
  CartItem,
  OrderFulfillment,
  OrderDelivery,
  SalesReturn,
  SalesReturnItem,
  DealerCommission,
  InventoryMovement,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  AddToCartRequest,
  CreateReturnRequest,
  OrderFilters,
  SalesAnalytics,
} from '@/types/sales';
import { BaseApiService, type PaginationOptions, type SortOptions } from './core/BaseApiService';

export class SalesService extends BaseApiService {
  // =====================================================
  // CART MANAGEMENT
  // =====================================================

  async getActiveCart(farmerId: string, tenantId: string): Promise<ShoppingCart | null> {
    return this.executeQuery(async () => {
      return await supabase
        .from('shopping_carts')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('farmer_id', farmerId)
        .eq('cart_status', 'active')
        .single();
    });
  }

  async createCart(farmerId: string, tenantId: string, dealerId?: string): Promise<ShoppingCart> {
    return this.executeQuery(async () => {
      return await supabase
        .from('shopping_carts')
        .insert({
          tenant_id: tenantId,
          farmer_id: farmerId,
          dealer_id: dealerId,
          cart_status: 'active',
        })
        .select()
        .single();
    });
  }

  async getCartItems(cartId: string, tenantId: string): Promise<CartItem[]> {
    return this.executeQuery(async () => {
      return await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId)
        .eq('tenant_id', tenantId);
    });
  }

  async addToCart(
    cartId: string,
    farmerId: string,
    tenantId: string,
    data: AddToCartRequest
  ): Promise<CartItem> {
    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('product_id', data.product_id)
      .single();

    if (existingItem) {
      // Update quantity if item exists
      return this.executeQuery(async () => {
        return await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + data.quantity })
          .eq('id', existingItem.id)
          .select()
          .single();
      });
    }

    // Get product price (using correct column name)
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('id', data.product_id)
      .single();

    return this.executeQuery(async () => {
      return await supabase
        .from('cart_items')
        .insert({
          tenant_id: tenantId,
          farmer_id: farmerId,
          cart_id: cartId,
          product_id: data.product_id,
          quantity: data.quantity,
          unit_price: 0, // Will be updated based on product pricing
          notes: data.notes,
        })
        .select()
        .single();
    });
  }

  async updateCartItem(itemId: string, quantity: number): Promise<CartItem> {
    return this.executeQuery(async () => {
      return await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .select()
        .single();
    });
  }

  async removeFromCart(itemId: string): Promise<void> {
    await this.executeQuery(async () => {
      return await supabase.from('cart_items').delete().eq('id', itemId);
    });
  }

  async clearCart(cartId: string): Promise<void> {
    await this.executeQuery(async () => {
      return await supabase.from('cart_items').delete().eq('cart_id', cartId);
    });
  }

  // =====================================================
  // ORDER MANAGEMENT
  // =====================================================

  async createOrder(tenantId: string, data: CreateOrderRequest): Promise<SalesOrder> {
    // Calculate totals
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
    const totalDiscount = data.items.reduce(
      (sum, item) => sum + (item.discount_amount || 0),
      0
    );
    const totalTax = data.items.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
    const shipping = data.shipping_charges || 0;
    const total = subtotal - totalDiscount + totalTax + shipping;

    // Create order
    const { data: orderData, error } = await supabase
      .from('sales_orders')
      .insert([{
        tenant_id: tenantId,
        order_number: `ORD-${Date.now()}`,
        farmer_id: data.farmer_id,
        dealer_id: data.dealer_id,
        order_type: data.order_type,
        order_source: data.order_source,
        subtotal_amount: subtotal,
        tax_amount: totalTax,
        discount_amount: totalDiscount,
        shipping_charges: shipping,
        total_amount: total,
        delivery_address: data.delivery_address as any,
        billing_address: data.billing_address as any,
        payment_method: data.payment_method,
        notes: data.notes,
      }])
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    const order = orderData as unknown as SalesOrder;

    const orderItems = data.items.map((item) => ({
      tenant_id: tenantId,
      farmer_id: data.farmer_id,
      order_id: order.id,
      product_id: item.product_id,
      product_name: 'Product', // Will be updated by app logic
      unit_price: item.unit_price,
      quantity: item.quantity,
      discount_amount: item.discount_amount || 0,
      tax_amount: item.tax_amount || 0,
    }));

    await supabase.from('sales_order_items').insert(orderItems);

    return order;
  }

  async getOrders(
    tenantId: string,
    filters?: OrderFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<SalesOrder[]> {
    return this.executeQuery(async () => {
      let query = supabase.from('sales_orders').select('*').eq('tenant_id', tenantId);

      // Apply filters
      if (filters) {
        if (filters.order_status?.length) {
          query = query.in('order_status', filters.order_status);
        }
        if (filters.payment_status?.length) {
          query = query.in('payment_status', filters.payment_status);
        }
        if (filters.order_type?.length) {
          query = query.in('order_type', filters.order_type);
        }
        if (filters.dealer_id) {
          query = query.eq('dealer_id', filters.dealer_id);
        }
        if (filters.farmer_id) {
          query = query.eq('farmer_id', filters.farmer_id);
        }
        if (filters.date_from) {
          query = query.gte('created_at', filters.date_from);
        }
        if (filters.date_to) {
          query = query.lte('created_at', filters.date_to);
        }
        if (filters.search) {
          query = query.or(
            `order_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
          );
        }
      }

      // Apply sorting
      if (sort) {
        query = this.applySorting(query, sort);
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (pagination) {
        query = this.applyPagination(query, pagination);
      }

      const { data, error } = await query;
      return { data: data as unknown as SalesOrder[], error };
    });
  }

  async getOrderById(orderId: string, tenantId: string): Promise<SalesOrder> {
    return this.executeQuery(async () => {
      return await supabase
        .from('sales_orders')
        .select('*')
        .eq('id', orderId)
        .eq('tenant_id', tenantId)
        .single();
    });
  }

  async getOrderItems(orderId: string, tenantId: string): Promise<SalesOrderItem[]> {
    return this.executeQuery(async () => {
      return await supabase
        .from('sales_order_items')
        .select('*')
        .eq('order_id', orderId)
        .eq('tenant_id', tenantId);
    });
  }

  async updateOrderStatus(
    orderId: string,
    tenantId: string,
    updates: UpdateOrderStatusRequest
  ): Promise<SalesOrder> {
    return this.executeQuery(async () => {
      return await supabase
        .from('sales_orders')
        .update(updates)
        .eq('id', orderId)
        .eq('tenant_id', tenantId)
        .select()
        .single();
    });
  }

  async confirmOrder(orderId: string, tenantId: string): Promise<SalesOrder> {
    return this.executeQuery(async () => {
      return await supabase
        .from('sales_orders')
        .update({
          order_status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .eq('tenant_id', tenantId)
        .select()
        .single();
    });
  }

  async cancelOrder(orderId: string, tenantId: string, reason?: string): Promise<SalesOrder> {
    return this.executeQuery(async () => {
      return await supabase
        .from('sales_orders')
        .update({
          order_status: 'cancelled',
          notes: reason,
        })
        .eq('id', orderId)
        .eq('tenant_id', tenantId)
        .select()
        .single();
    });
  }

  // =====================================================
  // FULFILLMENT MANAGEMENT
  // =====================================================

  async createFulfillment(
    orderId: string,
    tenantId: string,
    dealerId?: string
  ): Promise<OrderFulfillment> {
    return this.executeQuery(async () => {
      return await supabase
        .from('order_fulfillment')
        .insert({
          tenant_id: tenantId,
          order_id: orderId,
          dealer_id: dealerId,
          fulfillment_status: 'pending',
        })
        .select()
        .single();
    });
  }

  async updateFulfillmentStatus(
    fulfillmentId: string,
    tenantId: string,
    status: string,
    notes?: string
  ): Promise<OrderFulfillment> {
    const updates: any = { fulfillment_status: status };

    if (status === 'packed') updates.packed_at = new Date().toISOString();
    if (status === 'shipped') updates.shipped_at = new Date().toISOString();
    if (status === 'delivered') updates.delivered_at = new Date().toISOString();
    if (notes) updates.packing_notes = notes;

    return this.executeQuery(async () => {
      return await supabase
        .from('order_fulfillment')
        .update(updates)
        .eq('id', fulfillmentId)
        .eq('tenant_id', tenantId)
        .select()
        .single();
    });
  }

  async getFulfillmentByOrder(orderId: string, tenantId: string): Promise<OrderFulfillment | null> {
    return this.executeQuery(async () => {
      return await supabase
        .from('order_fulfillment')
        .select('*')
        .eq('order_id', orderId)
        .eq('tenant_id', tenantId)
        .single();
    });
  }

  // =====================================================
  // DELIVERY MANAGEMENT
  // =====================================================

  async scheduleDelivery(
    orderId: string,
    farmerId: string,
    tenantId: string,
    data: {
      delivery_method: string;
      courier_name?: string;
      expected_delivery_date?: string;
      dealer_id?: string;
    }
  ): Promise<OrderDelivery> {
    return this.executeQuery(async () => {
      return await supabase
        .from('order_deliveries')
        .insert({
          tenant_id: tenantId,
          order_id: orderId,
          farmer_id: farmerId,
          dealer_id: data.dealer_id,
          delivery_method: data.delivery_method,
          courier_name: data.courier_name,
          expected_delivery_date: data.expected_delivery_date,
          delivery_status: 'scheduled',
        })
        .select()
        .single();
    });
  }

  async updateDeliveryStatus(
    deliveryId: string,
    tenantId: string,
    status: string,
    notes?: string
  ): Promise<OrderDelivery> {
    const updates: any = { delivery_status: status };

    if (status === 'delivered') {
      updates.actual_delivery_date = new Date().toISOString();
    }
    if (notes) updates.delivery_notes = notes;

    return this.executeQuery(async () => {
      return await supabase
        .from('order_deliveries')
        .update(updates)
        .eq('id', deliveryId)
        .eq('tenant_id', tenantId)
        .select()
        .single();
    });
  }

  async trackDelivery(trackingNumber: string): Promise<OrderDelivery | null> {
    return this.executeQuery(async () => {
      return await supabase
        .from('order_deliveries')
        .select('*')
        .eq('tracking_number', trackingNumber)
        .single();
    });
  }

  async getDeliveryByOrder(orderId: string, tenantId: string): Promise<OrderDelivery | null> {
    return this.executeQuery(async () => {
      return await supabase
        .from('order_deliveries')
        .select('*')
        .eq('order_id', orderId)
        .eq('tenant_id', tenantId)
        .single();
    });
  }

  // =====================================================
  // RETURNS MANAGEMENT
  // =====================================================

  async createReturn(
    tenantId: string,
    farmerId: string,
    data: CreateReturnRequest
  ): Promise<SalesReturn> {
    // Calculate return amount
    const { data: orderItems } = await supabase
      .from('sales_order_items')
      .select('*')
      .in(
        'id',
        data.items.map((i) => i.order_item_id)
      );

    const returnAmount =
      orderItems?.reduce((sum, item) => {
        const returnItem = data.items.find((i) => i.order_item_id === item.id);
        if (returnItem) {
          return sum + (item.unit_price * returnItem.quantity);
        }
        return sum;
      }, 0) || 0;

    // Create return
    const salesReturn = await this.executeQuery<SalesReturn>(async () => {
      return await supabase
        .from('sales_returns')
        .insert({
          tenant_id: tenantId,
          farmer_id: farmerId,
          order_id: data.order_id,
          return_number: `RET-${Date.now()}`,
          return_reason: data.return_reason,
          return_status: 'requested',
          return_amount: returnAmount,
          notes: data.notes,
        })
        .select()
        .single();
    });

    // Create return items
    const returnItems = data.items.map((item) => {
      const orderItem = orderItems?.find((oi) => oi.id === item.order_item_id);
      return {
        tenant_id: tenantId,
        return_id: salesReturn.id,
        order_item_id: item.order_item_id,
        product_id: orderItem?.product_id || '',
        quantity: item.quantity,
        return_condition: item.return_condition,
        refund_amount: (orderItem?.unit_price || 0) * item.quantity,
      };
    });

    await supabase.from('sales_return_items').insert(returnItems);

    return salesReturn;
  }

  async approveReturn(returnId: string, tenantId: string): Promise<SalesReturn> {
    return this.executeQuery(async () => {
      return await supabase
        .from('sales_returns')
        .update({
          return_status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', returnId)
        .eq('tenant_id', tenantId)
        .select()
        .single();
    });
  }

  async processRefund(
    returnId: string,
    tenantId: string,
    refundMethod: string
  ): Promise<SalesReturn> {
    return this.executeQuery(async () => {
      return await supabase
        .from('sales_returns')
        .update({
          return_status: 'refunded',
          refund_method: refundMethod,
          refund_status: 'completed',
          refunded_at: new Date().toISOString(),
        })
        .eq('id', returnId)
        .eq('tenant_id', tenantId)
        .select()
        .single();
    });
  }

  async getReturnsByOrder(orderId: string, tenantId: string): Promise<SalesReturn[]> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('sales_returns')
        .select('*')
        .eq('order_id', orderId)
        .eq('tenant_id', tenantId);
      
      return { data: data as SalesReturn[], error };
    });
  }

  // =====================================================
  // COMMISSION MANAGEMENT
  // =====================================================

  async calculateCommission(
    orderId: string,
    tenantId: string,
    commissionRate: number = 5
  ): Promise<DealerCommission> {
    const order = await this.getOrderById(orderId, tenantId);

    if (!order.dealer_id) {
      throw new Error('Order does not have an associated dealer');
    }

    const commissionAmount = (order.total_amount * commissionRate) / 100;

    return this.executeQuery(async () => {
      return await supabase
        .from('dealer_commissions')
        .insert({
          tenant_id: tenantId,
          dealer_id: order.dealer_id!,
          order_id: orderId,
          base_amount: order.total_amount,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          commission_status: 'pending',
        })
        .select()
        .single();
    });
  }

  async approveCommission(
    commissionId: string,
    tenantId: string
  ): Promise<DealerCommission> {
    return this.executeQuery(async () => {
      return await supabase
        .from('dealer_commissions')
        .update({ commission_status: 'approved' })
        .eq('id', commissionId)
        .eq('tenant_id', tenantId)
        .select()
        .single();
    });
  }

  async payCommission(
    commissionId: string,
    tenantId: string,
    paymentReference: string
  ): Promise<DealerCommission> {
    return this.executeQuery(async () => {
      return await supabase
        .from('dealer_commissions')
        .update({
          commission_status: 'paid',
          payment_date: new Date().toISOString().split('T')[0],
          payment_reference: paymentReference,
        })
        .eq('id', commissionId)
        .eq('tenant_id', tenantId)
        .select()
        .single();
    });
  }

  async getDealerCommissions(
    dealerId: string,
    tenantId: string,
    status?: string
  ): Promise<DealerCommission[]> {
    return this.executeQuery(async () => {
      let query = supabase
        .from('dealer_commissions')
        .select('*')
        .eq('dealer_id', dealerId)
        .eq('tenant_id', tenantId);

      if (status) {
        query = query.eq('commission_status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      return { data: data as DealerCommission[], error };
    });
  }

  // =====================================================
  // ANALYTICS
  // =====================================================

  async getSalesAnalytics(
    tenantId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<SalesAnalytics> {
    let query = supabase.from('sales_orders').select('*').eq('tenant_id', tenantId);

    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo);

    const { data: orders } = await query;

    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const pendingOrders = orders?.filter((o) => o.order_status === 'pending').length || 0;
    const deliveredOrders = orders?.filter((o) => o.order_status === 'delivered').length || 0;
    const cancelledOrders = orders?.filter((o) => o.order_status === 'cancelled').length || 0;

    // Calculate return rate
    const { data: returns } = await supabase
      .from('sales_returns')
      .select('*')
      .eq('tenant_id', tenantId);

    const returnRate = totalOrders > 0 ? ((returns?.length || 0) / totalOrders) * 100 : 0;

    return {
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      average_order_value: averageOrderValue,
      pending_orders: pendingOrders,
      delivered_orders: deliveredOrders,
      cancelled_orders: cancelledOrders,
      return_rate: returnRate,
      top_products: [],
      sales_by_date: [],
    };
  }
}

export const salesService = new SalesService();
