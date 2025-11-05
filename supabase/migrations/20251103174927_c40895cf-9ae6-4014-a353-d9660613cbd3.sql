-- Phase 1: Database Enhancement & Cleanup (Final Fix)

-- 1.1 Add plan category and tenant customization fields to subscription_plans
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS plan_category TEXT DEFAULT 'farmer' CHECK (plan_category IN ('tenant', 'farmer')),
ADD COLUMN IF NOT EXISTS created_by_tenant_id UUID REFERENCES tenants(id),
ADD COLUMN IF NOT EXISTS is_custom_plan BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_plan_id UUID REFERENCES subscription_plans(id);

-- 1.2 Add trial days to subscription tables
ALTER TABLE tenant_subscriptions 
ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 14;

ALTER TABLE farmer_subscriptions 
ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 7;

-- 1.3 Create tenant custom pricing table
CREATE TABLE IF NOT EXISTS tenant_farmer_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  base_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  custom_price_monthly NUMERIC(10,2),
  custom_price_quarterly NUMERIC(10,2),
  custom_price_annually NUMERIC(10,2),
  custom_features JSONB DEFAULT '{}',
  custom_limits JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1.4 Create payment intents table for tracking payment flow
CREATE TABLE IF NOT EXISTS payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  farmer_id UUID REFERENCES farmers(id),
  user_id UUID REFERENCES auth.users(id),
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('tenant', 'farmer')),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled')),
  payment_method TEXT CHECK (payment_method IN ('card', 'upi', 'netbanking', 'wallet')),
  dummy_payment_data JSONB DEFAULT '{}',
  transaction_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '15 minutes')
);

-- Enable RLS on new tables
ALTER TABLE tenant_farmer_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenant_farmer_pricing
CREATE POLICY "Tenants can view their own farmer pricing"
  ON tenant_farmer_pricing FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
  ));

CREATE POLICY "Tenants can create their own farmer pricing"
  ON tenant_farmer_pricing FOR INSERT
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() 
    AND role IN ('tenant_owner', 'tenant_admin', 'tenant_manager')
  ));

CREATE POLICY "Tenants can update their own farmer pricing"
  ON tenant_farmer_pricing FOR UPDATE
  USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() 
    AND role IN ('tenant_owner', 'tenant_admin', 'tenant_manager')
  ));

CREATE POLICY "Tenants can delete their own farmer pricing"
  ON tenant_farmer_pricing FOR DELETE
  USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() 
    AND role IN ('tenant_owner', 'tenant_admin', 'tenant_manager')
  ));

-- RLS Policies for payment_intents
CREATE POLICY "Users can view their own payment intents"
  ON payment_intents FOR SELECT
  USING (
    (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()))
    OR
    (user_id = auth.uid())
  );

CREATE POLICY "Users can create payment intents"
  ON payment_intents FOR INSERT
  WITH CHECK (
    (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()))
    OR
    (user_id = auth.uid())
  );

CREATE POLICY "Users can update their own payment intents"
  ON payment_intents FOR UPDATE
  USING (
    (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()))
    OR
    (user_id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_farmer_pricing_tenant ON tenant_farmer_pricing(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_farmer_pricing_base_plan ON tenant_farmer_pricing(base_plan_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_tenant ON payment_intents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_farmer ON payment_intents(farmer_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_user ON payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_category ON subscription_plans(plan_category);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_tenant_farmer_pricing_updated_at
  BEFORE UPDATE ON tenant_farmer_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_intents_updated_at
  BEFORE UPDATE ON payment_intents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();