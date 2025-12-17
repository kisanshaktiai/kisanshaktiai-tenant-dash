-- Create RPC functions for onboarding operations with proper tenant context

-- Function to upsert tenant branding during onboarding
CREATE OR REPLACE FUNCTION public.upsert_tenant_branding(
  p_tenant_id UUID,
  p_app_name VARCHAR DEFAULT NULL,
  p_logo_url TEXT DEFAULT NULL,
  p_primary_color VARCHAR DEFAULT NULL,
  p_secondary_color VARCHAR DEFAULT NULL,
  p_accent_color VARCHAR DEFAULT '#10B981',
  p_background_color VARCHAR DEFAULT '#FFFFFF',
  p_text_color VARCHAR DEFAULT '#1F2937',
  p_font_family VARCHAR DEFAULT 'Inter'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user has access to this tenant
  IF NOT EXISTS (
    SELECT 1 FROM tenant_users 
    WHERE tenant_id = p_tenant_id 
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to tenant';
  END IF;

  INSERT INTO tenant_branding (
    tenant_id, app_name, logo_url, primary_color, secondary_color,
    accent_color, background_color, text_color, font_family, updated_at
  ) VALUES (
    p_tenant_id, p_app_name, p_logo_url, p_primary_color, p_secondary_color,
    p_accent_color, p_background_color, p_text_color, p_font_family, NOW()
  )
  ON CONFLICT (tenant_id) DO UPDATE SET
    app_name = COALESCE(EXCLUDED.app_name, tenant_branding.app_name),
    logo_url = COALESCE(EXCLUDED.logo_url, tenant_branding.logo_url),
    primary_color = COALESCE(EXCLUDED.primary_color, tenant_branding.primary_color),
    secondary_color = COALESCE(EXCLUDED.secondary_color, tenant_branding.secondary_color),
    accent_color = COALESCE(EXCLUDED.accent_color, tenant_branding.accent_color),
    background_color = COALESCE(EXCLUDED.background_color, tenant_branding.background_color),
    text_color = COALESCE(EXCLUDED.text_color, tenant_branding.text_color),
    font_family = COALESCE(EXCLUDED.font_family, tenant_branding.font_family),
    updated_at = NOW();

  RETURN TRUE;
END;
$$;

-- Function to upsert tenant features during onboarding
CREATE OR REPLACE FUNCTION public.upsert_tenant_features(
  p_tenant_id UUID,
  p_farmer_management BOOLEAN DEFAULT TRUE,
  p_basic_analytics BOOLEAN DEFAULT TRUE,
  p_mobile_app BOOLEAN DEFAULT TRUE,
  p_sms_notifications BOOLEAN DEFAULT FALSE,
  p_whatsapp_integration BOOLEAN DEFAULT FALSE,
  p_voice_calls BOOLEAN DEFAULT FALSE,
  p_advanced_analytics BOOLEAN DEFAULT FALSE,
  p_predictive_analytics BOOLEAN DEFAULT FALSE,
  p_custom_reports BOOLEAN DEFAULT FALSE,
  p_weather_forecast BOOLEAN DEFAULT FALSE,
  p_satellite_imagery BOOLEAN DEFAULT FALSE,
  p_iot_integration BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user has access to this tenant
  IF NOT EXISTS (
    SELECT 1 FROM tenant_users 
    WHERE tenant_id = p_tenant_id 
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to tenant';
  END IF;

  INSERT INTO tenant_features (
    tenant_id, farmer_management, basic_analytics, mobile_app,
    sms_notifications, whatsapp_integration, voice_calls,
    advanced_analytics, predictive_analytics, custom_reports,
    weather_forecast, satellite_imagery, iot_integration, updated_at
  ) VALUES (
    p_tenant_id, p_farmer_management, p_basic_analytics, p_mobile_app,
    p_sms_notifications, p_whatsapp_integration, p_voice_calls,
    p_advanced_analytics, p_predictive_analytics, p_custom_reports,
    p_weather_forecast, p_satellite_imagery, p_iot_integration, NOW()
  )
  ON CONFLICT (tenant_id) DO UPDATE SET
    farmer_management = EXCLUDED.farmer_management,
    basic_analytics = EXCLUDED.basic_analytics,
    mobile_app = EXCLUDED.mobile_app,
    sms_notifications = EXCLUDED.sms_notifications,
    whatsapp_integration = EXCLUDED.whatsapp_integration,
    voice_calls = EXCLUDED.voice_calls,
    advanced_analytics = EXCLUDED.advanced_analytics,
    predictive_analytics = EXCLUDED.predictive_analytics,
    custom_reports = EXCLUDED.custom_reports,
    weather_forecast = EXCLUDED.weather_forecast,
    satellite_imagery = EXCLUDED.satellite_imagery,
    iot_integration = EXCLUDED.iot_integration,
    updated_at = NOW();

  RETURN TRUE;
END;
$$;

-- Function to update tenant business verification
CREATE OR REPLACE FUNCTION public.update_tenant_verification(
  p_tenant_id UUID,
  p_verification_data JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user has access to this tenant
  IF NOT EXISTS (
    SELECT 1 FROM tenant_users 
    WHERE tenant_id = p_tenant_id 
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to tenant';
  END IF;

  UPDATE tenants
  SET 
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('verification', p_verification_data),
    updated_at = NOW()
  WHERE id = p_tenant_id;

  RETURN TRUE;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.upsert_tenant_branding TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_tenant_features TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_tenant_verification TO authenticated;