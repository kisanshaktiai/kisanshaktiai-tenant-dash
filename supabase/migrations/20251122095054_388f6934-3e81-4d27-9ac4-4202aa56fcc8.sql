-- Fix RLS policy for lands table to allow tenant admins to see all tenant lands
-- Drop the restrictive farmer-only SELECT policy
DROP POLICY IF EXISTS tenant_isolation_lands_select ON public.lands;

-- Ensure lands_access_policy allows tenant admins to view all tenant lands
-- This policy should already exist, but we'll recreate it to be explicit
DROP POLICY IF EXISTS lands_access_policy ON public.lands;

CREATE POLICY "lands_access_policy" 
ON public.lands 
FOR SELECT 
USING (
  -- Allow if user is tenant admin with access to this tenant
  (
    EXISTS (
      SELECT 1 FROM public.user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = lands.tenant_id
        AND ut.is_active = true
    )
  )
  OR
  -- Allow if user is the farmer who owns this land
  (farmer_id = auth.uid())
  OR
  -- Allow platform admins
  public.is_authenticated_admin()
);

-- Add comment for clarity
COMMENT ON POLICY lands_access_policy ON public.lands IS 
'Allows tenant admins to view all lands in their tenant, farmers to view their own lands, and platform admins to view all lands';