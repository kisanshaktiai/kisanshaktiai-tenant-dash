
-- 1) Add 'admin' to the user_role enum if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'user_role'
      AND e.enumlabel = 'admin'
  ) THEN
    ALTER TYPE public.user_role ADD VALUE 'admin';
  END IF;
END $$;

-- 2) Ensure subscription_plans is readable without role-casting failures
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'subscription_plans'
      AND polname = 'Public can view active plans'
  ) THEN
    CREATE POLICY "Public can view active plans"
      ON public.subscription_plans
      FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

-- 3) Membership-based RLS for onboarding_workflows and onboarding_steps
--    (No enum-casting from claims; use user_tenants membership instead)

-- Onboarding workflows: members of the tenant can read
ALTER TABLE public.onboarding_workflows ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname='public'
       AND tablename='onboarding_workflows'
       AND polname='Members can view workflows'
  ) THEN
    CREATE POLICY "Members can view workflows"
      ON public.onboarding_workflows
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.user_tenants ut
          WHERE ut.user_id = auth.uid()
            AND ut.tenant_id = onboarding_workflows.tenant_id
            AND ut.is_active = true
        )
      );
  END IF;
END $$;

-- Onboarding steps: members of the tenant can read steps
ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname='public'
       AND tablename='onboarding_steps'
       AND polname='Members can view steps'
  ) THEN
    CREATE POLICY "Members can view steps"
      ON public.onboarding_steps
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.onboarding_workflows w
          JOIN public.user_tenants ut
            ON ut.tenant_id = w.tenant_id
          WHERE w.id = onboarding_steps.workflow_id
            AND ut.user_id = auth.uid()
            AND ut.is_active = true
        )
      );
  END IF;
END $$;

-- Onboarding steps: tenant_admins and tenant_owners can update steps
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname='public'
       AND tablename='onboarding_steps'
       AND polname='Admins can update steps'
  ) THEN
    CREATE POLICY "Admins can update steps"
      ON public.onboarding_steps
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1
          FROM public.onboarding_workflows w
          JOIN public.user_tenants ut
            ON ut.tenant_id = w.tenant_id
          WHERE w.id = onboarding_steps.workflow_id
            AND ut.user_id = auth.uid()
            AND ut.is_active = true
            AND ut.role IN ('tenant_owner', 'tenant_admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.onboarding_workflows w
          JOIN public.user_tenants ut
            ON ut.tenant_id = w.tenant_id
          WHERE w.id = onboarding_steps.workflow_id
            AND ut.user_id = auth.uid()
            AND ut.is_active = true
            AND ut.role IN ('tenant_owner', 'tenant_admin')
        )
      );
  END IF;
END $$;
