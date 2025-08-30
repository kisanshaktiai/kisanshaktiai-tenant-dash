
-- Organization settings extension (additional metadata)
CREATE TABLE IF NOT EXISTS public.organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  business_hours JSONB DEFAULT '{"monday": {"open": "09:00", "close": "17:00", "closed": false}}',
  contact_info JSONB DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  compliance_settings JSONB DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Security settings and policies
CREATE TABLE IF NOT EXISTS public.security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  password_policy JSONB DEFAULT '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_numbers": true, "require_symbols": false}',
  session_settings JSONB DEFAULT '{"timeout_minutes": 480, "remember_me_days": 30}',
  mfa_settings JSONB DEFAULT '{"enabled": false, "required_for_admins": false, "backup_codes": 10}',
  ip_whitelist JSONB DEFAULT '[]',
  login_restrictions JSONB DEFAULT '{"max_attempts": 5, "lockout_minutes": 15}',
  audit_settings JSONB DEFAULT '{"log_all_actions": true, "retention_days": 90}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Notification preferences per user
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email_notifications JSONB DEFAULT '{"system": true, "marketing": false, "security": true, "campaigns": true}',
  push_notifications JSONB DEFAULT '{"enabled": true, "sound": true, "badge": true}',
  sms_notifications JSONB DEFAULT '{"enabled": false, "security_alerts": false}',
  in_app_notifications JSONB DEFAULT '{"enabled": true, "popup": true, "sound": true}',
  notification_schedule JSONB DEFAULT '{"quiet_hours": {"enabled": false, "start": "22:00", "end": "08:00"}}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);

-- Data retention and privacy settings
CREATE TABLE IF NOT EXISTS public.data_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  data_retention_policy JSONB DEFAULT '{"user_data_days": 2555, "audit_logs_days": 2555, "analytics_days": 1095}',
  anonymization_settings JSONB DEFAULT '{"auto_anonymize": false, "anonymize_after_days": 365}',
  gdpr_settings JSONB DEFAULT '{"enabled": true, "consent_required": true, "data_portability": true}',
  backup_settings JSONB DEFAULT '{"enabled": true, "frequency": "daily", "retention_days": 30}',
  encryption_settings JSONB DEFAULT '{"at_rest": true, "in_transit": true, "key_rotation_days": 90}',
  third_party_sharing JSONB DEFAULT '{"analytics": false, "marketing": false, "required_only": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Localization settings
CREATE TABLE IF NOT EXISTS public.localization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  default_language VARCHAR(10) DEFAULT 'en',
  supported_languages JSONB DEFAULT '["en"]',
  timezone VARCHAR(50) DEFAULT 'UTC',
  date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
  time_format VARCHAR(10) DEFAULT '24h',
  currency VARCHAR(3) DEFAULT 'USD',
  number_format JSONB DEFAULT '{"decimal_separator": ".", "thousand_separator": ",", "decimal_places": 2}',
  regional_settings JSONB DEFAULT '{"country": "US", "region": "Americas"}',
  custom_translations JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Subscription management details (extending existing structure)
CREATE TABLE IF NOT EXISTS public.subscription_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  billing_contact JSONB DEFAULT '{}',
  payment_methods JSONB DEFAULT '[]',
  billing_history JSONB DEFAULT '[]',
  usage_quotas JSONB DEFAULT '{}',
  feature_limits JSONB DEFAULT '{}',
  auto_billing BOOLEAN DEFAULT true,
  billing_alerts JSONB DEFAULT '{"usage_threshold": 80, "overage_alerts": true}',
  cancellation_settings JSONB DEFAULT '{"immediate": false, "end_of_period": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.localization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Organization Settings
CREATE POLICY "Tenant admins can manage organization settings" ON public.organization_settings
FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM public.user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true 
    AND role IN ('tenant_owner', 'tenant_admin')
  )
);

-- RLS Policies for Security Settings
CREATE POLICY "Tenant owners can manage security settings" ON public.security_settings
FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM public.user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true 
    AND role = 'tenant_owner'
  )
);

-- RLS Policies for Notification Preferences
CREATE POLICY "Users can manage their own notification preferences" ON public.notification_preferences
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Tenant admins can view notification preferences" ON public.notification_preferences
FOR SELECT USING (
  tenant_id IN (
    SELECT tenant_id FROM public.user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true 
    AND role IN ('tenant_owner', 'tenant_admin')
  )
);

-- RLS Policies for Data Privacy Settings
CREATE POLICY "Tenant owners can manage data privacy settings" ON public.data_privacy_settings
FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM public.user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true 
    AND role = 'tenant_owner'
  )
);

-- RLS Policies for Localization Settings
CREATE POLICY "Tenant admins can manage localization settings" ON public.localization_settings
FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM public.user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true 
    AND role IN ('tenant_owner', 'tenant_admin')
  )
);

-- RLS Policies for Subscription Settings
CREATE POLICY "Tenant owners can manage subscription settings" ON public.subscription_settings
FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM public.user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true 
    AND role = 'tenant_owner'
  )
);

-- Super admin access to all settings tables
CREATE POLICY "Super admins can access all organization settings" ON public.organization_settings
FOR ALL USING (is_authenticated_admin());

CREATE POLICY "Super admins can access all security settings" ON public.security_settings
FOR ALL USING (is_authenticated_admin());

CREATE POLICY "Super admins can access all data privacy settings" ON public.data_privacy_settings
FOR ALL USING (is_authenticated_admin());

CREATE POLICY "Super admins can access all localization settings" ON public.localization_settings
FOR ALL USING (is_authenticated_admin());

CREATE POLICY "Super admins can access all subscription settings" ON public.subscription_settings
FOR ALL USING (is_authenticated_admin());

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organization_settings_updated_at
  BEFORE UPDATE ON public.organization_settings
  FOR EACH ROW EXECUTE FUNCTION update_settings_updated_at();

CREATE TRIGGER update_security_settings_updated_at
  BEFORE UPDATE ON public.security_settings
  FOR EACH ROW EXECUTE FUNCTION update_settings_updated_at();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_settings_updated_at();

CREATE TRIGGER update_data_privacy_settings_updated_at
  BEFORE UPDATE ON public.data_privacy_settings
  FOR EACH ROW EXECUTE FUNCTION update_settings_updated_at();

CREATE TRIGGER update_localization_settings_updated_at
  BEFORE UPDATE ON public.localization_settings
  FOR EACH ROW EXECUTE FUNCTION update_settings_updated_at();

CREATE TRIGGER update_subscription_settings_updated_at
  BEFORE UPDATE ON public.subscription_settings
  FOR EACH ROW EXECUTE FUNCTION update_settings_updated_at();
