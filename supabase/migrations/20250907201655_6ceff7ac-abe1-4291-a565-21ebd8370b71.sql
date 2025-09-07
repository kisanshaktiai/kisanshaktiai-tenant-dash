-- Fix the sync_farmer_to_user_profile trigger to properly handle language_code type
CREATE OR REPLACE FUNCTION public.sync_farmer_to_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert or update user_profiles when farmer is created/updated
  INSERT INTO user_profiles (
    id,
    mobile_number,
    full_name,
    preferred_language,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.mobile_number,
    NEW.metadata->'personal_info'->>'full_name',  -- Access full_name from metadata
    COALESCE(NEW.language_preference, 'en')::language_code,  -- Cast to language_code enum type
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    mobile_number = EXCLUDED.mobile_number,
    full_name = EXCLUDED.full_name,
    preferred_language = EXCLUDED.preferred_language,
    updated_at = EXCLUDED.updated_at;
  
  RETURN NEW;
END;
$$;