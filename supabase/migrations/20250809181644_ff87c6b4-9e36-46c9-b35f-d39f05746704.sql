
-- 1) Allow reading active plans (tenant/global) safely without touching user_role
--    This prevents RLS evaluation from invoking subqueries that may cast invalid enum labels.
--    Policy is permissive and only for SELECT; management policies remain unchanged.
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active plans (global or tenant)"
ON public.subscription_plans
FOR SELECT
USING (is_active = true);

-- Note: We are not dropping existing policies. This additive SELECT policy avoids enum-cast paths.


-- 2) Ensure a minimal onboarding workflow exists for a tenant when needed
--    Uses your existing tables, enums and triggers. No schema changes, just a function.

CREATE OR REPLACE FUNCTION public.ensure_onboarding_workflow(p_tenant_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_workflow_id uuid;
BEGIN
  -- Authorization: caller must belong to the tenant (active association)
  IF NOT EXISTS (
    SELECT 1
    FROM public.user_tenants ut
    WHERE ut.tenant_id = p_tenant_id
      AND ut.user_id = auth.uid()
      AND ut.is_active = true
  ) THEN
    RAISE EXCEPTION 'Not authorized for tenant %', p_tenant_id USING ERRCODE = '42501';
  END IF;

  -- If workflow exists, return it
  SELECT id
  INTO v_workflow_id
  FROM public.onboarding_workflows
  WHERE tenant_id = p_tenant_id
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_workflow_id IS NOT NULL THEN
    RETURN v_workflow_id;
  END IF;

  -- Create a very simple onboarding workflow
  INSERT INTO public.onboarding_workflows (
    tenant_id,
    current_step,
    total_steps,
    status,
    started_at,
    metadata
  ) VALUES (
    p_tenant_id,
    1,
    3,
    'in_progress',
    now(),
    '{}'::jsonb
  )
  RETURNING id INTO v_workflow_id;

  -- Insert minimal steps using your onboarding_step_status enum
  INSERT INTO public.onboarding_steps (workflow_id, step_number, step_name, step_status)
  VALUES 
    (v_workflow_id, 1, 'Business Verification', 'pending'),
    (v_workflow_id, 2, 'Subscription Plan', 'pending'),
    (v_workflow_id, 3, 'Branding Configuration', 'pending');

  RETURN v_workflow_id;
END;
$$;

-- Optional: explicit execution privileges (function runs as definer; RLS enforced inside)
GRANT EXECUTE ON FUNCTION public.ensure_onboarding_workflow(uuid) TO anon, authenticated;
