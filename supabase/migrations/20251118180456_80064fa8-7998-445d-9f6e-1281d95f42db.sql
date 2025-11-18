-- Phase 2: Fix RLS Policies for user_tenants table
-- This allows users to fetch their tenants based ONLY on user_id match
-- which fixes the chicken-and-egg problem with JWT synchronization

-- Drop existing policy
DROP POLICY IF EXISTS "user_tenants_select" ON user_tenants;

-- Create simplified SELECT policy that only requires user_id match
CREATE POLICY "user_tenants_select_simplified" ON user_tenants
  FOR SELECT
  USING (user_id = auth.uid());

-- Keep other policies strict for security
-- UPDATE policy: Allow users to update their own tenant associations
DROP POLICY IF EXISTS "user_tenants_update" ON user_tenants;
CREATE POLICY "user_tenants_update" ON user_tenants
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- INSERT policy: Allow users to insert their own tenant associations
DROP POLICY IF EXISTS "user_tenants_insert" ON user_tenants;
CREATE POLICY "user_tenants_insert" ON user_tenants
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- DELETE policy: Allow users to delete their own tenant associations
DROP POLICY IF EXISTS "user_tenants_delete" ON user_tenants;
CREATE POLICY "user_tenants_delete" ON user_tenants
  FOR DELETE
  USING (user_id = auth.uid());

-- Add diagnostic function to check JWT status
CREATE OR REPLACE FUNCTION public.debug_jwt_status()
RETURNS TABLE (
  current_user_id uuid,
  jwt_present boolean,
  jwt_exp timestamp with time zone,
  is_expired boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.uid() as current_user_id,
    auth.uid() IS NOT NULL as jwt_present,
    to_timestamp(COALESCE((current_setting('request.jwt.claims', true)::json->>'exp')::bigint, 0)) as jwt_exp,
    to_timestamp(COALESCE((current_setting('request.jwt.claims', true)::json->>'exp')::bigint, 0)) < now() as is_expired;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.debug_jwt_status() TO authenticated;