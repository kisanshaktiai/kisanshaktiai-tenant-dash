-- Create helper function to get current user ID for debugging
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT auth.uid();
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_current_user_id() TO authenticated;

-- Create function to debug auth state
CREATE OR REPLACE FUNCTION public.debug_auth_state()
RETURNS TABLE (
  current_user_id uuid,
  db_user text,
  db_role text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    auth.uid() as current_user_id,
    current_user::text as db_user,
    current_setting('role')::text as db_role;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.debug_auth_state() TO authenticated;