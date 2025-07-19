
-- First, let's create the missing tables and their relationships

-- Create subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  price_monthly NUMERIC DEFAULT 0,
  price_annually NUMERIC DEFAULT 0,
  max_farmers INTEGER DEFAULT 1000,
  max_dealers INTEGER DEFAULT 50,
  max_products INTEGER DEFAULT 100,
  max_storage_gb INTEGER DEFAULT 10,
  max_api_calls_per_day INTEGER DEFAULT 10000,
  features JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tenant_features table
CREATE TABLE IF NOT EXISTS public.tenant_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  basic_analytics BOOLEAN DEFAULT true,
  advanced_analytics BOOLEAN DEFAULT false,
  ai_chat BOOLEAN DEFAULT true,
  weather_forecast BOOLEAN DEFAULT true,
  marketplace BOOLEAN DEFAULT false,
  community_forum BOOLEAN DEFAULT false,
  soil_testing BOOLEAN DEFAULT false,
  satellite_imagery BOOLEAN DEFAULT false,
  drone_monitoring BOOLEAN DEFAULT false,
  iot_integration BOOLEAN DEFAULT false,
  predictive_analytics BOOLEAN DEFAULT false,
  custom_reports BOOLEAN DEFAULT false,
  api_access BOOLEAN DEFAULT false,
  webhook_support BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Create tenant_branding table
CREATE TABLE IF NOT EXISTS public.tenant_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  app_name VARCHAR DEFAULT 'KisanShakti AI',
  logo_url TEXT,
  primary_color VARCHAR DEFAULT '#10b981',
  secondary_color VARCHAR DEFAULT '#059669',
  accent_color VARCHAR DEFAULT '#34d399',
  background_color VARCHAR DEFAULT '#ffffff',
  text_color VARCHAR DEFAULT '#111827',
  font_family VARCHAR DEFAULT 'Inter',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Create tenant_subscriptions table
CREATE TABLE IF NOT EXISTS public.tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR DEFAULT 'trial',
  billing_interval VARCHAR DEFAULT 'monthly',
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price_monthly, price_annually, max_farmers, max_dealers, max_products, max_storage_gb, max_api_calls_per_day, features)
VALUES 
  ('Kisan', 'Basic plan for small farms', 0, 0, 1000, 50, 100, 10, 10000, '{"ai_chat": true, "weather_forecast": true, "basic_analytics": true}'::jsonb),
  ('Shakti', 'Advanced plan for growing operations', 99, 999, 5000, 200, 500, 50, 50000, '{"ai_chat": true, "weather_forecast": true, "basic_analytics": true, "advanced_analytics": true, "marketplace": true}'::jsonb),
  ('AI', 'Premium plan with full AI features', 299, 2999, 20000, 1000, 2000, 200, 200000, '{"ai_chat": true, "weather_forecast": true, "basic_analytics": true, "advanced_analytics": true, "marketplace": true, "predictive_analytics": true, "custom_reports": true, "api_access": true}'::jsonb)
ON CONFLICT DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.tenant_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Tenant users can view their tenant features" ON tenant_features
  FOR SELECT USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

CREATE POLICY "Tenant admins can manage their tenant features" ON tenant_features
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() 
    AND user_tenants.is_active = true 
    AND user_tenants.role IN ('admin', 'tenant_owner', 'tenant_admin')
  ));

CREATE POLICY "Tenant users can view their tenant branding" ON tenant_branding
  FOR SELECT USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

CREATE POLICY "Tenant admins can manage their tenant branding" ON tenant_branding
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() 
    AND user_tenants.is_active = true 
    AND user_tenants.role IN ('admin', 'tenant_owner', 'tenant_admin')
  ));

CREATE POLICY "Tenant users can view their subscriptions" ON tenant_subscriptions
  FOR SELECT USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

CREATE POLICY "Tenant admins can manage their subscriptions" ON tenant_subscriptions
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() 
    AND user_tenants.is_active = true 
    AND user_tenants.role IN ('admin', 'tenant_owner', 'tenant_admin')
  ));

CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_features_tenant_id ON tenant_features(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_branding_tenant_id ON tenant_branding(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_tenant_id ON tenant_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);

-- Create triggers for updated_at
CREATE TRIGGER update_tenant_features_updated_at
  BEFORE UPDATE ON tenant_features
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_branding_updated_at
  BEFORE UPDATE ON tenant_branding
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_subscriptions_updated_at
  BEFORE UPDATE ON tenant_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update the create_tenant_with_validation function to auto-provision related tables
CREATE OR REPLACE FUNCTION public.create_tenant_with_validation(
  p_name text, 
  p_slug text, 
  p_type text, 
  p_status text DEFAULT 'pending'::text, 
  p_subscription_plan text DEFAULT 'kisan'::text, 
  p_owner_name text DEFAULT NULL::text, 
  p_owner_email text DEFAULT NULL::text, 
  p_owner_phone text DEFAULT NULL::text, 
  p_business_registration text DEFAULT NULL::text, 
  p_business_address jsonb DEFAULT NULL::jsonb, 
  p_established_date text DEFAULT NULL::text, 
  p_subscription_start_date text DEFAULT NULL::text, 
  p_subscription_end_date text DEFAULT NULL::text, 
  p_trial_ends_at text DEFAULT NULL::text, 
  p_max_farmers integer DEFAULT NULL::integer, 
  p_max_dealers integer DEFAULT NULL::integer, 
  p_max_products integer DEFAULT NULL::integer, 
  p_max_storage_gb integer DEFAULT NULL::integer, 
  p_max_api_calls_per_day integer DEFAULT NULL::integer, 
  p_subdomain text DEFAULT NULL::text, 
  p_custom_domain text DEFAULT NULL::text, 
  p_metadata jsonb DEFAULT '{}'::jsonb
) 
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tenant_id UUID;
  v_result JSONB;
  v_plan_limits JSONB;
  v_plan_id UUID;
  v_trial_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Validate required fields
  IF p_name IS NULL OR trim(p_name) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Tenant name is required'
    );
  END IF;
  
  IF p_slug IS NULL OR trim(p_slug) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Tenant slug is required'
    );
  END IF;
  
  -- Validate slug format (alphanumeric and hyphens only)
  IF p_slug !~ '^[a-z0-9-]+$' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Slug must contain only lowercase letters, numbers, and hyphens'
    );
  END IF;
  
  -- Check if slug already exists
  IF EXISTS (SELECT 1 FROM tenants WHERE slug = p_slug) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Tenant slug already exists'
    );
  END IF;
  
  -- Validate email format if provided
  IF p_owner_email IS NOT NULL AND p_owner_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid email format'
    );
  END IF;
  
  -- Validate subscription plan
  IF p_subscription_plan NOT IN ('kisan', 'shakti', 'ai') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid subscription plan'
    );
  END IF;
  
  -- Get plan details and set limits
  SELECT id INTO v_plan_id FROM subscription_plans WHERE LOWER(name) = LOWER(p_subscription_plan) AND is_active = true LIMIT 1;
  
  -- Set default limits based on subscription plan
  CASE LOWER(p_subscription_plan)
    WHEN 'kisan' THEN
      v_plan_limits := jsonb_build_object(
        'farmers', 1000,
        'dealers', 50,
        'products', 100,
        'storage', 10,
        'api_calls', 10000
      );
    WHEN 'shakti' THEN
      v_plan_limits := jsonb_build_object(
        'farmers', 5000,
        'dealers', 200,
        'products', 500,
        'storage', 50,
        'api_calls', 50000
      );
    WHEN 'ai' THEN
      v_plan_limits := jsonb_build_object(
        'farmers', 20000,
        'dealers', 1000,
        'products', 2000,
        'storage', 200,
        'api_calls', 200000
      );
  END CASE;
  
  -- Use provided limits or defaults
  p_max_farmers := COALESCE(p_max_farmers, (v_plan_limits->>'farmers')::INTEGER);
  p_max_dealers := COALESCE(p_max_dealers, (v_plan_limits->>'dealers')::INTEGER);
  p_max_products := COALESCE(p_max_products, (v_plan_limits->>'products')::INTEGER);
  p_max_storage_gb := COALESCE(p_max_storage_gb, (v_plan_limits->>'storage')::INTEGER);
  p_max_api_calls_per_day := COALESCE(p_max_api_calls_per_day, (v_plan_limits->>'api_calls')::INTEGER);
  
  -- Set default trial end date if not provided
  IF p_trial_ends_at IS NULL THEN
    v_trial_end := (now() + interval '14 days');
  ELSE
    v_trial_end := p_trial_ends_at::TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Insert tenant
  INSERT INTO tenants (
    name,
    slug,
    type,
    status,
    subscription_plan,
    owner_name,
    owner_email,
    owner_phone,
    business_registration,
    business_address,
    established_date,
    subscription_start_date,
    subscription_end_date,
    trial_ends_at,
    max_farmers,
    max_dealers,
    max_products,
    max_storage_gb,
    max_api_calls_per_day,
    subdomain,
    custom_domain,
    metadata,
    created_at,
    updated_at
  ) VALUES (
    p_name,
    p_slug,
    p_type::TEXT,
    p_status::TEXT,
    p_subscription_plan::TEXT,
    p_owner_name,
    p_owner_email,
    p_owner_phone,
    p_business_registration,
    p_business_address,
    CASE WHEN p_established_date IS NOT NULL THEN p_established_date::DATE ELSE NULL END,
    CASE WHEN p_subscription_start_date IS NOT NULL THEN p_subscription_start_date::TIMESTAMP WITH TIME ZONE ELSE now() END,
    CASE WHEN p_subscription_end_date IS NOT NULL THEN p_subscription_end_date::TIMESTAMP WITH TIME ZONE ELSE NULL END,
    v_trial_end,
    p_max_farmers,
    p_max_dealers,
    p_max_products,
    p_max_storage_gb,
    p_max_api_calls_per_day,
    p_subdomain,
    p_custom_domain,
    p_metadata,
    now(),
    now()
  ) RETURNING id INTO v_tenant_id;
  
  -- Auto-insert tenant_features with defaults
  INSERT INTO tenant_features (
    tenant_id,
    basic_analytics,
    advanced_analytics,
    ai_chat,
    weather_forecast,
    marketplace,
    community_forum,
    soil_testing,
    satellite_imagery,
    drone_monitoring,
    iot_integration,
    predictive_analytics,
    custom_reports,
    api_access,
    webhook_support
  ) VALUES (
    v_tenant_id,
    true,  -- basic_analytics
    CASE WHEN LOWER(p_subscription_plan) IN ('shakti', 'ai') THEN true ELSE false END,  -- advanced_analytics
    true,  -- ai_chat
    true,  -- weather_forecast
    CASE WHEN LOWER(p_subscription_plan) IN ('shakti', 'ai') THEN true ELSE false END,  -- marketplace
    false, -- community_forum
    false, -- soil_testing
    false, -- satellite_imagery
    false, -- drone_monitoring
    false, -- iot_integration
    CASE WHEN LOWER(p_subscription_plan) = 'ai' THEN true ELSE false END,  -- predictive_analytics
    CASE WHEN LOWER(p_subscription_plan) = 'ai' THEN true ELSE false END,  -- custom_reports
    CASE WHEN LOWER(p_subscription_plan) = 'ai' THEN true ELSE false END,  -- api_access
    CASE WHEN LOWER(p_subscription_plan) = 'ai' THEN true ELSE false END   -- webhook_support
  );
  
  -- Auto-insert tenant_branding with defaults
  INSERT INTO tenant_branding (
    tenant_id,
    app_name,
    primary_color,
    secondary_color,
    accent_color,
    background_color,
    text_color,
    font_family
  ) VALUES (
    v_tenant_id,
    'KisanShakti AI',
    '#10b981',
    '#059669',
    '#34d399',
    '#ffffff',
    '#111827',
    'Inter'
  );
  
  -- Auto-insert tenant_subscriptions
  INSERT INTO tenant_subscriptions (
    tenant_id,
    plan_id,
    status,
    billing_interval,
    current_period_start,
    current_period_end,
    trial_end
  ) VALUES (
    v_tenant_id,
    v_plan_id,
    'trial',
    'monthly',
    now(),
    v_trial_end,
    v_trial_end
  );
  
  -- Return success response
  RETURN jsonb_build_object(
    'success', true,
    'tenant_id', v_tenant_id,
    'message', 'Tenant created successfully with auto-provisioned features, branding, and subscription'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
