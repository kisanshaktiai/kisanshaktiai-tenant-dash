-- Phase 1: Create Task-Product Mapping Table
CREATE TABLE IF NOT EXISTS public.task_product_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  product_type TEXT NOT NULL,
  product_category TEXT,
  recommended_product_ids UUID[],
  quantity_multiplier DECIMAL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.task_product_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their tenant's task-product mappings"
  ON public.task_product_mappings FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM public.user_tenants WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage task-product mappings"
  ON public.task_product_mappings FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM public.user_tenants 
    WHERE user_id = auth.uid() AND role IN ('tenant_admin', 'tenant_manager', 'tenant_owner')
  ));

-- Create indexes
CREATE INDEX idx_task_product_mappings_tenant ON public.task_product_mappings(tenant_id);
CREATE INDEX idx_task_product_mappings_task_type ON public.task_product_mappings(task_type);

-- Seed initial mappings
INSERT INTO public.task_product_mappings (tenant_id, task_type, product_type, product_category, quantity_multiplier) 
SELECT id as tenant_id, 'fertilizer', 'fertilizer', 'Agricultural Inputs', 1.0 FROM public.tenants;

INSERT INTO public.task_product_mappings (tenant_id, task_type, product_type, product_category, quantity_multiplier) 
SELECT id as tenant_id, 'pesticide', 'pesticide', 'Agricultural Inputs', 1.0 FROM public.tenants;

INSERT INTO public.task_product_mappings (tenant_id, task_type, product_type, product_category, quantity_multiplier) 
SELECT id as tenant_id, 'irrigation', 'water_management', 'Equipment', 1.0 FROM public.tenants;

-- Create Materialized View for Upcoming Farmer Needs
CREATE MATERIALIZED VIEW IF NOT EXISTS public.farmer_upcoming_needs AS
SELECT 
  cs.tenant_id,
  cs.farmer_id,
  cs.crop_name,
  cs.crop_variety,
  st.id as task_id,
  st.task_date,
  st.task_type,
  st.task_name,
  st.resources,
  st.estimated_cost,
  st.status,
  f.farmer_name,
  f.mobile_number,
  f.location,
  (st.task_date - CURRENT_DATE)::NUMERIC as days_until_task
FROM public.schedule_tasks st
JOIN public.crop_schedules cs ON st.schedule_id = cs.id
JOIN public.farmers f ON cs.farmer_id = f.id
WHERE st.status IN ('pending', 'scheduled')
  AND st.task_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days'
  AND cs.is_active = true
ORDER BY st.task_date, cs.tenant_id;

-- Create index on materialized view
CREATE INDEX idx_farmer_upcoming_needs_tenant ON public.farmer_upcoming_needs(tenant_id);
CREATE INDEX idx_farmer_upcoming_needs_task_date ON public.farmer_upcoming_needs(task_date);
CREATE INDEX idx_farmer_upcoming_needs_farmer ON public.farmer_upcoming_needs(farmer_id);
CREATE INDEX idx_farmer_upcoming_needs_task_type ON public.farmer_upcoming_needs(task_type);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION public.refresh_farmer_upcoming_needs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.farmer_upcoming_needs;
END;
$$;

-- Create function to calculate aggregate product demand
CREATE OR REPLACE FUNCTION public.calculate_product_demand(
  p_tenant_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  product_type TEXT,
  total_quantity DECIMAL,
  task_count BIGINT,
  farmer_count BIGINT,
  earliest_date DATE,
  avg_cost DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tpm.product_type,
    SUM(
      COALESCE(
        (fun.resources->>'quantity')::DECIMAL * tpm.quantity_multiplier,
        tpm.quantity_multiplier
      )
    ) as total_quantity,
    COUNT(DISTINCT fun.task_id) as task_count,
    COUNT(DISTINCT fun.farmer_id) as farmer_count,
    MIN(fun.task_date)::DATE as earliest_date,
    AVG(fun.estimated_cost) as avg_cost
  FROM public.farmer_upcoming_needs fun
  LEFT JOIN public.task_product_mappings tpm 
    ON fun.task_type = tpm.task_type 
    AND fun.tenant_id = tpm.tenant_id
  WHERE fun.tenant_id = p_tenant_id
    AND fun.days_until_task <= p_days
    AND fun.days_until_task >= 0
  GROUP BY tpm.product_type
  ORDER BY total_quantity DESC;
END;
$$;

-- Create function to get inventory gap analysis
CREATE OR REPLACE FUNCTION public.get_inventory_gap(
  p_tenant_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  product_type TEXT,
  current_stock DECIMAL,
  predicted_demand DECIMAL,
  shortfall DECIMAL,
  reorder_needed BOOLEAN,
  urgency_level TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH demand_calc AS (
    SELECT * FROM public.calculate_product_demand(p_tenant_id, p_days)
  )
  SELECT 
    p.id as product_id,
    p.name as product_name,
    p.product_type,
    COALESCE(p.stock_quantity, 0)::DECIMAL as current_stock,
    COALESCE(dc.total_quantity, 0)::DECIMAL as predicted_demand,
    (COALESCE(p.stock_quantity, 0) - COALESCE(dc.total_quantity, 0))::DECIMAL as shortfall,
    CASE 
      WHEN COALESCE(p.stock_quantity, 0) < COALESCE(dc.total_quantity, 0) THEN true
      ELSE false
    END as reorder_needed,
    CASE 
      WHEN COALESCE(p.stock_quantity, 0) < COALESCE(dc.total_quantity, 0) * 0.5 THEN 'critical'
      WHEN COALESCE(p.stock_quantity, 0) < COALESCE(dc.total_quantity, 0) THEN 'high'
      WHEN COALESCE(p.stock_quantity, 0) < COALESCE(dc.total_quantity, 0) * 1.2 THEN 'medium'
      ELSE 'low'
    END as urgency_level
  FROM public.products p
  LEFT JOIN demand_calc dc ON p.product_type = dc.product_type
  WHERE p.tenant_id = p_tenant_id
    AND p.is_active = true
  ORDER BY 
    CASE urgency_level
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      ELSE 4
    END,
    shortfall ASC;
END;
$$;

-- Add indexes for performance on schedule_tasks
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_date_status 
  ON public.schedule_tasks(task_date, status) 
  WHERE status IN ('pending', 'scheduled');

CREATE INDEX IF NOT EXISTS idx_schedule_tasks_type 
  ON public.schedule_tasks(task_type);

-- Create trigger to auto-update task_product_mappings updated_at
CREATE OR REPLACE FUNCTION public.update_task_mappings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_task_mappings_timestamp
  BEFORE UPDATE ON public.task_product_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_task_mappings_updated_at();