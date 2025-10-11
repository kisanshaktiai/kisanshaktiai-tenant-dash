-- Function to assign MGRS tiles to lands based on centroid containment
CREATE OR REPLACE FUNCTION public.assign_mgrs_tile_to_land()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  land_record RECORD;
  tile_record RECORD;
  inserted_count INTEGER := 0;
  updated_count INTEGER := 0;
  skipped_count INTEGER := 0;
  land_centroid_geom geometry;
  land_bbox_geojson jsonb;
  land_centroid_geojson jsonb;
  area_sq_meters numeric;
  area_acres numeric;
  area_hectares numeric;
BEGIN
  -- Loop through all lands with valid boundary polygons
  FOR land_record IN 
    SELECT 
      id,
      tenant_id,
      farmer_id,
      boundary_polygon_old
    FROM public.lands
    WHERE boundary_polygon_old IS NOT NULL
  LOOP
    BEGIN
      -- Compute the centroid of the land polygon
      land_centroid_geom := ST_Centroid(land_record.boundary_polygon_old::geometry);
      
      -- Find the MGRS tile that contains this centroid
      SELECT 
        id,
        tile_id,
        geometry
      INTO tile_record
      FROM public.mgrs_tiles
      WHERE ST_Contains(geometry, land_centroid_geom)
      LIMIT 1;
      
      -- Skip if no matching tile found
      IF tile_record.id IS NULL THEN
        skipped_count := skipped_count + 1;
        CONTINUE;
      END IF;
      
      -- Calculate area in square meters (Geography type for accurate measurement)
      area_sq_meters := ST_Area(land_record.boundary_polygon_old::geography);
      area_acres := area_sq_meters / 4046.86;
      area_hectares := area_sq_meters / 10000;
      
      -- Generate GeoJSON for bbox and centroid
      land_bbox_geojson := ST_AsGeoJSON(ST_Envelope(land_record.boundary_polygon_old::geometry))::jsonb;
      land_centroid_geojson := ST_AsGeoJSON(land_centroid_geom)::jsonb;
      
      -- Upsert into land_tile_mapping
      INSERT INTO public.land_tile_mapping (
        tenant_id,
        farmer_id,
        land_id,
        mgrs_tile_id,
        tile_id,
        land_bbox,
        land_centroid,
        land_area_acres,
        land_area_hectares,
        needs_refresh,
        created_at,
        updated_at
      ) VALUES (
        land_record.tenant_id,
        land_record.farmer_id,
        land_record.id,
        tile_record.id,
        tile_record.tile_id,
        land_bbox_geojson,
        land_centroid_geojson,
        area_acres,
        area_hectares,
        true,
        now(),
        now()
      )
      ON CONFLICT (land_id)
      DO UPDATE SET
        tenant_id = EXCLUDED.tenant_id,
        farmer_id = EXCLUDED.farmer_id,
        mgrs_tile_id = EXCLUDED.mgrs_tile_id,
        tile_id = EXCLUDED.tile_id,
        land_bbox = EXCLUDED.land_bbox,
        land_centroid = EXCLUDED.land_centroid,
        land_area_acres = EXCLUDED.land_area_acres,
        land_area_hectares = EXCLUDED.land_area_hectares,
        needs_refresh = true,
        updated_at = now();
      
      -- Track if this was insert or update
      IF NOT FOUND THEN
        inserted_count := inserted_count + 1;
      ELSE
        updated_count := updated_count + 1;
      END IF;
      
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error and continue with next land
        RAISE NOTICE 'Error processing land_id %: %', land_record.id, SQLERRM;
        skipped_count := skipped_count + 1;
    END;
  END LOOP;
  
  -- Return summary as JSON
  RETURN jsonb_build_object(
    'success', true,
    'inserted', inserted_count,
    'updated', updated_count,
    'skipped', skipped_count,
    'total_processed', inserted_count + updated_count,
    'message', format('Processed %s lands: %s inserted, %s updated, %s skipped', 
                      inserted_count + updated_count + skipped_count,
                      inserted_count, 
                      updated_count, 
                      skipped_count)
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.assign_mgrs_tile_to_land() TO authenticated;

COMMENT ON FUNCTION public.assign_mgrs_tile_to_land() IS 'Assigns MGRS tiles to lands based on centroid containment and computes spatial metrics';