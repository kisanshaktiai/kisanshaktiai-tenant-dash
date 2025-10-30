-- Create MGRS tiles lookup table for India
CREATE TABLE IF NOT EXISTS public.mgrs_tiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tile_id VARCHAR(6) NOT NULL UNIQUE, -- e.g., "43RFN"
  geometry geometry(Polygon, 4326) NOT NULL,
  is_agri BOOLEAN DEFAULT false,
  state VARCHAR(100),
  district VARCHAR(100),
  agri_area_km2 NUMERIC(10,2),
  total_area_km2 NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create spatial index for faster queries
CREATE INDEX IF NOT EXISTS idx_mgrs_tiles_geometry ON public.mgrs_tiles USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_mgrs_tiles_is_agri ON public.mgrs_tiles(is_agri) WHERE is_agri = true;

-- Create satellite tiles cache table
CREATE TABLE IF NOT EXISTS public.satellite_tiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tile_id VARCHAR(6) NOT NULL REFERENCES public.mgrs_tiles(tile_id),
  acquisition_date DATE NOT NULL,
  collection VARCHAR(50) NOT NULL DEFAULT 'sentinel-2-l2a',
  cloud_cover NUMERIC(5,2),
  ndvi_path TEXT, -- path in Supabase Storage
  red_band_path TEXT,
  nir_band_path TEXT,
  raw_paths JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  file_size_mb NUMERIC(10,2),
  checksum VARCHAR(64),
  processing_level VARCHAR(20) DEFAULT 'L2A',
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  tenant_id UUID REFERENCES public.tenants(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tile_id, acquisition_date, collection)
);

-- Create indexes for satellite_tiles
CREATE INDEX IF NOT EXISTS idx_satellite_tiles_tile_date ON public.satellite_tiles(tile_id, acquisition_date DESC);
CREATE INDEX IF NOT EXISTS idx_satellite_tiles_status ON public.satellite_tiles(status);
CREATE INDEX IF NOT EXISTS idx_satellite_tiles_tenant ON public.satellite_tiles(tenant_id) WHERE tenant_id IS NOT NULL;

-- Create system jobs table for tracking processing
CREATE TABLE IF NOT EXISTS public.system_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_type VARCHAR(50) NOT NULL, -- 'tile_harvest', 'land_clipping', 'composite_generation'
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed, cancelled
  tenant_id UUID REFERENCES public.tenants(id),
  target_id UUID, -- could be tile_id, land_id, etc.
  target_type VARCHAR(50), -- 'tile', 'land', 'tenant'
  parameters JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  error_details JSONB,
  progress INTEGER DEFAULT 0, -- 0-100
  result JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for system_jobs
CREATE INDEX IF NOT EXISTS idx_system_jobs_tenant ON public.system_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_system_jobs_status ON public.system_jobs(status);
CREATE INDEX IF NOT EXISTS idx_system_jobs_type_status ON public.system_jobs(job_type, status);
CREATE INDEX IF NOT EXISTS idx_system_jobs_created_at ON public.system_jobs(created_at DESC);

-- Create harvest queue table for managing tile processing
CREATE TABLE IF NOT EXISTS public.harvest_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  tile_id VARCHAR(6) NOT NULL REFERENCES public.mgrs_tiles(tile_id),
  priority INTEGER DEFAULT 5, -- 1-10, lower is higher priority
  requested_date DATE,
  status VARCHAR(20) DEFAULT 'queued', -- queued, processing, completed, failed
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  job_id UUID REFERENCES public.system_jobs(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_harvest_queue_status_priority ON public.harvest_queue(status, priority, created_at);
CREATE INDEX IF NOT EXISTS idx_harvest_queue_tenant ON public.harvest_queue(tenant_id);

-- Create function to get tiles for tenant lands
CREATE OR REPLACE FUNCTION public.get_tenant_tiles(p_tenant_id UUID)
RETURNS TABLE(tile_id VARCHAR, land_count INTEGER, total_area_ha NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mt.tile_id,
    COUNT(DISTINCT l.id)::INTEGER as land_count,
    SUM(l.land_size)::NUMERIC as total_area_ha
  FROM public.lands l
  JOIN public.mgrs_tiles mt ON ST_Intersects(l.geometry, mt.geometry)
  WHERE l.tenant_id = p_tenant_id
    AND l.is_active = true
  GROUP BY mt.tile_id
  ORDER BY land_count DESC;
END;
$$;

-- Create function to check harvest quota
CREATE OR REPLACE FUNCTION public.check_harvest_quota(p_tenant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_monthly_limit INTEGER;
  v_current_usage INTEGER;
  v_subscription_plan TEXT;
BEGIN
  -- Get tenant subscription plan
  SELECT subscription_plan INTO v_subscription_plan
  FROM public.tenants
  WHERE id = p_tenant_id;
  
  -- Set limits based on plan
  v_monthly_limit := CASE 
    WHEN v_subscription_plan = 'AI_Enterprise' THEN 1000
    WHEN v_subscription_plan = 'Shakti_Growth' THEN 500
    ELSE 100 -- Kisan_Basic
  END;
  
  -- Count current month usage
  SELECT COUNT(*) INTO v_current_usage
  FROM public.system_jobs
  WHERE tenant_id = p_tenant_id
    AND job_type = 'tile_harvest'
    AND created_at >= date_trunc('month', CURRENT_DATE)
    AND status IN ('completed', 'running');
  
  v_result := jsonb_build_object(
    'monthly_limit', v_monthly_limit,
    'current_usage', v_current_usage,
    'remaining', v_monthly_limit - v_current_usage,
    'can_harvest', v_current_usage < v_monthly_limit,
    'reset_date', date_trunc('month', CURRENT_DATE) + interval '1 month'
  );
  
  RETURN v_result;
END;
$$;

-- Enable Row Level Security
ALTER TABLE public.mgrs_tiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_tiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.harvest_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mgrs_tiles (public read)
CREATE POLICY "Anyone can view MGRS tiles" ON public.mgrs_tiles
  FOR SELECT USING (true);

-- RLS Policies for satellite_tiles (tenant isolated or public tiles)
CREATE POLICY "Tenants can view their tiles or public tiles" ON public.satellite_tiles
  FOR SELECT USING (
    tenant_id IS NULL OR 
    tenant_id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Service role can manage satellite tiles" ON public.satellite_tiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for system_jobs (tenant isolated)
CREATE POLICY "Tenants can view their jobs" ON public.system_jobs
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Tenants can create jobs" ON public.system_jobs
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Service role can manage jobs" ON public.system_jobs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for harvest_queue
CREATE POLICY "Tenants can view their queue items" ON public.harvest_queue
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Tenants can create queue items" ON public.harvest_queue
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Service role can manage queue" ON public.harvest_queue
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mgrs_tiles_updated_at BEFORE UPDATE ON public.mgrs_tiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_satellite_tiles_updated_at BEFORE UPDATE ON public.satellite_tiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_jobs_updated_at BEFORE UPDATE ON public.system_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_harvest_queue_updated_at BEFORE UPDATE ON public.harvest_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();