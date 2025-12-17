-- Fix onboarding RPC functions: membership table is public.user_tenants (not tenant_users)

CREATE OR REPLACE FUNCTION public.upsert_tenant_branding(
  p_tenant_id uuid,
  p_app_name character varying DEFAULT NULL,
  p_logo_url text DEFAULT NULL,
  p_primary_color character varying DEFAULT NULL,
  p_secondary_color character varying DEFAULT NULL,
  p_accent_color character varying DEFAULT '#10B981',
  p_background_color character varying DEFAULT '#FFFFFF',
  p_text_color character varying DEFAULT '#1F2937',
  p_font_family character varying DEFAULT 'Inter'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify user has access to this tenant
  IF NOT EXISTS (
    SELECT 1
    FROM public.user_tenants ut
    WHERE ut.tenant_id = p_tenant_id
      AND ut.user_id = auth.uid()
      AND COALESCE(ut.is_active, true) = true
  ) THEN
    RAISE EXCEPTION 'Access denied to tenant';
  END IF;

  INSERT INTO public.tenant_branding (
    tenant_id,
    app_name,
    logo_url,
    primary_color,
    secondary_color,
    accent_color,
    background_color,
    text_color,
    font_family,
    updated_at
  ) VALUES (
    p_tenant_id,
    p_app_name,
    p_logo_url,
    p_primary_color,
    p_secondary_color,
    p_accent_color,
    p_background_color,
    p_text_color,
    p_font_family,
    NOW()
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
$function$;

CREATE OR REPLACE FUNCTION public.upsert_tenant_features(
  p_tenant_id uuid,
  p_farmer_management boolean DEFAULT true,
  p_basic_analytics boolean DEFAULT true,
  p_mobile_app boolean DEFAULT true,
  p_sms_notifications boolean DEFAULT false,
  p_whatsapp_integration boolean DEFAULT false,
  p_voice_calls boolean DEFAULT false,
  p_advanced_analytics boolean DEFAULT false,
  p_predictive_analytics boolean DEFAULT false,
  p_custom_reports boolean DEFAULT false,
  p_weather_forecast boolean DEFAULT false,
  p_satellite_imagery boolean DEFAULT false,
  p_iot_integration boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify user has access to this tenant
  IF NOT EXISTS (
    SELECT 1
    FROM public.user_tenants ut
    WHERE ut.tenant_id = p_tenant_id
      AND ut.user_id = auth.uid()
      AND COALESCE(ut.is_active, true) = true
  ) THEN
    RAISE EXCEPTION 'Access denied to tenant';
  END IF;

  INSERT INTO public.tenant_features (
    tenant_id,
    farmer_management,
    basic_analytics,
    mobile_app,
    sms_notifications,
    whatsapp_integration,
    voice_calls,
    advanced_analytics,
    predictive_analytics,
    custom_reports,
    weather_forecast,
    satellite_imagery,
    iot_integration,
    updated_at
  ) VALUES (
    p_tenant_id,
    p_farmer_management,
    p_basic_analytics,
    p_mobile_app,
    p_sms_notifications,
    p_whatsapp_integration,
    p_voice_calls,
    p_advanced_analytics,
    p_predictive_analytics,
    p_custom_reports,
    p_weather_forecast,
    p_satellite_imagery,
    p_iot_integration,
    NOW()
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
$function$;

CREATE OR REPLACE FUNCTION public.update_tenant_verification(
  p_tenant_id uuid,
  p_verification_data jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify user has access to this tenant
  IF NOT EXISTS (
    SELECT 1
    FROM public.user_tenants ut
    WHERE ut.tenant_id = p_tenant_id
      AND ut.user_id = auth.uid()
      AND COALESCE(ut.is_active, true) = true
  ) THEN
    RAISE EXCEPTION 'Access denied to tenant';
  END IF;

  UPDATE public.tenants
  SET
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('verification', p_verification_data),
    updated_at = NOW()
  WHERE id = p_tenant_id;

  RETURN TRUE;
END;
$function$;

-- Ensure authenticated users can call these functions
GRANT EXECUTE ON FUNCTION public.upsert_tenant_branding(uuid, character varying, text, character varying, character varying, character varying, character varying, character varying, character varying) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_tenant_features(uuid, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_tenant_verification(uuid, jsonb) TO authenticated;
