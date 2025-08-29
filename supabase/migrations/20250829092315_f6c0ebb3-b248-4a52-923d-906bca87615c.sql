
-- Add the missing UNIQUE constraint on tenant_id column
-- This is required for the ON CONFLICT clause in upsert operations to work
ALTER TABLE public.tenant_features 
ADD CONSTRAINT tenant_features_tenant_id_unique UNIQUE (tenant_id);
