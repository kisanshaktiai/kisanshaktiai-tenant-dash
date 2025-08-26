
-- Create the validate_tenant_ownership function that's being called by TenantValidationService
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
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as tenant_id,
    t.name as tenant_name,
    t.slug as tenant_slug,
    t.owner_email,
    (t.owner_email = p_email) as is_owner,
    COALESCE(t.onboarding_completed, false) as onboarding_complete
  FROM public.tenants t
  WHERE t.owner_email = p_email
    AND t.status = 'active'
  LIMIT 1;
END;
$$;
