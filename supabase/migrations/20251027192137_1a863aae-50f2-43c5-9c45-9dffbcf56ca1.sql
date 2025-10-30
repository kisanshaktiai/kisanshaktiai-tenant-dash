-- Fix: Update create_tenant_with_validation to create user_tenants association
CREATE OR REPLACE FUNCTION public.create_tenant_with_validation(
  p_name text, 
  p_slug text, 
  p_type text, 
  p_status text DEFAULT 'trial'::text, 
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
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_user_id UUID;
  v_result JSONB;
  v_plan_limits JSONB;
  v_features_config JSONB;
  v_slug_check JSONB;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Authentication required to create tenant',
      'code', 'AUTHENTICATION_REQUIRED'
    );
  END IF;

  -- Validate required fields
  IF p_name IS NULL OR trim(p_name) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Tenant name is required',
      'code', 'VALIDATION_ERROR'
    );
  END IF;
  
  -- Use enhanced slug validation
  v_slug_check := public.check_slug_availability(p_slug);
  IF NOT (v_slug_check->>'available')::boolean THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', v_slug_check->>'error',
      'code', v_slug_check->>'code'
    );
  END IF;
  
  -- Validate email format if provided
  IF p_owner_email IS NOT NULL AND p_owner_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid email format',
      'code', 'VALIDATION_ERROR'
    );
  END IF;
  
  -- Validate subscription plan
  IF p_subscription_plan NOT IN ('kisan', 'shakti', 'ai') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid subscription plan. Must be one of: kisan, shakti, ai',
      'code', 'VALIDATION_ERROR'
    );
  END IF;
  
  -- Validate tenant type
  IF p_type NOT IN ('agri_company', 'dealer', 'ngo', 'government', 'university', 'sugar_factory', 'cooperative', 'insurance') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid tenant type',
      'code', 'VALIDATION_ERROR'
    );
  END IF;
  
  -- Validate status
  IF p_status NOT IN ('trial', 'active', 'suspended', 'cancelled') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid status',
      'code', 'VALIDATION_ERROR'
    );
  END IF;
  
  -- Set default limits and features based on subscription plan
  CASE p_subscription_plan
    WHEN 'kisan' THEN
      v_plan_limits := jsonb_build_object(
        'farmers', 1000, 'dealers', 50, 'products', 100, 'storage', 10, 'api_calls', 10000
      );
      v_features_config := jsonb_build_object(
        'ai_chat', true, 'weather_forecast', true, 'marketplace', true, 
        'community_forum', true, 'basic_analytics', true
      );
    WHEN 'shakti' THEN
      v_plan_limits := jsonb_build_object(
        'farmers', 5000, 'dealers', 200, 'products', 500, 'storage', 50, 'api_calls', 50000
      );
      v_features_config := jsonb_build_object(
        'ai_chat', true, 'weather_forecast', true, 'marketplace', true,
        'satellite_imagery', true, 'soil_testing', true, 'basic_analytics', true, 'advanced_analytics', true
      );
    WHEN 'ai' THEN
      v_plan_limits := jsonb_build_object(
        'farmers', 20000, 'dealers', 1000, 'products', 2000, 'storage', 200, 'api_calls', 200000
      );
      v_features_config := jsonb_build_object(
        'ai_chat', true, 'weather_forecast', true, 'marketplace', true,
        'satellite_imagery', true, 'soil_testing', true, 'drone_monitoring', true,
        'iot_integration', true, 'basic_analytics', true, 'advanced_analytics', true,
        'predictive_analytics', true, 'api_access', true
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
    p_trial_ends_at := (now() + interval '14 days')::TEXT;
  END IF;
  
  -- Begin transaction for atomic operations
  BEGIN
    -- Step 1: Insert tenant
    INSERT INTO tenants (
      name, slug, type, status, subscription_plan, owner_name, owner_email, owner_phone,
      business_registration, business_address, established_date, subscription_start_date,
      subscription_end_date, trial_ends_at, max_farmers, max_dealers, max_products,
      max_storage_gb, max_api_calls_per_day, subdomain, custom_domain, metadata
    ) VALUES (
      p_name, p_slug, p_type::tenant_type, p_status::tenant_status, 
      p_subscription_plan::subscription_plan, p_owner_name, p_owner_email, p_owner_phone,
      p_business_registration, p_business_address,
      CASE WHEN p_established_date IS NOT NULL THEN p_established_date::DATE ELSE NULL END,
      CASE WHEN p_subscription_start_date IS NOT NULL THEN p_subscription_start_date::TIMESTAMP WITH TIME ZONE ELSE now() END,
      CASE WHEN p_subscription_end_date IS NOT NULL THEN p_subscription_end_date::TIMESTAMP WITH TIME ZONE ELSE NULL END,
      p_trial_ends_at::TIMESTAMP WITH TIME ZONE,
      p_max_farmers, p_max_dealers, p_max_products, p_max_storage_gb, p_max_api_calls_per_day,
      p_subdomain, p_custom_domain, p_metadata
    ) RETURNING id INTO v_tenant_id;
    
    -- Step 2: Create default tenant branding
    INSERT INTO tenant_branding (
      tenant_id, primary_color, secondary_color, accent_color, background_color, text_color,
      app_name, app_tagline, font_family
    ) VALUES (
      v_tenant_id, '#10B981', '#065F46', '#F59E0B', '#FFFFFF', '#111827',
      COALESCE(p_name, 'KisanShakti AI'), 'Empowering Farmers with AI Technology', 'Inter'
    );
    
    -- Step 3: Create tenant features
    INSERT INTO tenant_features (tenant_id, ai_chat, weather_forecast, marketplace, community_forum, basic_analytics)
    VALUES (v_tenant_id, true, true, true, true, true);
    
    -- Step 4: CRITICAL FIX - Create user_tenants association
    INSERT INTO user_tenants (
      user_id, tenant_id, role, is_active, is_primary, created_at, updated_at
    ) VALUES (
      v_user_id, v_tenant_id, 'tenant_owner', true, true, now(), now()
    );
    
    -- Return success
    RETURN jsonb_build_object(
      'success', true,
      'data', jsonb_build_object(
        'tenant_id', v_tenant_id,
        'name', p_name,
        'slug', p_slug,
        'status', p_status,
        'subscription_plan', p_subscription_plan
      ),
      'message', 'Tenant created successfully',
      'code', 'TENANT_CREATED'
    );
    
  EXCEPTION
    WHEN unique_violation THEN
      RETURN jsonb_build_object('success', false, 'error', 'Tenant with this slug already exists', 'code', 'DUPLICATE_SLUG');
    WHEN OTHERS THEN
      RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'code', 'INTERNAL_ERROR');
  END;
END;
$$;

-- Fix existing stuck user by creating missing user_tenants record
INSERT INTO user_tenants (user_id, tenant_id, role, is_active, is_primary, created_at, updated_at)
SELECT 
  '8d80b233-f018-42f5-ba7f-b8f7985cff8c'::uuid,
  id,
  'tenant_owner',
  true,
  true,
  now(),
  now()
FROM tenants
WHERE owner_email = 'ranveersinhp3@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM user_tenants 
    WHERE user_id = '8d80b233-f018-42f5-ba7f-b8f7985cff8c'::uuid 
    AND tenant_id = tenants.id
  )
LIMIT 1;