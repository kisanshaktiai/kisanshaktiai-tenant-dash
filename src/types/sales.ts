// Sales System Type Definitions

export type OrderType = 'direct_purchase' | 'dealer_assisted' | 'subscription' | 'bulk_order';
export type OrderSource = 'farmer_app' | 'dealer_portal' | 'tenant_dashboard' | 'api';
export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'processing' | 'fulfilled' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';
export type FulfillmentStatus = 'pending' | 'preparing' | 'packed' | 'shipped' | 'delivered';
export type CartStatus = 'active' | 'converted' | 'abandoned';
export type DeliveryMethod = 'dealer_delivery' | 'courier' | 'pickup' | 'direct_ship';
export type DeliveryStatus = 'scheduled' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'received' | 'refunded';
export type ReturnCondition = 'damaged' | 'defective' | 'wrong_item' | 'not_needed' | 'expired';
export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'disputed';
export type MovementType = 'sale' | 'return' | 'adjustment' | 'restock';

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  landmark?: string;
}

export interface SalesOrder {
  id: string;
  tenant_id: string;
  farmer_id: string;
  dealer_id?: string;
  order_number: string;
  order_type: OrderType;
  order_source: OrderSource;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  subtotal_amount: number;
  tax_amount: number;
  discount_amount: number;
  shipping_charges: number;
  total_amount: number;
  delivery_address?: Address;
  billing_address?: Address;
  payment_method?: string;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  delivered_at?: string;
  created_by?: string;
  confirmed_by?: string;
}

export interface SalesOrderItem {
  id: string;
  tenant_id: string;
  farmer_id: string;
  dealer_id?: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  unit_price: number;
  quantity: number;
  discount_percentage: number;
  discount_amount: number;
  tax_percentage: number;
  tax_amount: number;
  line_total: number;
  dealer_commission_rate: number;
  dealer_commission_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ShoppingCart {
  id: string;
  tenant_id: string;
  farmer_id: string;
  dealer_id?: string;
  session_id?: string;
  cart_status: CartStatus;
  last_activity_at: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  tenant_id: string;
  farmer_id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  added_at: string;
  updated_at: string;
}

export interface OrderFulfillment {
  id: string;
  tenant_id: string;
  order_id: string;
  dealer_id?: string;
  fulfillment_status: FulfillmentStatus;
  assigned_to?: string;
  warehouse_location?: string;
  packing_notes?: string;
  packed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderDelivery {
  id: string;
  tenant_id: string;
  order_id: string;
  farmer_id: string;
  dealer_id?: string;
  tracking_number?: string;
  delivery_method: DeliveryMethod;
  courier_name?: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  delivery_status: DeliveryStatus;
  delivered_to?: string;
  signature_url?: string;
  delivery_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SalesReturn {
  id: string;
  tenant_id: string;
  farmer_id: string;
  dealer_id?: string;
  order_id: string;
  return_number: string;
  return_reason: string;
  return_status: ReturnStatus;
  return_amount: number;
  refund_method?: string;
  refund_status?: string;
  requested_at: string;
  approved_at?: string;
  received_at?: string;
  refunded_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SalesReturnItem {
  id: string;
  tenant_id: string;
  return_id: string;
  order_item_id: string;
  product_id: string;
  quantity: number;
  return_condition: ReturnCondition;
  refund_amount: number;
  notes?: string;
  created_at: string;
}

export interface DealerCommission {
  id: string;
  tenant_id: string;
  dealer_id: string;
  order_id: string;
  base_amount: number;
  commission_rate: number;
  commission_amount: number;
  commission_status: CommissionStatus;
  payment_date?: string;
  payment_reference?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  tenant_id: string;
  product_id: string;
  movement_type: MovementType;
  order_id?: string;
  dealer_id?: string;
  farmer_id?: string;
  quantity_change: number;
  stock_before: number;
  stock_after: number;
  reference_number?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

// Request/Response Types
export interface CreateOrderRequest {
  farmer_id: string;
  dealer_id?: string;
  order_type: OrderType;
  order_source: OrderSource;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    discount_amount?: number;
    tax_amount?: number;
  }>;
  delivery_address?: Address;
  billing_address?: Address;
  payment_method?: string;
  shipping_charges?: number;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  order_status?: OrderStatus;
  payment_status?: PaymentStatus;
  fulfillment_status?: FulfillmentStatus;
  notes?: string;
}

export interface AddToCartRequest {
  product_id: string;
  quantity: number;
  notes?: string;
}

export interface CreateReturnRequest {
  order_id: string;
  return_reason: string;
  items: Array<{
    order_item_id: string;
    quantity: number;
    return_condition: ReturnCondition;
  }>;
  notes?: string;
}

export interface OrderFilters {
  order_status?: OrderStatus[];
  payment_status?: PaymentStatus[];
  order_type?: OrderType[];
  dealer_id?: string;
  farmer_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface SalesAnalytics {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  pending_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  return_rate: number;
  top_products: Array<{
    product_id: string;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  sales_by_date: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}
