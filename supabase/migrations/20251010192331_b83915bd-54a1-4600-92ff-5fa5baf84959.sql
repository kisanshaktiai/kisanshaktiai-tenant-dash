-- Add RLS policy to allow tenant users to view all lands in their tenant
-- This fixes the issue where tenant admins couldn't see lands because existing policies
-- only allow farmers to see their own lands (auth.uid() = farmer_id)

CREATE POLICY "Tenant users can view all tenant lands"
ON public.lands
FOR SELECT
TO public
USING (
  tenant_id IN (
    SELECT tenant_id 
    FROM user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);