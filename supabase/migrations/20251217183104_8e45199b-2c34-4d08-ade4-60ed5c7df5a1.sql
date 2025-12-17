-- Fix tenant branding upsert: tenant_branding has no UNIQUE(tenant_id), so ON CONFLICT (tenant_id) fails.
-- We update the latest branding row for the tenant when it exists, otherwise we insert a new row.

CREATE OR REPLACE FUNCTION public.upsert_tenant_branding(
  p_tenant_id uuid,
  p_app_name character varying DEFAULT NULL,
  p_logo_url text DEFAULT NULL,
  p_primary_color character varying DEFAULT NULL,
  p_secondary_color character varying DEFAULT NULL,
  p_accent_color character varying DEFAULT NULL,
  p_background_color character varying DEFAULT NULL,
  p_text_color character varying DEFAULT NULL,
  p_font_family character varying DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_existing_id uuid;
  v_next_version integer;
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

  SELECT tb.id
  INTO v_existing_id
  FROM public.tenant_branding tb
  WHERE tb.tenant_id = p_tenant_id
  ORDER BY tb.updated_at DESC NULLS LAST, tb.created_at DESC NULLS LAST
  LIMIT 1;

  IF v_existing_id IS NULL THEN
    SELECT COALESCE(MAX(tb.version), 0) + 1
    INTO v_next_version
    FROM public.tenant_branding tb
    WHERE tb.tenant_id = p_tenant_id;

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
      version,
      created_at,
      updated_at
    ) VALUES (
      p_tenant_id,
      p_app_name,
      p_logo_url,
      p_primary_color,
      p_secondary_color,
      COALESCE(p_accent_color, '#10B981'),
      COALESCE(p_background_color, '#FFFFFF'),
      COALESCE(p_text_color, '#1F2937'),
      COALESCE(p_font_family, 'Inter'),
      v_next_version,
      NOW(),
      NOW()
    );
  ELSE
    UPDATE public.tenant_branding
    SET
      app_name = COALESCE(p_app_name, app_name),
      logo_url = COALESCE(p_logo_url, logo_url),
      primary_color = COALESCE(p_primary_color, primary_color),
      secondary_color = COALESCE(p_secondary_color, secondary_color),
      accent_color = COALESCE(p_accent_color, accent_color),
      background_color = COALESCE(p_background_color, background_color),
      text_color = COALESCE(p_text_color, text_color),
      font_family = COALESCE(p_font_family, font_family),
      updated_at = NOW()
    WHERE id = v_existing_id;
  END IF;

  RETURN TRUE;
END;
$$;