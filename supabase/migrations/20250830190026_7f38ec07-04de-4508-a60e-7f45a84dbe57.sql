
-- Create appearance_settings table for tenant appearance customization
CREATE TABLE public.appearance_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  theme_mode TEXT NOT NULL DEFAULT 'system' CHECK (theme_mode IN ('light', 'dark', 'system')),
  primary_color TEXT NOT NULL DEFAULT '#10b981',
  secondary_color TEXT NOT NULL DEFAULT '#059669',
  accent_color TEXT NOT NULL DEFAULT '#14b8a6',
  background_color TEXT NOT NULL DEFAULT '#ffffff',
  text_color TEXT NOT NULL DEFAULT '#1f2937',
  font_family TEXT NOT NULL DEFAULT 'Inter',
  logo_override_url TEXT,
  custom_css TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Enable Row Level Security
ALTER TABLE public.appearance_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for appearance_settings
CREATE POLICY "Tenant users can view their appearance settings" 
  ON public.appearance_settings 
  FOR SELECT 
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Tenant admins can manage appearance settings" 
  ON public.appearance_settings 
  FOR ALL 
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid() 
      AND is_active = true 
      AND role IN ('tenant_owner', 'tenant_admin')
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid() 
      AND is_active = true 
      AND role IN ('tenant_owner', 'tenant_admin')
    )
  );

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION public.update_appearance_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_appearance_settings_updated_at
  BEFORE UPDATE ON public.appearance_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_appearance_settings_updated_at();
