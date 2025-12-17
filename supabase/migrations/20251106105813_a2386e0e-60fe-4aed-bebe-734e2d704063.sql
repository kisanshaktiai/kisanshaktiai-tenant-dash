-- =====================================================
-- PHASE 1: COMPREHENSIVE SALES SYSTEM DATABASE SCHEMA
-- Multi-Tenant SaaS with Farmer & Dealer Isolation
-- =====================================================

-- Drop existing partial tables to start fresh
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.dealer_commissions CASCADE;

-- =====================================================
-- HELPER FUNCTIONS FOR JWT CLAIMS & AUTHORIZATION
-- =====================================================

-- Extract tenant_id from JWT
CREATE OR REPLACE FUNCTION public.get_jwt_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN NULLIF(current_setting('request.jwt.claims', true)::json->>'tenant_id', '')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Extract farmer_id from JWT
CREATE OR REPLACE FUNCTION public.get_jwt_farmer_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN NULLIF(current_setting('request.jwt.claims', true)::json->>'farmer_id', '')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Extract dealer_id from JWT
CREATE OR REPLACE FUNCTION public.get_jwt_dealer_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN NULLIF(current_setting('request.jwt.claims', true)::json->>'dealer_id', '')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Check if user is tenant admin
CREATE OR REPLACE FUNCTION public.is_tenant_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  v_tenant_id := get_jwt_tenant_id();
  
  IF v_tenant_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.user_tenants
    WHERE user_id = auth.uid()
    AND tenant_id = v_tenant_id
    AND role IN ('admin', 'owner')
    AND is_active = true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- =====================================================
-- CORE SALES TABLES
-- =====================================================

-- Sales Orders
CREATE TABLE public.sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES public.dealers(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL UNIQUE,
  order_type TEXT NOT NULL DEFAULT 'direct_purchase',
  order_source TEXT NOT NULL DEFAULT 'farmer_app',
  order_status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  fulfillment_status TEXT NOT NULL DEFAULT 'pending',
  subtotal_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_charges NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_address JSONB,
  billing_address JSONB,
  payment_method TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  confirmed_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_sales_orders_tenant ON public.sales_orders(tenant_id);
CREATE INDEX idx_sales_orders_farmer ON public.sales_orders(farmer_id);
CREATE INDEX idx_sales_orders_dealer ON public.sales_orders(dealer_id);
CREATE INDEX idx_sales_orders_status ON public.sales_orders(order_status);
CREATE INDEX idx_sales_orders_created ON public.sales_orders(created_at DESC);

-- Sales Order Items
CREATE TABLE public.sales_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES public.dealers(id) ON DELETE SET NULL,
  order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  unit_price NUMERIC(12,2) NOT NULL,
  quantity INTEGER NOT NULL,
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  tax_percentage NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  line_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  dealer_commission_rate NUMERIC(5,2) DEFAULT 0,
  dealer_commission_amount NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_order_items_order ON public.sales_order_items(order_id);
CREATE INDEX idx_sales_order_items_product ON public.sales_order_items(product_id);

-- Shopping Carts
CREATE TABLE public.shopping_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES public.dealers(id) ON DELETE SET NULL,
  session_id TEXT,
  cart_status TEXT NOT NULL DEFAULT 'active',
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shopping_carts_farmer ON public.shopping_carts(farmer_id);
CREATE INDEX idx_shopping_carts_status ON public.shopping_carts(cart_status);

-- Cart Items
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  cart_id UUID NOT NULL REFERENCES public.shopping_carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  notes TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cart_items_cart ON public.cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON public.cart_items(product_id);

-- Order Fulfillment
CREATE TABLE public.order_fulfillment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES public.dealers(id) ON DELETE SET NULL,
  fulfillment_status TEXT NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id),
  warehouse_location TEXT,
  packing_notes TEXT,
  packed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_fulfillment_order ON public.order_fulfillment(order_id);

-- Order Deliveries
CREATE TABLE public.order_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES public.dealers(id) ON DELETE SET NULL,
  tracking_number TEXT UNIQUE,
  delivery_method TEXT NOT NULL,
  courier_name TEXT,
  expected_delivery_date DATE,
  actual_delivery_date TIMESTAMPTZ,
  delivery_status TEXT NOT NULL DEFAULT 'scheduled',
  delivered_to TEXT,
  signature_url TEXT,
  delivery_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_deliveries_order ON public.order_deliveries(order_id);
CREATE INDEX idx_order_deliveries_tracking ON public.order_deliveries(tracking_number);

-- Sales Returns
CREATE TABLE public.sales_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES public.dealers(id) ON DELETE SET NULL,
  order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
  return_number TEXT NOT NULL UNIQUE,
  return_reason TEXT NOT NULL,
  return_status TEXT NOT NULL DEFAULT 'requested',
  return_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  refund_method TEXT,
  refund_status TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_returns_order ON public.sales_returns(order_id);

-- Sales Return Items
CREATE TABLE public.sales_return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  return_id UUID NOT NULL REFERENCES public.sales_returns(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES public.sales_order_items(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  return_condition TEXT NOT NULL,
  refund_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_return_items_return ON public.sales_return_items(return_id);

-- Dealer Commissions
CREATE TABLE public.dealer_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
  base_amount NUMERIC(12,2) NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  commission_status TEXT NOT NULL DEFAULT 'pending',
  payment_date DATE,
  payment_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dealer_commissions_dealer ON public.dealer_commissions(dealer_id);
CREATE INDEX idx_dealer_commissions_order ON public.dealer_commissions(order_id);

-- Inventory Movements
CREATE TABLE public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL,
  order_id UUID REFERENCES public.sales_orders(id) ON DELETE SET NULL,
  dealer_id UUID REFERENCES public.dealers(id) ON DELETE SET NULL,
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE SET NULL,
  quantity_change INTEGER NOT NULL,
  stock_before INTEGER NOT NULL,
  stock_after INTEGER NOT NULL,
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_inventory_movements_product ON public.inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_created ON public.inventory_movements(created_at DESC);

-- Sales Analytics
CREATE TABLE public.sales_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  metric_type TEXT NOT NULL,
  dimensions JSONB DEFAULT '{}'::jsonb,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_analytics_date ON public.sales_analytics(date DESC);
CREATE INDEX idx_sales_analytics_dimensions ON public.sales_analytics USING gin(dimensions);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_fulfillment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY sales_orders_admin ON public.sales_orders FOR ALL USING (is_tenant_admin() AND tenant_id = get_jwt_tenant_id());
CREATE POLICY sales_orders_farmer_read ON public.sales_orders FOR SELECT USING (tenant_id = get_jwt_tenant_id() AND farmer_id = get_jwt_farmer_id());
CREATE POLICY sales_orders_dealer_all ON public.sales_orders FOR ALL USING (tenant_id = get_jwt_tenant_id() AND dealer_id = get_jwt_dealer_id());

CREATE POLICY sales_order_items_admin ON public.sales_order_items FOR ALL USING (is_tenant_admin() AND tenant_id = get_jwt_tenant_id());

CREATE POLICY shopping_carts_farmer ON public.shopping_carts FOR ALL USING (tenant_id = get_jwt_tenant_id() AND farmer_id = get_jwt_farmer_id());
CREATE POLICY shopping_carts_admin ON public.shopping_carts FOR ALL USING (is_tenant_admin() AND tenant_id = get_jwt_tenant_id());

CREATE POLICY cart_items_farmer ON public.cart_items FOR ALL USING (tenant_id = get_jwt_tenant_id() AND farmer_id = get_jwt_farmer_id());
CREATE POLICY cart_items_admin ON public.cart_items FOR ALL USING (is_tenant_admin() AND tenant_id = get_jwt_tenant_id());

CREATE POLICY order_fulfillment_admin ON public.order_fulfillment FOR ALL USING (is_tenant_admin() AND tenant_id = get_jwt_tenant_id());

CREATE POLICY order_deliveries_admin ON public.order_deliveries FOR ALL USING (is_tenant_admin() AND tenant_id = get_jwt_tenant_id());
CREATE POLICY order_deliveries_farmer_read ON public.order_deliveries FOR SELECT USING (tenant_id = get_jwt_tenant_id() AND farmer_id = get_jwt_farmer_id());

CREATE POLICY sales_returns_admin ON public.sales_returns FOR ALL USING (is_tenant_admin() AND tenant_id = get_jwt_tenant_id());
CREATE POLICY sales_returns_farmer ON public.sales_returns FOR ALL USING (tenant_id = get_jwt_tenant_id() AND farmer_id = get_jwt_farmer_id());

CREATE POLICY sales_return_items_admin ON public.sales_return_items FOR ALL USING (is_tenant_admin() AND tenant_id = get_jwt_tenant_id());

CREATE POLICY dealer_commissions_admin ON public.dealer_commissions FOR ALL USING (is_tenant_admin() AND tenant_id = get_jwt_tenant_id());
CREATE POLICY dealer_commissions_dealer_read ON public.dealer_commissions FOR SELECT USING (tenant_id = get_jwt_tenant_id() AND dealer_id = get_jwt_dealer_id());

CREATE POLICY inventory_movements_admin ON public.inventory_movements FOR ALL USING (is_tenant_admin() AND tenant_id = get_jwt_tenant_id());

CREATE POLICY sales_analytics_admin ON public.sales_analytics FOR ALL USING (is_tenant_admin() AND tenant_id = get_jwt_tenant_id());

-- =====================================================
-- HELPER FUNCTIONS & TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION public.generate_order_number(p_tenant_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.sales_orders WHERE tenant_id = p_tenant_id;
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((v_count + 1)::TEXT, 5, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.sales_orders_set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number(NEW.tenant_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sales_orders_order_number_trigger BEFORE INSERT ON public.sales_orders
  FOR EACH ROW EXECUTE FUNCTION sales_orders_set_order_number();

CREATE OR REPLACE FUNCTION public.sales_order_items_calculate_total()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.line_total := (NEW.unit_price * NEW.quantity) - COALESCE(NEW.discount_amount, 0) + COALESCE(NEW.tax_amount, 0);
  RETURN NEW;
END;
$$;

CREATE TRIGGER sales_order_items_total_trigger BEFORE INSERT OR UPDATE ON public.sales_order_items
  FOR EACH ROW EXECUTE FUNCTION sales_order_items_calculate_total();