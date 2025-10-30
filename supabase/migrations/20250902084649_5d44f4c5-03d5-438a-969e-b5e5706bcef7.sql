
-- Drop the existing generic policy if it exists
DROP POLICY IF EXISTS "Allow farmer registration" ON farmers;

-- Create a new policy that allows tenant users to create farmers
CREATE POLICY "Tenant users can create farmers" 
ON farmers 
FOR INSERT 
WITH CHECK (
  tenant_id IN (
    SELECT tenant_id 
    FROM user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- Create a policy for tenant users to manage their farmers
CREATE POLICY "Tenant users can manage farmers" 
ON farmers 
FOR ALL 
USING (
  tenant_id IN (
    SELECT tenant_id 
    FROM user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- Create a function to generate unique farmer codes
CREATE OR REPLACE FUNCTION generate_farmer_code(p_tenant_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tenant_slug TEXT;
  v_farmer_count INTEGER;
  v_farmer_code TEXT;
BEGIN
  -- Get tenant slug
  SELECT UPPER(SUBSTRING(slug FROM 1 FOR 3)) 
  INTO v_tenant_slug
  FROM tenants 
  WHERE id = p_tenant_id;
  
  -- If no slug found, use default
  IF v_tenant_slug IS NULL THEN
    v_tenant_slug := 'KIS';
  END IF;
  
  -- Get current farmer count for this tenant
  SELECT COUNT(*) + 1
  INTO v_farmer_count
  FROM farmers
  WHERE tenant_id = p_tenant_id;
  
  -- Generate farmer code
  v_farmer_code := v_tenant_slug || LPAD(v_farmer_count::TEXT, 6, '0');
  
  RETURN v_farmer_code;
END;
$$;
