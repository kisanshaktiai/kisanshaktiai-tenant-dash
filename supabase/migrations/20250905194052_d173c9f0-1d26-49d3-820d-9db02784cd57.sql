-- Extend appearance_settings table with missing fields from tenant_branding and white_label_configs
-- This creates a unified theme configuration table for both tenant dashboard and SaaS admin portal

-- Add missing fields from tenant_branding
ALTER TABLE public.appearance_settings
ADD COLUMN IF NOT EXISTS app_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS app_icon TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS app_splash_screen TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS favicon_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS footer_text TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS footer_links JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}':jsonb,
ADD COLUMN IF NOT EXISTS header_config JSONB DEFAULT '{}':jsonb,
ADD COLUMN IF NOT EXISTS navigation_style TEXT DEFAULT 'sidebar',
ADD COLUMN IF NOT EXISTS show_powered_by BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS custom_fonts JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS button_style TEXT DEFAULT 'rounded',
ADD COLUMN IF NOT EXISTS input_style TEXT DEFAULT 'outlined',
ADD COLUMN IF NOT EXISTS card_style TEXT DEFAULT 'elevated',
ADD COLUMN IF NOT EXISTS animations_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS primary_gradient TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS secondary_gradient TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS success_color TEXT DEFAULT '#10b981',
ADD COLUMN IF NOT EXISTS warning_color TEXT DEFAULT '#f59e0b',
ADD COLUMN IF NOT EXISTS error_color TEXT DEFAULT '#ef4444',
ADD COLUMN IF NOT EXISTS info_color TEXT DEFAULT '#3b82f6';

-- Add missing fields from white_label_configs
ALTER TABLE public.appearance_settings
ADD COLUMN IF NOT EXISTS feature_toggles JSONB DEFAULT '{}':jsonb,
ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT '{}':jsonb,
ADD COLUMN IF NOT EXISTS advanced_settings JSONB DEFAULT '{}':jsonb,
ADD COLUMN IF NOT EXISTS mobile_config JSONB DEFAULT '{}':jsonb,
ADD COLUMN IF NOT EXISTS email_templates JSONB DEFAULT '{}':jsonb,
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{}':jsonb,
ADD COLUMN IF NOT EXISTS language_settings JSONB DEFAULT '{"default": "en", "supported": ["en"]}':jsonb,
ADD COLUMN IF NOT EXISTS seo_config JSONB DEFAULT '{}':jsonb,
ADD COLUMN IF NOT EXISTS analytics_config JSONB DEFAULT '{}':jsonb,
ADD COLUMN IF NOT EXISTS api_settings JSONB DEFAULT '{}':jsonb,
ADD COLUMN IF NOT EXISTS custom_scripts JSONB DEFAULT '{"head": "", "body": ""}':jsonb,
ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS maintenance_message TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS applied_by UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS preview_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'production';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_appearance_settings_tenant_active 
ON public.appearance_settings(tenant_id, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_appearance_settings_environment 
ON public.appearance_settings(tenant_id, environment);

-- Add comments for documentation
COMMENT ON COLUMN public.appearance_settings.app_name IS 'Custom application name for white-label';
COMMENT ON COLUMN public.appearance_settings.app_icon IS 'Application icon URL for mobile/PWA';
COMMENT ON COLUMN public.appearance_settings.app_splash_screen IS 'Splash screen image URL for mobile app';
COMMENT ON COLUMN public.appearance_settings.feature_toggles IS 'Feature flags for enabling/disabling specific features';
COMMENT ON COLUMN public.appearance_settings.layout_config IS 'Layout configuration including sidebar, header, footer settings';
COMMENT ON COLUMN public.appearance_settings.mobile_config IS 'Mobile-specific configuration and settings';
COMMENT ON COLUMN public.appearance_settings.email_templates IS 'Custom email template configurations';
COMMENT ON COLUMN public.appearance_settings.language_settings IS 'Language and localization settings';
COMMENT ON COLUMN public.appearance_settings.version IS 'Version number for tracking configuration changes';
COMMENT ON COLUMN public.appearance_settings.environment IS 'Environment (production, staging, development)';

-- Create a function to migrate data from old tables (if they exist)
CREATE OR REPLACE FUNCTION migrate_theme_data_to_appearance_settings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Migrate from tenant_branding if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenant_branding') THEN
    UPDATE public.appearance_settings AS a
    SET 
      app_name = COALESCE(a.app_name, b.app_name),
      logo_override_url = COALESCE(a.logo_override_url, b.logo_url),
      primary_color = COALESCE(a.primary_color, b.primary_color),
      secondary_color = COALESCE(a.secondary_color, b.secondary_color),
      footer_text = COALESCE(a.footer_text, b.footer_text),
      updated_at = now()
    FROM public.tenant_branding b
    WHERE a.tenant_id = b.tenant_id;
  END IF;

  -- Migrate from white_label_configs if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'white_label_configs') THEN
    UPDATE public.appearance_settings AS a
    SET 
      feature_toggles = COALESCE(a.feature_toggles, w.feature_config),
      layout_config = COALESCE(a.layout_config, w.layout_config),
      custom_css = COALESCE(a.custom_css, w.custom_styles),
      updated_at = now()
    FROM public.white_label_configs w
    WHERE a.tenant_id = w.tenant_id;
  END IF;
END;
$$;

-- Add RLS policies for SaaS admin portal access
CREATE POLICY "SaaS admins can view all appearance settings"
ON public.appearance_settings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'platform_admin')
    AND is_active = true
  )
);

CREATE POLICY "SaaS admins can manage all appearance settings"
ON public.appearance_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
    AND role = 'super_admin'
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
    AND role = 'super_admin'
    AND is_active = true
  )
);