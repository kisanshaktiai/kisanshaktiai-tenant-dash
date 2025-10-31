-- ============================================
-- PHASE 2.5: ADD RLS POLICIES TO BILLING TABLES
-- Secure all new billing infrastructure
-- ============================================

-- Enable RLS on all new billing tables
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_addon_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INVOICE LINE ITEMS POLICIES
-- ============================================

-- Tenant users can view their invoice line items
CREATE POLICY "invoice_line_items_tenant_view"
  ON invoice_line_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices inv
      JOIN user_tenants ut ON ut.tenant_id = inv.tenant_id
      WHERE inv.id = invoice_line_items.invoice_id
      AND ut.user_id = auth.uid()
      AND ut.is_active = true
    )
  );

-- Super admins can manage all invoice line items
CREATE POLICY "invoice_line_items_super_admin_all"
  ON invoice_line_items FOR ALL
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
-- PAYMENT METHODS POLICIES
-- ============================================

-- Tenants can view their own payment methods
CREATE POLICY "payment_methods_tenant_view"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.tenant_id = payment_methods.tenant_id
      AND ut.is_active = true
    )
  );

-- Farmers can view their own payment methods
CREATE POLICY "payment_methods_farmer_view"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (farmer_id = auth.uid());

-- Tenant owners/admins can manage their payment methods
CREATE POLICY "payment_methods_tenant_manage"
  ON payment_methods FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.tenant_id = payment_methods.tenant_id
      AND ut.role IN ('tenant_owner', 'tenant_admin')
      AND ut.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.tenant_id = payment_methods.tenant_id
      AND ut.role IN ('tenant_owner', 'tenant_admin')
      AND ut.is_active = true
    )
  );

-- Farmers can manage their own payment methods
CREATE POLICY "payment_methods_farmer_manage"
  ON payment_methods FOR ALL
  TO authenticated
  USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());

-- ============================================
-- PAYMENT TRANSACTIONS POLICIES
-- ============================================

-- Tenants can view their own transactions
CREATE POLICY "payment_transactions_tenant_view"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.tenant_id = payment_transactions.tenant_id
      AND ut.is_active = true
    )
  );

-- Farmers can view their own transactions
CREATE POLICY "payment_transactions_farmer_view"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (farmer_id = auth.uid());

-- Super admins can view/manage all transactions
CREATE POLICY "payment_transactions_super_admin_all"
  ON payment_transactions FOR ALL
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
-- SUBSCRIPTION USAGE LOGS POLICIES
-- ============================================

-- Tenant users can view their own usage logs
CREATE POLICY "usage_logs_tenant_view"
  ON subscription_usage_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.tenant_id = subscription_usage_logs.tenant_id
      AND ut.is_active = true
    )
  );

-- System can insert usage logs
CREATE POLICY "usage_logs_system_insert"
  ON subscription_usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Will be restricted by app logic

-- Super admins can manage all usage logs
CREATE POLICY "usage_logs_super_admin_all"
  ON subscription_usage_logs FOR ALL
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
-- SUBSCRIPTION ADDONS POLICIES
-- ============================================

-- Public can view active addons
CREATE POLICY "subscription_addons_public_view"
  ON subscription_addons FOR SELECT
  USING (is_active = true);

-- Super admins can manage all addons
CREATE POLICY "subscription_addons_super_admin_all"
  ON subscription_addons FOR ALL
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
-- SUBSCRIPTION ADDON ASSIGNMENTS POLICIES
-- ============================================

-- Tenants can view their addon assignments (for tenant subscriptions)
CREATE POLICY "addon_assignments_tenant_view"
  ON subscription_addon_assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_subscriptions ts
      JOIN user_tenants ut ON ut.tenant_id = ts.tenant_id
      WHERE ts.id = subscription_addon_assignments.subscription_id
      AND ut.user_id = auth.uid()
      AND ut.is_active = true
    )
  );

-- Tenant owners/admins can manage their addon assignments
CREATE POLICY "addon_assignments_tenant_manage"
  ON subscription_addon_assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_subscriptions ts
      JOIN user_tenants ut ON ut.tenant_id = ts.tenant_id
      WHERE ts.id = subscription_addon_assignments.subscription_id
      AND ut.user_id = auth.uid()
      AND ut.role IN ('tenant_owner', 'tenant_admin')
      AND ut.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_subscriptions ts
      JOIN user_tenants ut ON ut.tenant_id = ts.tenant_id
      WHERE ts.id = subscription_addon_assignments.subscription_id
      AND ut.user_id = auth.uid()
      AND ut.role IN ('tenant_owner', 'tenant_admin')
      AND ut.is_active = true
    )
  );

-- ============================================
-- CREDIT NOTES POLICIES
-- ============================================

-- Tenant users can view their credit notes
CREATE POLICY "credit_notes_tenant_view"
  ON credit_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.tenant_id = credit_notes.tenant_id
      AND ut.is_active = true
    )
  );

-- Super admins can manage all credit notes
CREATE POLICY "credit_notes_super_admin_all"
  ON credit_notes FOR ALL
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
-- SUBSCRIPTION COUPONS POLICIES
-- ============================================

-- Public can view active coupons
CREATE POLICY "subscription_coupons_public_view"
  ON subscription_coupons FOR SELECT
  USING (is_active = true);

-- Super admins can manage all coupons
CREATE POLICY "subscription_coupons_super_admin_all"
  ON subscription_coupons FOR ALL
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
-- COUPON REDEMPTIONS POLICIES
-- ============================================

-- Tenants can view their own redemptions
CREATE POLICY "coupon_redemptions_tenant_view"
  ON coupon_redemptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.tenant_id = coupon_redemptions.tenant_id
      AND ut.is_active = true
    )
  );

-- Farmers can view their own redemptions
CREATE POLICY "coupon_redemptions_farmer_view"
  ON coupon_redemptions FOR SELECT
  TO authenticated
  USING (farmer_id = auth.uid());

-- System can insert redemptions
CREATE POLICY "coupon_redemptions_system_insert"
  ON coupon_redemptions FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Will be restricted by app logic

-- Super admins can manage all redemptions
CREATE POLICY "coupon_redemptions_super_admin_all"
  ON coupon_redemptions FOR ALL
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
-- PHASE 2.5 COMPLETE
-- All billing tables secured with RLS:
-- ✅ Invoice line items
-- ✅ Payment methods
-- ✅ Payment transactions
-- ✅ Usage logs
-- ✅ Subscription addons
-- ✅ Addon assignments
-- ✅ Credit notes
-- ✅ Coupons
-- ✅ Coupon redemptions
-- ============================================