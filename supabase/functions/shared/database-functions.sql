
-- Create helper functions for RLS policies

-- Function to check if current user is an authenticated admin
CREATE OR REPLACE FUNCTION public.is_authenticated_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Check if user exists in admin_users table and is active
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() 
    AND is_active = true 
    AND role IN ('super_admin', 'platform_admin', 'admin')
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Function to allow public lead submissions (always returns true for INSERT operations)
CREATE OR REPLACE FUNCTION public.can_submit_lead()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Always allow lead submissions (this is for public inquiry forms)
  RETURN TRUE;
END;
$$;
