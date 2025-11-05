-- Phase 1-2-6-7: Fix farmer creation sync between farmers and user_profiles tables

-- ============================================================================
-- PHASE 1 & 2: Update trigger function to populate farmer_name and ensure proper sync
-- ============================================================================

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
  
  -- PHASE 2: Update the farmer record with farmer_name AND user_profile_id
  UPDATE public.farmers 
  SET 
    farmer_name = v_full_name,
    metadata = metadata || jsonb_build_object('user_profile_id', v_user_id),
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Ensure INSERT trigger is properly attached
DROP TRIGGER IF EXISTS on_farmer_created ON public.farmers;
DROP TRIGGER IF EXISTS handle_farmer_creation_trigger ON public.farmers;

CREATE TRIGGER on_farmer_created
  AFTER INSERT ON public.farmers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_farmer_creation();

-- ============================================================================
-- PHASE 7: Add UPDATE and DELETE triggers for complete sync
-- ============================================================================

-- Update trigger function
CREATE OR REPLACE FUNCTION public.handle_farmer_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  -- Extract updated data from metadata
  v_full_name := COALESCE(NEW.metadata->'personal_info'->>'full_name', '');
  v_email := NEW.metadata->'personal_info'->>'email';
  v_dob := (NEW.metadata->'personal_info'->>'date_of_birth')::DATE;
  v_gender := NEW.metadata->'personal_info'->>'gender';
  v_village := NEW.metadata->'address_info'->>'village';
  v_taluka := NEW.metadata->'address_info'->>'taluka';
  v_district := NEW.metadata->'address_info'->>'district';
  v_state := NEW.metadata->'address_info'->>'state';
  v_pincode := NEW.metadata->'address_info'->>'pincode';
  
  -- Update farmer_name if metadata changed
  IF NEW.metadata IS DISTINCT FROM OLD.metadata THEN
    UPDATE public.farmers
    SET farmer_name = v_full_name
    WHERE id = NEW.id AND farmer_name IS DISTINCT FROM v_full_name;
  END IF;
  
  -- Sync to user_profiles if it exists
  UPDATE public.user_profiles
  SET 
    full_name = v_full_name,
    display_name = v_full_name,
    mobile_number = NEW.mobile_number,
    date_of_birth = v_dob,
    gender = v_gender,
    village = v_village,
    taluka = v_taluka,
    district = v_district,
    state = v_state,
    pincode = v_pincode,
    updated_at = NOW()
  WHERE farmer_id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Attach UPDATE trigger
DROP TRIGGER IF EXISTS on_farmer_updated ON public.farmers;

CREATE TRIGGER on_farmer_updated
  AFTER UPDATE ON public.farmers
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION public.handle_farmer_update();

-- Delete trigger function
CREATE OR REPLACE FUNCTION public.handle_farmer_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete corresponding user_profile (if exists and not shared)
  DELETE FROM public.user_profiles
  WHERE farmer_id = OLD.id;
  
  RETURN OLD;
END;
$$;

-- Attach DELETE trigger
DROP TRIGGER IF EXISTS on_farmer_deleted ON public.farmers;

CREATE TRIGGER on_farmer_deleted
  BEFORE DELETE ON public.farmers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_farmer_delete();

-- ============================================================================
-- PHASE 6: Backfill existing data
-- ============================================================================

-- Step 1: Update existing farmers to populate farmer_name from metadata
UPDATE public.farmers
SET farmer_name = metadata->'personal_info'->>'full_name'
WHERE farmer_name IS NULL 
  AND metadata->'personal_info'->>'full_name' IS NOT NULL;

-- Step 2: Create missing user_profiles for existing farmers
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
)
SELECT 
  gen_random_uuid() as id,
  f.id as farmer_id,
  f.mobile_number,
  false as phone_verified,
  COALESCE(f.metadata->'personal_info'->>'full_name', f.farmer_name, 'Unknown') as full_name,
  COALESCE(f.metadata->'personal_info'->>'full_name', f.farmer_name, 'Unknown') as display_name,
  (f.metadata->'personal_info'->>'date_of_birth')::date as date_of_birth,
  f.metadata->'personal_info'->>'gender' as gender,
  f.metadata->'address_info'->>'village' as address_line1,
  f.metadata->'address_info'->>'taluka' as address_line2,
  f.metadata->'address_info'->>'village' as village,
  f.metadata->'address_info'->>'taluka' as taluka,
  f.metadata->'address_info'->>'district' as district,
  f.metadata->'address_info'->>'state' as state,
  f.metadata->'address_info'->>'pincode' as pincode,
  'India' as country,
  COALESCE(f.language_preference, 'en')::language_code as preferred_language,
  jsonb_build_object(
    'sms', true,
    'email', false,
    'push', true,
    'whatsapp', true
  ) as notification_preferences,
  jsonb_build_object(
    'farmer_id', f.id,
    'farmer_code', f.farmer_code,
    'tenant_id', f.tenant_id,
    'source', 'backfill'
  ) as metadata,
  f.created_at,
  NOW() as updated_at
FROM public.farmers f
LEFT JOIN public.user_profiles up ON up.farmer_id = f.id
WHERE up.id IS NULL  -- Only for farmers without profiles
  AND f.tenant_id IS NOT NULL
ON CONFLICT (mobile_number) DO NOTHING;  -- Skip if mobile already exists