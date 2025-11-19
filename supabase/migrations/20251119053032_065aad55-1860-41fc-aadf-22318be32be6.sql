-- Fix RLS policy on tenants table to allow JOINs from user_tenants
-- The current policy uses has_tenant_access which fails in JOIN context

-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "tenants_select" ON public.tenants;

-- Create a new policy that works with JOINs
-- Users can read tenant data if they have a user_tenants relationship
CREATE POLICY "tenants_select_via_user_tenants" ON public.tenants
FOR SELECT
USING (
  -- Service role always has access
  auth.role() = 'service_role'
  OR
  -- Super admins have access
  public.is_super_admin()
  OR
  -- User has a relationship with this tenant
  EXISTS (
    SELECT 1 FROM public.user_tenants ut
    WHERE ut.tenant_id = tenants.id
    AND ut.user_id = auth.uid()
    AND ut.is_active = true
  )
);

-- Add comment
COMMENT ON POLICY "tenants_select_via_user_tenants" ON public.tenants IS 
'Allows users to read tenant data if they have an active user_tenants relationship';
