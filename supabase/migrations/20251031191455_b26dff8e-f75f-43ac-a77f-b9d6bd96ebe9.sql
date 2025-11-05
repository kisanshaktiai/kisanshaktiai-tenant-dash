-- ============================================
-- PHASE 2: CREATE MISSING BILLING TABLES
-- (Skipping invoices - already exists)
-- ============================================

-- 1. INVOICE LINE ITEMS
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  
  -- Optional plan/addon reference
  plan_id UUID REFERENCES subscription_plans(id),
  addon_id UUID,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_line_items(invoice_id);

-- 2. PAYMENT METHODS
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  farmer_id UUID,  -- For farmer subscriptions
  
  type TEXT NOT NULL CHECK (type IN ('card', 'bank_account', 'upi', 'netbanking', 'wallet')),
  provider TEXT NOT NULL DEFAULT 'stripe',
  
  -- Stripe integration
  stripe_payment_method_id TEXT UNIQUE,
  
  -- Card details (last 4 digits, brand, expiry)
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  
  -- Bank account details (last 4 digits, bank name)
  bank_name TEXT,
  account_last4 TEXT,
  
  -- UPI details
  upi_id TEXT,
  
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_tenant ON payment_methods(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_farmer ON payment_methods(farmer_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe ON payment_methods(stripe_payment_method_id);

-- 3. PAYMENT TRANSACTIONS
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  farmer_id UUID,  -- For farmer subscriptions
  invoice_id UUID REFERENCES invoices(id),
  subscription_id UUID,  -- Can reference either tenant or farmer subscription
  
  type TEXT NOT NULL CHECK (type IN ('payment', 'refund', 'chargeback', 'credit')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled')),
  
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  
  -- Payment method used
  payment_method_id UUID REFERENCES payment_methods(id),
  
  -- Stripe integration
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  stripe_refund_id TEXT,
  
  -- Error handling
  failure_code TEXT,
  failure_message TEXT,
  
  -- Timestamps
  processed_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_tenant ON payment_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_farmer ON payment_transactions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice ON payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_pi ON payment_transactions(stripe_payment_intent_id);

-- 4. SUBSCRIPTION USAGE LOGS (for metered billing)
CREATE TABLE IF NOT EXISTS subscription_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES tenant_subscriptions(id),
  
  metric_name TEXT NOT NULL,  -- e.g., 'api_calls', 'storage_gb', 'farmers', 'sms_sent'
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,  -- e.g., 'calls', 'gb', 'users', 'messages'
  
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  billing_period_start TIMESTAMPTZ NOT NULL,
  billing_period_end TIMESTAMPTZ NOT NULL,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_tenant ON subscription_usage_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_subscription ON subscription_usage_logs(subscription_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_metric ON subscription_usage_logs(metric_name);
CREATE INDEX IF NOT EXISTS idx_usage_logs_date ON subscription_usage_logs(usage_date);

-- 5. SUBSCRIPTION ADDONS
CREATE TABLE IF NOT EXISTS subscription_addons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  addon_type TEXT NOT NULL CHECK (addon_type IN ('feature', 'capacity', 'support', 'integration')),
  plan_category TEXT NOT NULL CHECK (plan_category IN ('farmer', 'tenant')) DEFAULT 'tenant',
  
  -- Pricing
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_annually DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_metered BOOLEAN DEFAULT false,
  unit_price DECIMAL(10,4),  -- For metered addons
  
  -- Stripe integration
  stripe_product_id TEXT UNIQUE,
  stripe_price_id_monthly TEXT,
  stripe_price_id_annually TEXT,
  
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_addons_type ON subscription_addons(addon_type);
CREATE INDEX IF NOT EXISTS idx_subscription_addons_category ON subscription_addons(plan_category);
CREATE INDEX IF NOT EXISTS idx_subscription_addons_active ON subscription_addons(is_active);

-- 6. SUBSCRIPTION ADDON ASSIGNMENTS (many-to-many)
CREATE TABLE IF NOT EXISTS subscription_addon_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL,  -- Can be tenant or farmer subscription
  addon_id UUID NOT NULL REFERENCES subscription_addons(id) ON DELETE CASCADE,
  
  quantity INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  removed_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_addon_assignments_subscription ON subscription_addon_assignments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_addon_assignments_addon ON subscription_addon_assignments(addon_id);

-- 7. CREDIT NOTES (for refunds and credits)
CREATE TABLE IF NOT EXISTS credit_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id),
  
  credit_note_number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('refund', 'credit', 'adjustment')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'issued', 'applied', 'void')) DEFAULT 'draft',
  
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  
  reason TEXT,
  notes TEXT,
  
  -- Stripe integration
  stripe_credit_note_id TEXT UNIQUE,
  
  issued_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_notes_tenant ON credit_notes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_invoice ON credit_notes(invoice_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_status ON credit_notes(status);

-- 8. SUBSCRIPTION COUPONS
CREATE TABLE IF NOT EXISTS subscription_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  
  coupon_type TEXT NOT NULL CHECK (coupon_type IN ('percentage', 'fixed_amount', 'trial_extension')),
  
  -- Discount details
  discount_percentage DECIMAL(5,2),
  discount_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'INR',
  trial_days_extension INTEGER,
  
  -- Duration
  duration TEXT NOT NULL CHECK (duration IN ('once', 'forever', 'repeating')),
  duration_in_months INTEGER,
  
  -- Redemption limits
  max_redemptions INTEGER,
  times_redeemed INTEGER DEFAULT 0,
  
  -- Eligibility
  plan_category TEXT CHECK (plan_category IN ('farmer', 'tenant', 'both')) DEFAULT 'both',
  applicable_plan_ids UUID[],
  minimum_amount DECIMAL(10,2),
  
  -- Stripe integration
  stripe_coupon_id TEXT UNIQUE,
  
  -- Validity
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON subscription_coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON subscription_coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_from ON subscription_coupons(valid_from);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON subscription_coupons(valid_until);

-- 9. COUPON REDEMPTIONS
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES subscription_coupons(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  farmer_id UUID,
  subscription_id UUID,  -- Can reference either tenant or farmer subscription
  
  discount_applied DECIMAL(10,2) NOT NULL,
  invoice_id UUID REFERENCES invoices(id),
  
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon ON coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_tenant ON coupon_redemptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_farmer ON coupon_redemptions(farmer_id);

-- ============================================
-- ADD TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add triggers for all tables with updated_at
DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscription_addons_updated_at ON subscription_addons;
CREATE TRIGGER update_subscription_addons_updated_at
  BEFORE UPDATE ON subscription_addons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_credit_notes_updated_at ON credit_notes;
CREATE TRIGGER update_credit_notes_updated_at
  BEFORE UPDATE ON credit_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscription_coupons_updated_at ON subscription_coupons;
CREATE TRIGGER update_subscription_coupons_updated_at
  BEFORE UPDATE ON subscription_coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ADD HELPER FUNCTIONS
-- ============================================

-- Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  year_month TEXT;
BEGIN
  year_month := TO_CHAR(now(), 'YYYYMM');
  new_number := 'INV-' || year_month || '-' || LPAD(
    (
      SELECT COALESCE(MAX(CAST(SPLIT_PART(invoice_number, '-', 3) AS INTEGER)), 0) + 1
      FROM invoices
      WHERE invoice_number LIKE 'INV-' || year_month || '-%'
    )::TEXT,
    5,
    '0'
  );
  RETURN new_number;
END;
$$;

-- Generate credit note number
CREATE OR REPLACE FUNCTION generate_credit_note_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  year_month TEXT;
BEGIN
  year_month := TO_CHAR(now(), 'YYYYMM');
  new_number := 'CN-' || year_month || '-' || LPAD(
    (
      SELECT COALESCE(MAX(CAST(SPLIT_PART(credit_note_number, '-', 3) AS INTEGER)), 0) + 1
      FROM credit_notes
      WHERE credit_note_number LIKE 'CN-' || year_month || '-%'
    )::TEXT,
    5,
    '0'
  );
  RETURN new_number;
END;
$$;

-- ============================================
-- PHASE 2 COMPLETE
-- All critical billing tables created:
-- ✅ Invoice line items
-- ✅ Payment methods
-- ✅ Payment transactions
-- ✅ Usage logs (metered billing)
-- ✅ Subscription addons
-- ✅ Credit notes
-- ✅ Coupons & redemptions
-- ✅ Helper functions
-- ✅ Triggers
-- ============================================