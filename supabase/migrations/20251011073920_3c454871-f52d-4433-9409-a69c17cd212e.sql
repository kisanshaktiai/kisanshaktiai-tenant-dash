
-- Fix land_tile_mapping table constraints
-- Add UNIQUE constraint on land_id and make it NOT NULL

-- First, make land_id NOT NULL (it should never be null for this table)
ALTER TABLE public.land_tile_mapping 
ALTER COLUMN land_id SET NOT NULL;

-- Add UNIQUE constraint on land_id (one mapping per land)
ALTER TABLE public.land_tile_mapping 
ADD CONSTRAINT land_tile_mapping_land_id_unique UNIQUE (land_id);

-- Also ensure tenant_id and farmer_id are NOT NULL for proper data integrity
ALTER TABLE public.land_tile_mapping 
ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE public.land_tile_mapping 
ALTER COLUMN farmer_id SET NOT NULL;

-- Add helpful comment
COMMENT ON CONSTRAINT land_tile_mapping_land_id_unique ON public.land_tile_mapping 
IS 'Ensures each land can only have one MGRS tile mapping (required for ON CONFLICT upsert)';
