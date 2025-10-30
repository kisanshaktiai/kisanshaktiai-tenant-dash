-- Fix critical security issue: Tenants table publicly accessible
-- This migration restricts access to tenant data to prevent competitors from accessing sensitive business information

-- First, ensure RLS is enabled on the tenants table
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Drop any existing overly permissive policies that might allow public access
DROP POLICY IF EXISTS "Public users can view tenants" ON public.tenants;
DROP POLICY IF EXISTS "Anyone can view tenants" ON public.tenants;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tenants;

-- Create secure RLS policies for the tenants table

-- Policy 1: Users can only view tenants they belong to
CREATE POLICY "Users can view their own tenants"
ON public.tenants
FOR SELECT
USING (
  id IN (
    SELECT tenant_id 
    FROM public.user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- Policy 2: Users can update tenants where they are owners or admins
CREATE POLICY "Tenant owners and admins can update their tenant"
ON public.tenants
FOR UPDATE
USING (
  id IN (
    SELECT tenant_id 
    FROM public.user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true
    AND role IN ('tenant_owner', 'tenant_admin')
  )
);

-- Policy 3: Super admins can view all tenants (for platform management)
CREATE POLICY "Super admins can view all tenants"
ON public.tenants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'platform_admin')
    AND is_active = true
  )
);

-- Policy 4: Super admins can manage all tenants
CREATE POLICY "Super admins can manage all tenants"
ON public.tenants
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
    AND is_active = true
  )
);

-- Ensure no tenant data can be inserted by regular users directly
-- (tenants should only be created through proper registration flows)
CREATE POLICY "Prevent direct tenant insertion"
ON public.tenants
FOR INSERT
WITH CHECK (false);

-- Add indexes for performance on frequently queried columns used in RLS
CREATE INDEX IF NOT EXISTS idx_user_tenants_user_id ON public.user_tenants(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_tenants_tenant_id ON public.user_tenants(tenant_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_admin_users_id_role ON public.admin_users(id, role) WHERE is_active = true;

-- Verify that sensitive columns are not exposed in any public views
-- Check for any public functions that might bypass RLS
COMMENT ON TABLE public.tenants IS 'Contains sensitive business information - protected by RLS. Access restricted to authenticated users with proper tenant membership.';