-- Fix RLS policies for tenant_branding and tenant_features tables
-- First, create security definer functions to prevent infinite recursion

-- Function to check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() 
    AND is_active = true 
    AND role IN ('super_admin', 'platform_admin')
  );
$$;

-- Function to check if user has access to tenant
CREATE OR REPLACE FUNCTION public.user_has_tenant_access(tenant_uuid uuid)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_tenants 
    WHERE user_id = auth.uid() 
    AND tenant_id = tenant_uuid 
    AND is_active = true
  );
$$;

-- Drop existing policies for tenant_branding
DROP POLICY IF EXISTS "Super admins can manage all tenant branding" ON public.tenant_branding;
DROP POLICY IF EXISTS "Users can access their tenant branding" ON public.tenant_branding;

-- Drop existing policies for tenant_features  
DROP POLICY IF EXISTS "Super admins can manage all tenant features" ON public.tenant_features;
DROP POLICY IF EXISTS "Users can access their tenant features" ON public.tenant_features;

-- Create new policies for tenant_branding using security definer functions
CREATE POLICY "Super admins can manage tenant branding" 
ON public.tenant_branding 
FOR ALL 
TO authenticated
USING (public.is_super_admin());

CREATE POLICY "Users can manage their tenant branding" 
ON public.tenant_branding 
FOR ALL 
TO authenticated
USING (public.user_has_tenant_access(tenant_id))
WITH CHECK (public.user_has_tenant_access(tenant_id));

-- Create new policies for tenant_features using security definer functions
CREATE POLICY "Super admins can manage tenant features" 
ON public.tenant_features 
FOR ALL 
TO authenticated
USING (public.is_super_admin());

CREATE POLICY "Users can manage their tenant features" 
ON public.tenant_features 
FOR ALL 
TO authenticated
USING (public.user_has_tenant_access(tenant_id))
WITH CHECK (public.user_has_tenant_access(tenant_id));

-- Ensure RLS is enabled on both tables
ALTER TABLE public.tenant_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_features ENABLE ROW LEVEL SECURITY;