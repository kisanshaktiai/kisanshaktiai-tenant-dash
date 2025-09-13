-- Fix the handle_farmer_creation trigger to handle duplicate mobile numbers properly
CREATE OR REPLACE FUNCTION public.handle_farmer_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  v_existing_profile UUID;
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
  
  -- Check if a profile with this mobile number already exists
  SELECT id INTO v_existing_profile
  FROM public.user_profiles
  WHERE mobile_number = NEW.mobile_number
  LIMIT 1;
  
  IF v_existing_profile IS NOT NULL THEN
    -- Update existing profile to link with this farmer
    UPDATE public.user_profiles
    SET 
      farmer_id = NEW.id,
      full_name = COALESCE(v_full_name, full_name),
      display_name = COALESCE(v_full_name, display_name),
      date_of_birth = COALESCE(v_dob, date_of_birth),
      gender = COALESCE(v_gender, gender),
      address_line1 = COALESCE(v_village, address_line1),
      address_line2 = COALESCE(v_taluka, address_line2),
      village = COALESCE(v_village, village),
      taluka = COALESCE(v_taluka, taluka),
      district = COALESCE(v_district, district),
      state = COALESCE(v_state, state),
      pincode = COALESCE(v_pincode, pincode),
      metadata = metadata || jsonb_build_object(
        'farmer_id', NEW.id,
        'farmer_code', NEW.farmer_code,
        'tenant_id', NEW.tenant_id,
        'source', 'farmer_registration'
      ),
      updated_at = NOW()
    WHERE id = v_existing_profile;
    
    v_user_id := v_existing_profile;
  ELSE
    -- Generate a UUID for the new farmer's user profile
    v_user_id := gen_random_uuid();
    
    -- Create new user_profiles entry
    INSERT INTO public.user_profiles (
      id,
      farmer_id,
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
      NEW.id,
      NEW.mobile_number,
      false,
      v_full_name,
      v_full_name,
      v_dob,
      v_gender,
      v_village,
      v_taluka,
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
        'email', false,
        'push', true,
        'whatsapp', true
      ),
      jsonb_build_object(
        'farmer_id', NEW.id,
        'farmer_code', NEW.farmer_code,
        'tenant_id', NEW.tenant_id,
        'source', 'farmer_registration'
      ),
      NOW(),
      NOW()
    );
  END IF;
  
  -- Update the farmer record with the user_profile_id reference
  UPDATE public.farmers 
  SET metadata = metadata || jsonb_build_object('user_profile_id', v_user_id)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Also, let's check and potentially fix the unique constraint on farmers table
-- to be per-tenant instead of global
DROP INDEX IF EXISTS farmers_mobile_tenant_unique;
CREATE UNIQUE INDEX farmers_mobile_tenant_unique 
ON public.farmers(mobile_number, tenant_id) 
WHERE tenant_id IS NOT NULL;