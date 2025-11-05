-- Add critical performance indexes for farmers, lands, and products tables

-- Farmers table indexes
CREATE INDEX IF NOT EXISTS idx_farmers_tenant_id_created_at 
  ON farmers(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_farmers_mobile_tenant 
  ON farmers(mobile_number, tenant_id);

CREATE INDEX IF NOT EXISTS idx_farmers_search 
  ON farmers USING gin(to_tsvector('english', COALESCE(farmer_name, '')));

-- Lands table indexes
CREATE INDEX IF NOT EXISTS idx_lands_farmer_tenant 
  ON lands(farmer_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_lands_geom 
  ON lands USING gist(boundary_geom);

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_category_tenant 
  ON products(category_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_products_active 
  ON products(tenant_id, is_active, availability_status);