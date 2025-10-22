-- Step 1: Auto-assign MGRS tiles when land boundary is updated
-- This ensures tile mappings are always kept up-to-date

-- Function to auto-assign tile when boundary changes
CREATE OR REPLACE FUNCTION auto_assign_tile_on_boundary_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If boundary was just added or changed
  IF (NEW.boundary IS NOT NULL AND (OLD.boundary IS NULL OR NEW.boundary != OLD.boundary)) THEN
    -- Call the existing assignment function for this specific land
    PERFORM assign_mgrs_tile_to_land(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run after land boundary updates
DROP TRIGGER IF EXISTS trigger_auto_assign_tile ON lands;
CREATE TRIGGER trigger_auto_assign_tile
  AFTER INSERT OR UPDATE OF boundary
  ON lands
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_tile_on_boundary_change();

-- Also update the assign_mgrs_tile_to_land function to handle single land
CREATE OR REPLACE FUNCTION assign_mgrs_tile_to_land(land_id_param UUID DEFAULT NULL)
RETURNS void AS $$
BEGIN
  -- If specific land_id provided, only process that land
  IF land_id_param IS NOT NULL THEN
    INSERT INTO land_tile_mapping (land_id, mgrs_tile_id, tile_id)
    SELECT 
      l.id,
      mt.id,
      mt.mgrs_code
    FROM lands l
    CROSS JOIN mgrs_tiles mt
    WHERE l.id = land_id_param
      AND l.boundary IS NOT NULL
      AND ST_Intersects(
        l.boundary::geometry,
        mt.geometry::geometry
      )
    ON CONFLICT (land_id, mgrs_tile_id) DO NOTHING;
  ELSE
    -- Process all lands (existing behavior)
    INSERT INTO land_tile_mapping (land_id, mgrs_tile_id, tile_id)
    SELECT 
      l.id,
      mt.id,
      mt.mgrs_code
    FROM lands l
    CROSS JOIN mgrs_tiles mt
    WHERE l.boundary IS NOT NULL
      AND ST_Intersects(
        l.boundary::geometry,
        mt.geometry::geometry
      )
    ON CONFLICT (land_id, mgrs_tile_id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;