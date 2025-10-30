-- Fix the handle_farmer_update trigger to use existing tables
CREATE OR REPLACE FUNCTION public.handle_farmer_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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
    
    -- Update engagement data in farmer_engagement table (using the existing table)
    INSERT INTO public.farmer_engagement (
      id,
      tenant_id,
      farmer_id,
      app_opens_count,
      last_app_open,
      engagement_level,
      activity_score,
      churn_risk_score,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      NEW.tenant_id,
      NEW.id,
      CASE WHEN NEW.total_app_opens > OLD.total_app_opens THEN NEW.total_app_opens ELSE OLD.total_app_opens END,
      NEW.last_app_open,
      CASE 
        WHEN NEW.total_app_opens > 10 THEN 'high'
        WHEN NEW.total_app_opens > 5 THEN 'medium'
        ELSE 'low'
      END,
      LEAST(100, NEW.total_app_opens * 10), -- Simple activity score
      CASE 
        WHEN NEW.last_app_open < NOW() - INTERVAL '30 days' THEN 0.8
        WHEN NEW.last_app_open < NOW() - INTERVAL '14 days' THEN 0.5
        ELSE 0.2
      END,
      NOW(),
      NOW()
    ) ON CONFLICT (farmer_id, tenant_id) DO UPDATE SET
      app_opens_count = EXCLUDED.app_opens_count,
      last_app_open = EXCLUDED.last_app_open,
      engagement_level = EXCLUDED.engagement_level,
      activity_score = EXCLUDED.activity_score,
      churn_risk_score = EXCLUDED.churn_risk_score,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;