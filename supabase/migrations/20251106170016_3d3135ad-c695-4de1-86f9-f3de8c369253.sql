-- Drop existing functions before recreating with new signatures
DROP FUNCTION IF EXISTS public.calculate_product_demand(UUID, INTEGER);
DROP FUNCTION IF EXISTS public.get_inventory_gap(UUID, INTEGER);

-- Helper function to extract numeric quantities from resources JSONB
CREATE OR REPLACE FUNCTION public.extract_numeric_quantity(
  resources JSONB,
  task_type TEXT
) RETURNS DECIMAL
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  qty DECIMAL;
  qty_text TEXT;
BEGIN
  -- First, try structured fields based on task type
  qty := CASE task_type
    WHEN 'fertilizer' THEN (resources->>'fertilizer_kg')::DECIMAL
    WHEN 'pesticide' THEN (resources->>'pesticide_ml')::DECIMAL
    WHEN 'irrigation' THEN (resources->>'water_liters')::DECIMAL
    ELSE NULL
  END;
  
  -- If found, return it
  IF qty IS NOT NULL THEN
    RETURN qty;
  END IF;
  
  -- Try to extract from quantity field
  qty_text := resources->>'quantity';
  IF qty_text IS NOT NULL AND qty_text != '' THEN
    -- Extract first number from text (handles "77 kg", "3-5 liters", etc.)
    qty_text := regexp_replace(qty_text, '[^0-9.]', '', 'g');
    IF qty_text != '' THEN
      RETURN qty_text::DECIMAL;
    END IF;
  END IF;
  
  -- No quantity found
  RETURN NULL;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Create calculate_product_demand function with proper quantity extraction
CREATE OR REPLACE FUNCTION public.calculate_product_demand(
  p_tenant_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  product_type TEXT,
  predicted_demand DECIMAL,
  urgency_level TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tpm.product_type,
    COALESCE(
      SUM(
        COALESCE(
          public.extract_numeric_quantity(fun.resources, tpm.task_type),
          tpm.quantity_multiplier,
          1
        ) * tpm.quantity_multiplier
      ),
      0
    ) as predicted_demand,
    CASE 
      WHEN MIN(fun.days_until_task) <= 3 THEN 'urgent'
      WHEN MIN(fun.days_until_task) <= 7 THEN 'high'
      WHEN MIN(fun.days_until_task) <= 14 THEN 'medium'
      ELSE 'low'
    END as urgency_level
  FROM public.farmer_upcoming_needs fun
  INNER JOIN public.task_product_mappings tpm 
    ON fun.task_type = tpm.task_type
  WHERE fun.tenant_id = p_tenant_id
    AND fun.days_until_task <= p_days
  GROUP BY tpm.product_type
  ORDER BY urgency_level DESC, predicted_demand DESC;
END;
$$;

-- Create get_inventory_gap function with proper quantity extraction
CREATE OR REPLACE FUNCTION public.get_inventory_gap(
  p_tenant_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  product_type TEXT,
  current_stock DECIMAL,
  predicted_demand DECIMAL,
  gap DECIMAL,
  gap_percentage DECIMAL,
  urgency_level TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH demand AS (
    SELECT * FROM public.calculate_product_demand(p_tenant_id, p_days)
  ),
  inventory AS (
    SELECT 
      p.product_type,
      COALESCE(SUM(p.quantity_in_stock), 0) as current_stock
    FROM public.products p
    WHERE p.tenant_id = p_tenant_id
      AND p.is_active = true
    GROUP BY p.product_type
  )
  SELECT 
    COALESCE(d.product_type, i.product_type) as product_type,
    COALESCE(i.current_stock, 0) as current_stock,
    COALESCE(d.predicted_demand, 0) as predicted_demand,
    COALESCE(d.predicted_demand, 0) - COALESCE(i.current_stock, 0) as gap,
    CASE 
      WHEN COALESCE(i.current_stock, 0) = 0 THEN 100
      ELSE ROUND(((COALESCE(d.predicted_demand, 0) - COALESCE(i.current_stock, 0)) / NULLIF(i.current_stock, 0) * 100)::NUMERIC, 2)
    END as gap_percentage,
    COALESCE(d.urgency_level, 'low') as urgency_level
  FROM demand d
  FULL OUTER JOIN inventory i 
    ON d.product_type = i.product_type
  WHERE COALESCE(d.predicted_demand, 0) - COALESCE(i.current_stock, 0) > 0
  ORDER BY gap DESC;
END;
$$;

-- Refresh the materialized view to ensure latest data
REFRESH MATERIALIZED VIEW public.farmer_upcoming_needs;