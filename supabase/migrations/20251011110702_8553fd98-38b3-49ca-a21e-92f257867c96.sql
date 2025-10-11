-- Enable Row Level Security on ndvi_request_queue
ALTER TABLE public.ndvi_request_queue ENABLE ROW LEVEL SECURITY;

-- Tenant users can view their own NDVI request queue items
CREATE POLICY "Tenant users can view their NDVI requests"
ON public.ndvi_request_queue
FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT tenant_id 
    FROM user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- Tenant users can insert their own NDVI request queue items
CREATE POLICY "Tenant users can create NDVI requests"
ON public.ndvi_request_queue
FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id IN (
    SELECT tenant_id 
    FROM user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- Tenant users can update their own NDVI request queue items
CREATE POLICY "Tenant users can update their NDVI requests"
ON public.ndvi_request_queue
FOR UPDATE
TO authenticated
USING (
  tenant_id IN (
    SELECT tenant_id 
    FROM user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
)
WITH CHECK (
  tenant_id IN (
    SELECT tenant_id 
    FROM user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- System can manage all queue items (for edge function processing)
CREATE POLICY "Service role can manage all NDVI requests"
ON public.ndvi_request_queue
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);