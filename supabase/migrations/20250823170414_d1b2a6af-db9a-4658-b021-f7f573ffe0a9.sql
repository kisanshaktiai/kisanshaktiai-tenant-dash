
-- Create function to automatically create user_tenants record when a user logs in whose email matches tenants.owner_email
CREATE OR REPLACE FUNCTION public.ensure_tenant_owner_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  matching_tenant_id uuid;
BEGIN
  -- Only process when a user signs in (not sign up)
  IF NEW.last_sign_in_at IS NOT NULL AND OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at THEN
    -- Check if user's email matches any tenant owner_email
    SELECT id INTO matching_tenant_id
    FROM tenants
    WHERE owner_email = NEW.email
    AND is_active = true
    LIMIT 1;
    
    IF matching_tenant_id IS NOT NULL THEN
      -- Create or update user_tenants record
      INSERT INTO user_tenants (
        user_id,
        tenant_id,
        role,
        is_active,
        is_primary,
        joined_at
      ) VALUES (
        NEW.id,
        matching_tenant_id,
        'tenant_owner',
        true,
        true,
        NOW()
      )
      ON CONFLICT (user_id, tenant_id) 
      DO UPDATE SET
        role = 'tenant_owner',
        is_active = true,
        is_primary = true,
        updated_at = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run the function on user auth events
DROP TRIGGER IF EXISTS ensure_tenant_owner_access_trigger ON auth.users;
CREATE TRIGGER ensure_tenant_owner_access_trigger
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_tenant_owner_access();

-- Create function to validate tenant ownership by email
CREATE OR REPLACE FUNCTION public.validate_tenant_ownership(p_email text)
RETURNS TABLE(
  tenant_id uuid,
  tenant_name text,
  tenant_slug text,
  owner_email text,
  is_owner boolean,
  onboarding_complete boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as tenant_id,
    t.name as tenant_name,
    t.slug as tenant_slug,
    t.owner_email,
    (t.owner_email = p_email) as is_owner,
    COALESCE(
      (SELECT ow.status = 'completed' 
       FROM onboarding_workflows ow 
       WHERE ow.tenant_id = t.id 
       LIMIT 1), 
      false
    ) as onboarding_complete
  FROM tenants t
  WHERE t.owner_email = p_email
  AND t.is_active = true;
END;
$$;
