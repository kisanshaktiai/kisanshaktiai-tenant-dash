-- Core Security Fix - RLS Policies Only
-- Helper function for tenant access
CREATE OR REPLACE FUNCTION public.has_tenant_access(check_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.user_tenants WHERE user_id = auth.uid() AND tenant_id = check_tenant_id AND is_active = true);
EXCEPTION WHEN OTHERS THEN RETURN FALSE;
END;
$$;

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ndvi_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$ DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('tenants','farmers','user_profiles','lands','products','dealers','soil_health','ndvi_data')
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- TENANTS Policies
CREATE POLICY "tenants_select" ON public.tenants FOR SELECT USING (public.has_tenant_access(id));
CREATE POLICY "tenants_update" ON public.tenants FOR UPDATE USING (public.has_tenant_access(id));

-- FARMERS Policies  
CREATE POLICY "farmers_select" ON public.farmers FOR SELECT USING (public.has_tenant_access(tenant_id));
CREATE POLICY "farmers_insert" ON public.farmers FOR INSERT WITH CHECK (public.has_tenant_access(tenant_id));
CREATE POLICY "farmers_update" ON public.farmers FOR UPDATE USING (public.has_tenant_access(tenant_id));
CREATE POLICY "farmers_delete" ON public.farmers FOR DELETE USING (public.has_tenant_access(tenant_id));

-- USER_PROFILES Policies
CREATE POLICY "user_profiles_select" ON public.user_profiles FOR SELECT USING (id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_tenants ut1 JOIN public.user_tenants ut2 ON ut1.tenant_id = ut2.tenant_id WHERE ut1.user_id = auth.uid() AND ut2.user_id = public.user_profiles.id));
CREATE POLICY "user_profiles_insert" ON public.user_profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "user_profiles_update" ON public.user_profiles FOR UPDATE USING (id = auth.uid());

-- LANDS Policies
CREATE POLICY "lands_select" ON public.lands FOR SELECT USING (public.has_tenant_access(tenant_id));
CREATE POLICY "lands_insert" ON public.lands FOR INSERT WITH CHECK (public.has_tenant_access(tenant_id));
CREATE POLICY "lands_update" ON public.lands FOR UPDATE USING (public.has_tenant_access(tenant_id));
CREATE POLICY "lands_delete" ON public.lands FOR DELETE USING (public.has_tenant_access(tenant_id));

-- PRODUCTS Policies
CREATE POLICY "products_select" ON public.products FOR SELECT USING (public.has_tenant_access(tenant_id));
CREATE POLICY "products_insert" ON public.products FOR INSERT WITH CHECK (public.has_tenant_access(tenant_id));
CREATE POLICY "products_update" ON public.products FOR UPDATE USING (public.has_tenant_access(tenant_id));
CREATE POLICY "products_delete" ON public.products FOR DELETE USING (public.has_tenant_access(tenant_id));

-- DEALERS Policies
CREATE POLICY "dealers_select" ON public.dealers FOR SELECT USING (public.has_tenant_access(tenant_id));
CREATE POLICY "dealers_insert" ON public.dealers FOR INSERT WITH CHECK (public.has_tenant_access(tenant_id));
CREATE POLICY "dealers_update" ON public.dealers FOR UPDATE USING (public.has_tenant_access(tenant_id));
CREATE POLICY "dealers_delete" ON public.dealers FOR DELETE USING (public.has_tenant_access(tenant_id));

-- SOIL_HEALTH Policies
CREATE POLICY "soil_health_select" ON public.soil_health FOR SELECT USING (public.has_tenant_access(tenant_id));
CREATE POLICY "soil_health_insert" ON public.soil_health FOR INSERT WITH CHECK (public.has_tenant_access(tenant_id));
CREATE POLICY "soil_health_update" ON public.soil_health FOR UPDATE USING (public.has_tenant_access(tenant_id));

-- NDVI_DATA Policies  
CREATE POLICY "ndvi_data_select" ON public.ndvi_data FOR SELECT USING (public.has_tenant_access(tenant_id));
CREATE POLICY "ndvi_data_insert" ON public.ndvi_data FOR INSERT WITH CHECK (public.has_tenant_access(tenant_id));
CREATE POLICY "ndvi_data_update" ON public.ndvi_data FOR UPDATE USING (public.has_tenant_access(tenant_id));

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.has_tenant_access(UUID) TO authenticated;