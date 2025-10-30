-- Create white_label_configs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.white_label_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Brand Identity for Mobile App
  app_name TEXT,
  app_logo_url TEXT,
  app_icon_url TEXT,
  app_splash_screen_url TEXT,
  
  -- Color Theme (shared with web app)
  primary_color TEXT DEFAULT '#10b981',
  secondary_color TEXT DEFAULT '#059669',
  accent_color TEXT DEFAULT '#14b8a6',
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#1f2937',
  
  -- Additional mobile specific colors
  success_color TEXT DEFAULT '#10b981',
  warning_color TEXT DEFAULT '#f59e0b',
  error_color TEXT DEFAULT '#ef4444',
  info_color TEXT DEFAULT '#3b82f6',
  
  -- Mobile App Specific Settings
  bundle_identifier TEXT,
  android_package_name TEXT,
  ios_app_id TEXT,
  
  -- App Store Configuration
  app_store_config JSONB DEFAULT '{}'::jsonb,
  play_store_config JSONB DEFAULT '{}'::jsonb,
  
  -- PWA Configuration
  pwa_config JSONB DEFAULT '{}'::jsonb,
  
  -- Feature Toggles for Mobile
  mobile_features JSONB DEFAULT '{}'::jsonb,
  
  -- Push Notification Settings
  notification_config JSONB DEFAULT '{}'::jsonb,
  
  -- Deep Linking Configuration
  deep_link_config JSONB DEFAULT '{}'::jsonb,
  
  -- Mobile specific UI settings
  mobile_ui_config JSONB DEFAULT '{
    "navigation_style": "tab_bar",
    "animations_enabled": true,
    "button_style": "rounded",
    "input_style": "outlined",
    "card_style": "elevated"
  }'::jsonb,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT unique_tenant_white_label UNIQUE(tenant_id)
);

-- Enable RLS
ALTER TABLE public.white_label_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Tenant admins can manage white label configs" 
ON public.white_label_configs 
FOR ALL 
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true 
    AND role IN ('tenant_owner', 'tenant_admin')
  )
);

CREATE POLICY "Tenant users can view white label configs" 
ON public.white_label_configs 
FOR SELECT 
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_white_label_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.version = COALESCE(OLD.version, 0) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_white_label_configs_updated_at
BEFORE UPDATE ON public.white_label_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_white_label_configs_updated_at();

-- Add columns to appearance_settings if they don't exist
DO $$ 
BEGIN
  -- Add web_only flag to indicate settings apply to web only
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'appearance_settings' 
                AND column_name = 'applies_to') THEN
    ALTER TABLE public.appearance_settings 
    ADD COLUMN applies_to TEXT DEFAULT 'web' CHECK (applies_to IN ('web', 'mobile', 'both'));
  END IF;
END $$;