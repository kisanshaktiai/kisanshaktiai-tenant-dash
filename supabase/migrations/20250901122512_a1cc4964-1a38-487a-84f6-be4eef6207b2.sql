
-- Add missing columns to the farmers table for storing comprehensive farmer data
ALTER TABLE farmers 
ADD COLUMN IF NOT EXISTS mobile_number TEXT,
ADD COLUMN IF NOT EXISTS pin_hash TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add indexes for better performance on mobile number and pin hash lookups
CREATE INDEX IF NOT EXISTS idx_farmers_mobile_number ON farmers(mobile_number);
CREATE INDEX IF NOT EXISTS idx_farmers_pin_hash ON farmers(pin_hash);

-- Update RLS policies to ensure proper tenant isolation for farmer creation
-- This policy ensures tenant users can only create farmers for their own tenant
CREATE POLICY IF NOT EXISTS "Tenant users can create farmers for their tenant" 
ON farmers FOR INSERT 
WITH CHECK (
  tenant_id IN (
    SELECT user_tenants.tenant_id
    FROM user_tenants
    WHERE user_tenants.user_id = auth.uid() 
    AND user_tenants.is_active = true
    AND user_tenants.role IN ('tenant_owner', 'tenant_admin', 'manager')
  )
);
