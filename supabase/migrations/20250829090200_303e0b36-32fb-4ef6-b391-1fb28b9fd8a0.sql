
-- First, let's see what columns exist in tenant_features table
-- This is a diagnostic query to understand the current structure

-- Add missing columns to tenant_features table based on TenantProfileService expectations
ALTER TABLE public.tenant_features 
ADD COLUMN IF NOT EXISTS farmer_management boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS basic_analytics boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS mobile_app boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS sms_notifications boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_integration boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS voice_calls boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS advanced_analytics boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS predictive_analytics boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_reports boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS weather_forecast boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS satellite_imagery boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS iot_integration boolean DEFAULT false;

-- Ensure the table has proper constraints
ALTER TABLE public.tenant_features 
ADD CONSTRAINT IF NOT EXISTS tenant_features_tenant_id_key UNIQUE (tenant_id);

-- Update the updated_at column to have proper trigger
CREATE OR REPLACE FUNCTION update_tenant_features_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_tenant_features_updated_at_trigger ON public.tenant_features;
CREATE TRIGGER update_tenant_features_updated_at_trigger
    BEFORE UPDATE ON public.tenant_features
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_features_updated_at();
