
-- 1) Add missing enum labels to prevent invalid cast failures in policies
-- (Non-transactional in Postgres; safe to run even if values already exist)
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'platform_admin';

-- 2) Clean up subscription_plans policies so reads don't hit enum-based logic
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='subscription_plans' 
      AND policyname='Anyone can view active global plans'
  ) THEN
    DROP POLICY "Anyone can view active global plans" ON public.subscription_plans;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='subscription_plans' 
      AND policyname='Public can read active plans (global or tenant)'
  ) THEN
    DROP POLICY "Public can read active plans (global or tenant)" ON public.subscription_plans;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='subscription_plans' 
      AND policyname='Users can manage their custom plans'
  ) THEN
    DROP POLICY "Users can manage their custom plans" ON public.subscription_plans;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='subscription_plans' 
      AND policyname='super_admin_access'
  ) THEN
    DROP POLICY "super_admin_access" ON public.subscription_plans;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='subscription_plans' 
      AND policyname='tenant_admin_access'
  ) THEN
    DROP POLICY "tenant_admin_access" ON public.subscription_plans;
  END IF;
END $$;

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- A single safe SELECT policy that won’t trigger role/enum casts
CREATE POLICY "Public can read active subscription plans"
ON public.subscription_plans
FOR SELECT
TO public
USING (is_active = true);

-- 3) Harden onboarding RLS to rely on tenant membership (no enum casts)

-- Drop existing onboarding_workflows policies that may reference 'admin' indirectly
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='onboarding_workflows'
  ) THEN
    -- Drop all policies to ensure a clean slate
    EXECUTE 'ALTER TABLE public.onboarding_workflows DISABLE ROW LEVEL SECURITY';
    EXECUTE 'DO $$ BEGIN
      FOR r IN SELECT policyname FROM pg_policies 
               WHERE schemaname = ''public'' AND tablename = ''onboarding_workflows''
      LOOP
        EXECUTE ''DROP POLICY ""'' || r.policyname || ''"" ON public.onboarding_workflows'';
      END LOOP;
    END $$;';
  END IF;
END $$;

ALTER TABLE public.onboarding_workflows ENABLE ROW LEVEL SECURITY;

-- Tenant members (via user_tenants) can manage their tenant's workflows
CREATE POLICY "Tenant members can read workflows"
ON public.onboarding_workflows
FOR SELECT TO authenticated
USING (
  tenant_id IN (
    SELECT ut.tenant_id 
    FROM public.user_tenants ut
    WHERE ut.user_id = auth.uid()
      AND ut.is_active = true
  )
);

CREATE POLICY "Tenant members can manage workflows"
ON public.onboarding_workflows
FOR ALL TO authenticated
USING (
  tenant_id IN (
    SELECT ut.tenant_id 
    FROM public.user_tenants ut
    WHERE ut.user_id = auth.uid()
      AND ut.is_active = true
  )
)
WITH CHECK (
  tenant_id IN (
    SELECT ut.tenant_id 
    FROM public.user_tenants ut
    WHERE ut.user_id = auth.uid()
      AND ut.is_active = true
  )
);

-- Drop existing onboarding_steps policies that may reference 'admin' indirectly
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='onboarding_steps'
  ) THEN
    EXECUTE 'ALTER TABLE public.onboarding_steps DISABLE ROW LEVEL SECURITY';
    EXECUTE 'DO $$ BEGIN
      FOR r IN SELECT policyname FROM pg_policies 
               WHERE schemaname = ''public'' AND tablename = ''onboarding_steps''
      LOOP
        EXECUTE ''DROP POLICY ""'' || r.policyname || ''"" ON public.onboarding_steps'';
      END LOOP;
    END $$;';
  END IF;
END $$;

ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;

-- Steps are accessible if the user is a tenant member of the step's workflow tenant
CREATE POLICY "Tenant members can read steps"
ON public.onboarding_steps
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.onboarding_workflows ow
    JOIN public.user_tenants ut ON ut.tenant_id = ow.tenant_id
    WHERE ow.id = onboarding_steps.workflow_id
      AND ut.user_id = auth.uid()
      AND ut.is_active = true
  )
);

CREATE POLICY "Tenant members can manage steps"
ON public.onboarding_steps
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.onboarding_workflows ow
    JOIN public.user_tenants ut ON ut.tenant_id = ow.tenant_id
    WHERE ow.id = onboarding_steps.workflow_id
      AND ut.user_id = auth.uid()
      AND ut.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.onboarding_workflows ow
    JOIN public.user_tenants ut ON ut.tenant_id = ow.tenant_id
    WHERE ow.id = onboarding_steps.workflow_id
      AND ut.user_id = auth.uid()
      AND ut.is_active = true
  )
);
