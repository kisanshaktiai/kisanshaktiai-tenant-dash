-- Add agricultural-specific columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS product_type text DEFAULT 'general',
ADD COLUMN IF NOT EXISTS is_organic boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS active_ingredients jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS dosage_instructions text,
ADD COLUMN IF NOT EXISTS application_method text,
ADD COLUMN IF NOT EXISTS safety_precautions text,
ADD COLUMN IF NOT EXISTS target_pests jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS target_diseases jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS suitable_crops jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS nutrient_composition jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ph_range text,
ADD COLUMN IF NOT EXISTS solubility text,
ADD COLUMN IF NOT EXISTS waiting_period_days integer,
ADD COLUMN IF NOT EXISTS shelf_life_months integer,
ADD COLUMN IF NOT EXISTS storage_conditions text,
ADD COLUMN IF NOT EXISTS manufacturer text,
ADD COLUMN IF NOT EXISTS batch_number text,
ADD COLUMN IF NOT EXISTS manufacturing_date date,
ADD COLUMN IF NOT EXISTS expiry_date date,
ADD COLUMN IF NOT EXISTS certification_details jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS minimum_stock_level integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS reorder_point integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_restocked_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS stock_movement_history jsonb DEFAULT '[]';

-- Create product categories table for better organization
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_category_id UUID REFERENCES public.product_categories(id),
  category_type TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for product_categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_categories
CREATE POLICY "Tenant isolation for product_categories" ON public.product_categories
FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Create stock_movements table for tracking inventory
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id),
  movement_type TEXT NOT NULL, -- 'in', 'out', 'adjustment'
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT,
  reference_number TEXT,
  performed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for stock_movements
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for stock_movements
CREATE POLICY "Tenant isolation for stock_movements" ON public.stock_movements
FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_product_type ON public.products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_is_organic ON public.products(is_organic);
CREATE INDEX IF NOT EXISTS idx_products_tenant_category ON public.products(tenant_id, category_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant ON public.stock_movements(tenant_id);

-- Add trigger to update stock in products table when movement is recorded
CREATE OR REPLACE FUNCTION update_product_stock_on_movement()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET 
    stock_quantity = NEW.new_stock,
    updated_at = now()
  WHERE id = NEW.product_id;
  
  -- Check if stock is below reorder point
  IF NEW.new_stock <= (SELECT reorder_point FROM public.products WHERE id = NEW.product_id) THEN
    -- You can add notification logic here in future
    RAISE NOTICE 'Product % stock below reorder point', NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_stock
AFTER INSERT ON public.stock_movements
FOR EACH ROW
EXECUTE FUNCTION update_product_stock_on_movement();