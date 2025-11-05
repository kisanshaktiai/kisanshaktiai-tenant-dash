-- ============================================
-- PHASE 1.5: ADD RLS POLICIES (CORRECTED)
-- Secure all enhanced tables with correct role enum
-- ============================================

-- Fix the function search path issue
CREATE OR REPLACE FUNCTION sync_subscription_expiry()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update tenant status based on subscription
  IF NEW.status = 'canceled' OR NEW.status = 'past_due' THEN
    UPDATE tenants 
    SET status = 'suspended'
    WHERE id = NEW.tenant_id;
  ELSIF NEW.status = 'active' THEN
    UPDATE tenants 
    SET status = 'active'
    WHERE id = NEW.tenant_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Enable RLS on all subscription tables (if not already enabled)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SUBSCRIPTION_PLANS POLICIES
-- ============================================

-- Public can view active public plans
CREATE POLICY "subscription_plans_public_view"
  ON subscription_plans FOR SELECT
  USING (is_active = true AND is_public = true);

-- Tenant admins can view all plans for their tenant category
CREATE POLICY "subscription_plans_tenant_admin_view"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.role IN ('tenant_owner', 'tenant_admin', 'super_admin', 'tenant_manager')
    )
  );

-- Super admins can manage all plans
CREATE POLICY "subscription_plans_super_admin_all"
  ON subscription_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.role = 'super_admin'
    )
  );

-- ============================================
-- TENANT_SUBSCRIPTIONS POLICIES
-- ============================================

-- Tenant users can view their own tenant's subscription
CREATE POLICY "tenant_subscriptions_tenant_view"
  ON tenant_subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.tenant_id = tenant_subscriptions.tenant_id
      AND ut.is_active = true
    )
  );

-- Tenant owners/admins can manage their tenant's subscription
CREATE POLICY "tenant_subscriptions_owner_manage"
  ON tenant_subscriptions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.tenant_id = tenant_subscriptions.tenant_id
      AND ut.role IN ('tenant_owner', 'tenant_admin')
      AND ut.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.tenant_id = tenant_subscriptions.tenant_id
      AND ut.role IN ('tenant_owner', 'tenant_admin')
      AND ut.is_active = true
    )
  );

-- Super admins can view/manage all tenant subscriptions
CREATE POLICY "tenant_subscriptions_super_admin_all"
  ON tenant_subscriptions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.role = 'super_admin'
    )
  );

-- ============================================
-- FARMER_SUBSCRIPTIONS POLICIES
-- ============================================

-- Farmers can view their own subscriptions
CREATE POLICY "farmer_subscriptions_farmer_view"
  ON farmer_subscriptions FOR SELECT
  TO authenticated
  USING (
    farmer_id = auth.uid()
  );

-- Farmers can update their own subscriptions (payment methods, cancellation)
CREATE POLICY "farmer_subscriptions_farmer_update"
  ON farmer_subscriptions FOR UPDATE
  TO authenticated
  USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());

-- Tenant users can view farmer subscriptions in their tenant
CREATE POLICY "farmer_subscriptions_tenant_view"
  ON farmer_subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.tenant_id = farmer_subscriptions.tenant_id
      AND ut.is_active = true
    )
  );

-- Tenant admins can manage farmer subscriptions in their tenant
CREATE POLICY "farmer_subscriptions_tenant_admin_manage"
  ON farmer_subscriptions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.tenant_id = farmer_subscriptions.tenant_id
      AND ut.role IN ('tenant_owner', 'tenant_admin', 'tenant_manager')
      AND ut.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.tenant_id = farmer_subscriptions.tenant_id
      AND ut.role IN ('tenant_owner', 'tenant_admin', 'tenant_manager')
      AND ut.is_active = true
    )
  );

-- Super admins can view/manage all farmer subscriptions
CREATE POLICY "farmer_subscriptions_super_admin_all"
  ON farmer_subscriptions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.role = 'super_admin'
    )
  );

-- ============================================
-- PHASE 1.5 COMPLETE
-- All subscription tables secured with RLS
-- ============================================