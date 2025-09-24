-- Fix function conflict and complete NDVI harvest setup
DROP FUNCTION IF EXISTS get_tenant_tiles(uuid);
DROP FUNCTION IF EXISTS get_lands_in_tile(uuid, varchar);

-- Recreate the functions with proper structure
CREATE OR REPLACE FUNCTION get_tenant_tiles(p_tenant_id UUID)
RETURNS TABLE (
    tile_id VARCHAR(5),
    land_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.mgrs_tile_id AS tile_id,
        COUNT(*)::BIGINT AS land_count
    FROM lands l
    WHERE l.tenant_id = p_tenant_id
    AND l.mgrs_tile_id IS NOT NULL
    AND l.is_active = true
    GROUP BY l.mgrs_tile_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_lands_in_tile(p_tenant_id UUID, p_tile_id VARCHAR(5))
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    area_acres DECIMAL,
    farmer_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.name,
        l.area_acres,
        l.farmer_id
    FROM lands l
    WHERE l.tenant_id = p_tenant_id
    AND l.mgrs_tile_id = p_tile_id
    AND l.is_active = true;
END;
$$;

-- Clear existing mock data and insert real-time harvest job
DELETE FROM ndvi_data WHERE satellite_source = 'SENTINEL-2';

-- Create a test system job for NDVI harvesting
INSERT INTO system_jobs (job_type, status, tenant_id, target_type, parameters)
VALUES (
    'tile_harvest',
    'pending',
    'a2a59533-b5d2-450c-bd70-7180aa40d82d',
    'tile',
    jsonb_build_object(
        'tile_id', '43RFN',
        'requested_date', CURRENT_DATE::TEXT,
        'source', 'MPC'
    )
);

-- Update harvest queue status
UPDATE harvest_queue 
SET status = 'pending'
WHERE tenant_id = 'a2a59533-b5d2-450c-bd70-7180aa40d82d'
AND tile_id = '43RFN';