-- Task 1: Schema Alignment for Master Data Import System (Corrected)

-- 1. Alter product_categories to match master_product_categories schema
ALTER TABLE product_categories
ADD COLUMN IF NOT EXISTS icon text,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS master_category_id uuid REFERENCES master_product_categories(id),
ADD COLUMN IF NOT EXISTS import_metadata jsonb DEFAULT '{}'::jsonb;

-- Add index for master_category_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_categories_master_id ON product_categories(master_category_id);

-- Add comment
COMMENT ON COLUMN product_categories.master_category_id IS 'Reference to master catalog category if imported';
COMMENT ON COLUMN product_categories.import_metadata IS 'Metadata about import: timestamp, user, source';

-- 2. Alter products to add master product reference and enhanced fields
ALTER TABLE products
ADD COLUMN IF NOT EXISTS master_product_id uuid REFERENCES master_products(id),
ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES master_companies(id),
ADD COLUMN IF NOT EXISTS import_metadata jsonb DEFAULT '{}'::jsonb;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_master_id ON products(master_product_id);
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);

-- Add comments
COMMENT ON COLUMN products.master_product_id IS 'Reference to master catalog product if imported';
COMMENT ON COLUMN products.company_id IS 'Reference to master company (manufacturer/distributor)';
COMMENT ON COLUMN products.import_metadata IS 'Metadata about import: timestamp, user, source, custom mappings';

-- 3. Create product_import_history table for tracking imports
CREATE TABLE IF NOT EXISTS product_import_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  import_type text NOT NULL CHECK (import_type IN ('category', 'product', 'bulk')),
  imported_by uuid REFERENCES auth.users(id),
  items_imported integer DEFAULT 0,
  items_updated integer DEFAULT 0,
  items_failed integer DEFAULT 0,
  items_skipped integer DEFAULT 0,
  source text DEFAULT 'master_catalog',
  metadata jsonb DEFAULT '{}'::jsonb,
  error_log jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS on import history
ALTER TABLE product_import_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for import history
CREATE POLICY "Users can view their tenant's import history"
  ON product_import_history FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant admins and managers can create import history"
  ON product_import_history FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT ut.tenant_id FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
      AND ut.role IN ('tenant_admin', 'tenant_manager', 'tenant_owner')
    )
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_import_history_tenant ON product_import_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_import_history_created ON product_import_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_history_type ON product_import_history(import_type);

-- Add comments
COMMENT ON TABLE product_import_history IS 'Tracks all imports from master catalog to tenant product tables';
COMMENT ON COLUMN product_import_history.metadata IS 'Import details: filters used, selected items, field mappings';
COMMENT ON COLUMN product_import_history.error_log IS 'Array of errors encountered during import';

-- 4. Create function to check for duplicate products before import
CREATE OR REPLACE FUNCTION check_product_duplicate(
  p_tenant_id uuid,
  p_sku text DEFAULT NULL,
  p_name text DEFAULT NULL,
  p_brand text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  sku text,
  brand text,
  match_type text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.sku,
    p.brand,
    CASE 
      WHEN p.sku = p_sku THEN 'exact_sku'
      WHEN LOWER(p.name) = LOWER(p_name) AND LOWER(p.brand) = LOWER(p_brand) THEN 'name_brand_match'
      ELSE 'similar'
    END as match_type
  FROM products p
  WHERE p.tenant_id = p_tenant_id
    AND p.is_deleted = false
    AND (
      (p_sku IS NOT NULL AND p.sku = p_sku)
      OR (p_name IS NOT NULL AND p_brand IS NOT NULL 
          AND LOWER(p.name) = LOWER(p_name) 
          AND LOWER(p.brand) = LOWER(p_brand))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_product_duplicate TO authenticated;