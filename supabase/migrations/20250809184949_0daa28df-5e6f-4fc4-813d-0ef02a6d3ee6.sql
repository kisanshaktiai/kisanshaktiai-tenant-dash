
-- Fix RLS policies that contain invalid enum references
-- Drop existing policies that reference 'admin' role which doesn't exist in user_role enum

-- Fix tenant_features policies
DROP POLICY IF EXISTS "Tenant users can manage their features" ON public.tenant_features;
CREATE POLICY "Tenant users can manage their features" ON public.tenant_features
FOR ALL USING (
  tenant_id IN (
    SELECT ut.tenant_id 
    FROM user_tenants ut 
    WHERE ut.user_id = auth.uid() 
    AND ut.is_active = true 
    AND ut.role IN ('tenant_owner', 'tenant_admin')
  )
);

-- Fix tenant_branding policies
DROP POLICY IF EXISTS "Tenant users can manage their branding" ON public.tenant_branding;
CREATE POLICY "Tenant users can manage their branding" ON public.tenant_branding
FOR ALL USING (
  tenant_id IN (
    SELECT ut.tenant_id 
    FROM user_tenants ut 
    WHERE ut.user_id = auth.uid() 
    AND ut.is_active = true 
    AND ut.role IN ('tenant_owner', 'tenant_admin')
  )
);

-- Fix tenant_subscriptions policies
DROP POLICY IF EXISTS "Tenant users can manage their subscriptions" ON public.tenant_subscriptions;
CREATE POLICY "Tenant users can manage their subscriptions" ON public.tenant_subscriptions
FOR ALL USING (
  tenant_id IN (
    SELECT ut.tenant_id 
    FROM user_tenants ut 
    WHERE ut.user_id = auth.uid() 
    AND ut.is_active = true 
    AND ut.role IN ('tenant_owner', 'tenant_admin')
  )
);

-- Fix any tenant_settings policies if they exist
DROP POLICY IF EXISTS "Tenant users can manage their settings" ON public.tenant_settings;

-- Ensure onboarding_steps and onboarding_workflows have proper policies
DROP POLICY IF EXISTS "Tenant users can manage onboarding steps" ON public.onboarding_steps;
CREATE POLICY "Tenant users can manage onboarding steps" ON public.onboarding_steps
FOR ALL USING (
  workflow_id IN (
    SELECT ow.id 
    FROM onboarding_workflows ow
    JOIN user_tenants ut ON ow.tenant_id = ut.tenant_id
    WHERE ut.user_id = auth.uid() 
    AND ut.is_active = true
  )
);

DROP POLICY IF EXISTS "Tenant users can manage onboarding workflows" ON public.onboarding_workflows;
CREATE POLICY "Tenant users can manage onboarding workflows" ON public.onboarding_workflows
FOR ALL USING (
  tenant_id IN (
    SELECT ut.tenant_id 
    FROM user_tenants ut 
    WHERE ut.user_id = auth.uid() 
    AND ut.is_active = true
  )
);

-- Ensure subscription_plans can be read by authenticated users
DROP POLICY IF EXISTS "Users can view subscription plans" ON public.subscription_plans;
CREATE POLICY "Users can view subscription plans" ON public.subscription_plans
FOR SELECT USING (is_active = true);
