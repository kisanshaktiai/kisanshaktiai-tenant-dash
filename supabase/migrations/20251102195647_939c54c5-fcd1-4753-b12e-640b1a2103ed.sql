-- Fix check_product_duplicate function to remove is_deleted check
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
    AND (
      (p_sku IS NOT NULL AND p.sku = p_sku)
      OR (p_name IS NOT NULL AND p_brand IS NOT NULL 
          AND LOWER(p.name) = LOWER(p_name) 
          AND LOWER(p.brand) = LOWER(p_brand))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;