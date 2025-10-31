-- Fix remaining tables without RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_health_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- Drop old policies if any
DO $$ DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('campaigns','tenant_branding','tenant_features','onboarding_workflows','onboarding_steps','product_categories','user_tenants','farmer_notes','crop_health_assessments','community_messages')
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- CAMPAIGNS
CREATE POLICY "campaigns_select" ON public.campaigns FOR SELECT USING (public.has_tenant_access(tenant_id));
CREATE POLICY "campaigns_insert" ON public.campaigns FOR INSERT WITH CHECK (public.has_tenant_access(tenant_id));
CREATE POLICY "campaigns_update" ON public.campaigns FOR UPDATE USING (public.has_tenant_access(tenant_id));

-- TENANT_BRANDING
CREATE POLICY "tenant_branding_select" ON public.tenant_branding FOR SELECT USING (public.has_tenant_access(tenant_id));
CREATE POLICY "tenant_branding_insert" ON public.tenant_branding FOR INSERT WITH CHECK (public.has_tenant_access(tenant_id));
CREATE POLICY "tenant_branding_update" ON public.tenant_branding FOR UPDATE USING (public.has_tenant_access(tenant_id));

-- TENANT_FEATURES
CREATE POLICY "tenant_features_select" ON public.tenant_features FOR SELECT USING (public.has_tenant_access(tenant_id));
CREATE POLICY "tenant_features_insert" ON public.tenant_features FOR INSERT WITH CHECK (public.has_tenant_access(tenant_id));
CREATE POLICY "tenant_features_update" ON public.tenant_features FOR UPDATE USING (public.has_tenant_access(tenant_id));

-- ONBOARDING_WORKFLOWS
CREATE POLICY "onboarding_workflows_select" ON public.onboarding_workflows FOR SELECT USING (public.has_tenant_access(tenant_id));
CREATE POLICY "onboarding_workflows_insert" ON public.onboarding_workflows FOR INSERT WITH CHECK (public.has_tenant_access(tenant_id));
CREATE POLICY "onboarding_workflows_update" ON public.onboarding_workflows FOR UPDATE USING (public.has_tenant_access(tenant_id));

-- ONBOARDING_STEPS  
CREATE POLICY "onboarding_steps_select" ON public.onboarding_steps FOR SELECT USING (EXISTS (SELECT 1 FROM public.onboarding_workflows WHERE id = workflow_id AND public.has_tenant_access(tenant_id)));
CREATE POLICY "onboarding_steps_insert" ON public.onboarding_steps FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.onboarding_workflows WHERE id = workflow_id AND public.has_tenant_access(tenant_id)));
CREATE POLICY "onboarding_steps_update" ON public.onboarding_steps FOR UPDATE USING (EXISTS (SELECT 1 FROM public.onboarding_workflows WHERE id = workflow_id AND public.has_tenant_access(tenant_id)));

-- PRODUCT_CATEGORIES
CREATE POLICY "product_categories_select" ON public.product_categories FOR SELECT USING (public.has_tenant_access(tenant_id));
CREATE POLICY "product_categories_insert" ON public.product_categories FOR INSERT WITH CHECK (public.has_tenant_access(tenant_id));
CREATE POLICY "product_categories_update" ON public.product_categories FOR UPDATE USING (public.has_tenant_access(tenant_id));

-- USER_TENANTS
CREATE POLICY "user_tenants_select" ON public.user_tenants FOR SELECT USING (user_id = auth.uid() OR public.has_tenant_access(tenant_id));
CREATE POLICY "user_tenants_insert" ON public.user_tenants FOR INSERT WITH CHECK (public.has_tenant_access(tenant_id));
CREATE POLICY "user_tenants_update" ON public.user_tenants FOR UPDATE USING (public.has_tenant_access(tenant_id));

-- FARMER_NOTES
CREATE POLICY "farmer_notes_select" ON public.farmer_notes FOR SELECT USING (public.has_tenant_access(tenant_id));
CREATE POLICY "farmer_notes_insert" ON public.farmer_notes FOR INSERT WITH CHECK (public.has_tenant_access(tenant_id));
CREATE POLICY "farmer_notes_update" ON public.farmer_notes FOR UPDATE USING (public.has_tenant_access(tenant_id));

-- CROP_HEALTH_ASSESSMENTS
CREATE POLICY "crop_health_assessments_select" ON public.crop_health_assessments FOR SELECT USING (public.has_tenant_access(tenant_id));
CREATE POLICY "crop_health_assessments_insert" ON public.crop_health_assessments FOR INSERT WITH CHECK (public.has_tenant_access(tenant_id));
CREATE POLICY "crop_health_assessments_update" ON public.crop_health_assessments FOR UPDATE USING (public.has_tenant_access(tenant_id));

-- COMMUNITY_MESSAGES
CREATE POLICY "community_messages_select" ON public.community_messages FOR SELECT USING (public.has_tenant_access(tenant_id));