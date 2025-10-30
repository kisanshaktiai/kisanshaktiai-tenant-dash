
-- First, let's see the current structure of tenant_features table
-- and ensure it has the correct columns for feature selection

-- Check if tenant_features table exists and what columns it has
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tenant_features' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- If the table doesn't exist or has wrong columns, let's create/update it
CREATE TABLE IF NOT EXISTS public.tenant_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Core Features
  farmer_management BOOLEAN DEFAULT true,
  basic_analytics BOOLEAN DEFAULT true,
  mobile_app BOOLEAN DEFAULT true,
  
  -- Communication Features
  sms_notifications BOOLEAN DEFAULT false,
  whatsapp_integration BOOLEAN DEFAULT false,
  voice_calls BOOLEAN DEFAULT false,
  
  -- Advanced Analytics Features
  advanced_analytics BOOLEAN DEFAULT false,
  predictive_analytics BOOLEAN DEFAULT false,
  custom_reports BOOLEAN DEFAULT false,
  
  -- Technology Features
  weather_forecast BOOLEAN DEFAULT false,
  satellite_imagery BOOLEAN DEFAULT false,
  iot_integration BOOLEAN DEFAULT false,
  
  -- Meta fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(tenant_id)
);

-- Enable RLS
ALTER TABLE public.tenant_features ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Tenant users can manage their features" ON public.tenant_features;
CREATE POLICY "Tenant users can manage their features" 
ON public.tenant_features 
FOR ALL 
TO authenticated
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.user_tenants 
    WHERE user_id = auth.uid() AND is_active = true
  )
)
WITH CHECK (
  tenant_id IN (
    SELECT tenant_id FROM public.user_tenants 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tenant_features_updated_at ON public.tenant_features;
CREATE TRIGGER tenant_features_updated_at
  BEFORE UPDATE ON public.tenant_features
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
