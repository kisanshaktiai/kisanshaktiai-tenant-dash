-- ============================================
-- PHASE 1: ENHANCE EXISTING TABLES
-- Adds Stripe integration & billing fields
-- NO TABLES DROPPED - 100% Safe Migration
-- ============================================

-- 1. ENHANCE subscription_plans
ALTER TABLE subscription_plans 
  ADD COLUMN IF NOT EXISTS stripe_product_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_price_id_monthly TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id_annually TEXT,
  ADD COLUMN IF NOT EXISTS plan_category TEXT DEFAULT 'farmer' CHECK (plan_category IN ('farmer', 'tenant')),
  ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'annually', 'both')),
  ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_stripe_product ON subscription_plans(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_category ON subscription_plans(plan_category);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);

-- Add comments for documentation
COMMENT ON COLUMN subscription_plans.stripe_product_id IS 'Stripe product ID for payment processing';
COMMENT ON COLUMN subscription_plans.plan_category IS 'Type of plan: farmer (B2C) or tenant (B2B)';
COMMENT ON COLUMN subscription_plans.trial_days IS 'Number of free trial days';

-- 2. ENHANCE tenant_subscriptions
ALTER TABLE tenant_subscriptions
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_payment_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS payment_method_id TEXT,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancellation_feedback TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_stripe_sub ON tenant_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_stripe_customer ON tenant_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_status ON tenant_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_next_billing ON tenant_subscriptions(next_billing_date);

-- Add comments
COMMENT ON COLUMN tenant_subscriptions.stripe_subscription_id IS 'Stripe subscription ID for payment tracking';
COMMENT ON COLUMN tenant_subscriptions.grace_period_ends_at IS 'Date when grace period ends after payment failure';
COMMENT ON COLUMN tenant_subscriptions.metadata IS 'Additional subscription metadata as JSON';

-- 3. ENHANCE farmer_subscriptions
ALTER TABLE farmer_subscriptions
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS paid_by_tenant BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS paying_tenant_id UUID REFERENCES tenants(id),
  ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_payment_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS payment_method_id TEXT,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_farmer_subscriptions_stripe_sub ON farmer_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_farmer_subscriptions_stripe_customer ON farmer_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_subscriptions_farmer ON farmer_subscriptions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_subscriptions_tenant ON farmer_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_farmer_subscriptions_paying_tenant ON farmer_subscriptions(paying_tenant_id);
CREATE INDEX IF NOT EXISTS idx_farmer_subscriptions_status ON farmer_subscriptions(status);

-- Add comments
COMMENT ON COLUMN farmer_subscriptions.paid_by_tenant IS 'True if tenant pays for farmer subscription (B2B2C model)';
COMMENT ON COLUMN farmer_subscriptions.paying_tenant_id IS 'Tenant ID that pays for this farmer subscription';

-- 4. ENHANCE tenants table with Stripe customer ID
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS billing_email TEXT,
  ADD COLUMN IF NOT EXISTS billing_address JSONB,
  ADD COLUMN IF NOT EXISTS tax_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT 'immediate';

-- Add index
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_customer ON tenants(stripe_customer_id);

-- Add comment
COMMENT ON COLUMN tenants.stripe_customer_id IS 'Stripe customer ID for tenant billing';
COMMENT ON COLUMN tenants.billing_email IS 'Email for invoices and billing notifications';

-- 5. Create function to sync subscription status
CREATE OR REPLACE FUNCTION sync_subscription_expiry()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for tenant_subscriptions
DROP TRIGGER IF EXISTS trigger_sync_tenant_subscription_status ON tenant_subscriptions;
CREATE TRIGGER trigger_sync_tenant_subscription_status
  AFTER UPDATE OF status ON tenant_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_subscription_expiry();

-- ============================================
-- PHASE 1 COMPLETE
-- All existing tables enhanced with:
-- ✅ Stripe integration fields
-- ✅ Billing cycle tracking
-- ✅ Payment tracking
-- ✅ Grace period support
-- ✅ Auto-renewal settings
-- ✅ Performance indexes
-- ✅ Status sync triggers
-- ============================================