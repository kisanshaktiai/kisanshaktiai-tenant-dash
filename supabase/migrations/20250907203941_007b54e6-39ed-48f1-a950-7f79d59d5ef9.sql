-- Create or replace the trigger function to handle farmer creation
CREATE OR REPLACE FUNCTION public.handle_farmer_creation()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_full_name TEXT;
  v_email TEXT;
  v_dob DATE;
  v_gender TEXT;
  v_village TEXT;
  v_taluka TEXT;
  v_district TEXT;
  v_state TEXT;
  v_pincode TEXT;
  v_lang_pref TEXT;
BEGIN
  -- Extract data from metadata JSON for easier access
  v_full_name := COALESCE(NEW.metadata->'personal_info'->>'full_name', '');
  v_email := NEW.metadata->'personal_info'->>'email';
  v_dob := (NEW.metadata->'personal_info'->>'date_of_birth')::DATE;
  v_gender := NEW.metadata->'personal_info'->>'gender';
  v_village := NEW.metadata->'address_info'->>'village';
  v_taluka := NEW.metadata->'address_info'->>'taluka';
  v_district := NEW.metadata->'address_info'->>'district';
  v_state := NEW.metadata->'address_info'->>'state';
  v_pincode := NEW.metadata->'address_info'->>'pincode';
  v_lang_pref := COALESCE(NEW.metadata->'personal_info'->>'language_preference', 'en');
  
  -- Generate a UUID for the farmer's user profile if not exists
  v_user_id := gen_random_uuid();
  
  -- Create or update user_profiles entry (farmers have their own auth system)
  INSERT INTO public.user_profiles (
    id,
    mobile_number,
    phone_verified,
    full_name,
    display_name,
    date_of_birth,
    gender,
    address_line1,
    address_line2,
    village,
    taluka,
    district,
    state,
    pincode,
    country,
    preferred_language,
    notification_preferences,
    metadata,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    NEW.mobile_number,
    false, -- Initially unverified
    v_full_name,
    v_full_name, -- Use full name as display name initially
    v_dob,
    v_gender,
    v_village, -- Using village as address line 1
    v_taluka, -- Using taluka as address line 2
    v_village,
    v_taluka,
    v_district,
    v_state,
    v_pincode,
    'India',
    CASE 
      WHEN v_lang_pref IN ('en', 'hi', 'mr', 'gu', 'ta', 'te', 'kn', 'ml', 'pa', 'bn')
      THEN v_lang_pref::language_code
      ELSE 'en'::language_code
    END,
    jsonb_build_object(
      'sms', true,
      'push', true,
      'email', v_email IS NOT NULL
    ),
    jsonb_build_object(
      'farmer_id', NEW.id,
      'farmer_code', NEW.farmer_code,
      'tenant_id', NEW.tenant_id,
      'source', 'farmer_registration'
    ),
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    mobile_number = EXCLUDED.mobile_number,
    full_name = EXCLUDED.full_name,
    date_of_birth = EXCLUDED.date_of_birth,
    gender = EXCLUDED.gender,
    village = EXCLUDED.village,
    taluka = EXCLUDED.taluka,
    district = EXCLUDED.district,
    state = EXCLUDED.state,
    pincode = EXCLUDED.pincode,
    metadata = user_profiles.metadata || EXCLUDED.metadata,
    updated_at = NOW();
  
  -- Create farmer engagement metrics entry
  INSERT INTO public.farmer_engagement_metrics (
    id,
    tenant_id,
    farmer_id,
    app_usage_frequency,
    last_active_date,
    feature_adoption_rate,
    response_rate,
    engagement_score,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    NEW.tenant_id,
    NEW.id,
    0, -- Initial frequency
    NULL, -- No activity yet
    0, -- No features adopted yet
    0, -- No responses yet
    0, -- Initial score
    NOW(),
    NOW()
  ) ON CONFLICT (farmer_id) DO NOTHING;
  
  -- Initialize farmer activity log
  INSERT INTO public.farmer_activity_logs (
    id,
    tenant_id,
    farmer_id,
    activity_type,
    activity_details,
    created_at
  ) VALUES (
    gen_random_uuid(),
    NEW.tenant_id,
    NEW.id,
    'registration',
    jsonb_build_object(
      'farmer_code', NEW.farmer_code,
      'mobile_number', NEW.mobile_number,
      'registration_date', NOW()
    ),
    NOW()
  );
  
  -- Create farmer communication preferences
  INSERT INTO public.farmer_communication_preferences (
    id,
    tenant_id,
    farmer_id,
    channel,
    is_enabled,
    frequency,
    best_time,
    created_at,
    updated_at
  ) VALUES 
  (gen_random_uuid(), NEW.tenant_id, NEW.id, 'sms', true, 'immediate', 'morning', NOW(), NOW()),
  (gen_random_uuid(), NEW.tenant_id, NEW.id, 'app_notification', true, 'immediate', 'anytime', NOW(), NOW()),
  (gen_random_uuid(), NEW.tenant_id, NEW.id, 'whatsapp', true, 'daily', 'evening', NOW(), NOW())
  ON CONFLICT DO NOTHING;
  
  -- Update the farmer record with the user_profile_id reference
  UPDATE public.farmers 
  SET metadata = metadata || jsonb_build_object('user_profile_id', v_user_id)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_farmer_created ON public.farmers;

-- Create trigger for new farmer insertions
CREATE TRIGGER on_farmer_created
  AFTER INSERT ON public.farmers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_farmer_creation();

-- Also create an update trigger to sync changes
CREATE OR REPLACE FUNCTION public.handle_farmer_update()
RETURNS TRIGGER AS $$
DECLARE
  v_user_profile_id UUID;
  v_full_name TEXT;
  v_email TEXT;
  v_dob DATE;
  v_gender TEXT;
  v_village TEXT;
  v_taluka TEXT;
  v_district TEXT;
  v_state TEXT;
  v_pincode TEXT;
BEGIN
  -- Get the user_profile_id from metadata
  v_user_profile_id := (NEW.metadata->>'user_profile_id')::UUID;
  
  -- Only proceed if user_profile_id exists
  IF v_user_profile_id IS NOT NULL THEN
    -- Extract updated data from metadata
    v_full_name := NEW.metadata->'personal_info'->>'full_name';
    v_email := NEW.metadata->'personal_info'->>'email';
    v_dob := (NEW.metadata->'personal_info'->>'date_of_birth')::DATE;
    v_gender := NEW.metadata->'personal_info'->>'gender';
    v_village := NEW.metadata->'address_info'->>'village';
    v_taluka := NEW.metadata->'address_info'->>'taluka';
    v_district := NEW.metadata->'address_info'->>'district';
    v_state := NEW.metadata->'address_info'->>'state';
    v_pincode := NEW.metadata->'address_info'->>'pincode';
    
    -- Update user profile with new information
    UPDATE public.user_profiles
    SET 
      mobile_number = NEW.mobile_number,
      full_name = COALESCE(v_full_name, full_name),
      date_of_birth = COALESCE(v_dob, date_of_birth),
      gender = COALESCE(v_gender, gender),
      village = COALESCE(v_village, village),
      taluka = COALESCE(v_taluka, taluka),
      district = COALESCE(v_district, district),
      state = COALESCE(v_state, state),
      pincode = COALESCE(v_pincode, pincode),
      updated_at = NOW()
    WHERE id = v_user_profile_id;
    
    -- Update engagement metrics
    UPDATE public.farmer_engagement_metrics
    SET 
      last_active_date = CASE 
        WHEN NEW.last_app_open > OLD.last_app_open THEN NEW.last_app_open::DATE
        ELSE last_active_date
      END,
      updated_at = NOW()
    WHERE farmer_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing update trigger if exists
DROP TRIGGER IF EXISTS on_farmer_updated ON public.farmers;

-- Create trigger for farmer updates
CREATE TRIGGER on_farmer_updated
  AFTER UPDATE ON public.farmers
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION public.handle_farmer_update();