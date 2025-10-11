
-- Debug version of assign_mgrs_tile_to_land with better error handling
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
  error_count INTEGER := 0;
  was_insert BOOLEAN;
  land_centroid_geom geometry;
  land_bbox_geojson jsonb;
  land_centroid_geojson jsonb;
  area_sq_meters numeric;
  area_acres numeric;
  area_hectares numeric;
  error_details jsonb := '[]'::jsonb;
BEGIN
  -- Loop through all lands with valid boundaries and tenant isolation
  FOR land_record IN 
    SELECT 
      id, 
      name, 
      tenant_id, 
      farmer_id, 
      boundary::geometry AS boundary_geom
    FROM public.lands
    WHERE boundary IS NOT NULL
      AND tenant_id IS NOT NULL
  LOOP
    BEGIN
      -- Compute centroid of the land polygon
      land_centroid_geom := ST_Centroid(land_record.boundary_geom);

      -- Find MGRS tile containing this centroid
      SELECT id, tile_id
      INTO tile_record
      FROM public.mgrs_tiles
      WHERE ST_Contains(geometry, land_centroid_geom)
      LIMIT 1;

      -- If no matching tile, skip
      IF tile_record.id IS NULL THEN
        skipped_count := skipped_count + 1;
        error_details := error_details || jsonb_build_object(
          'land_id', land_record.id,
          'land_name', land_record.name,
          'reason', 'No tile found',
          'centroid', ST_AsText(land_centroid_geom)
        );
        CONTINUE;
      END IF;

      -- Compute area metrics
      area_sq_meters := ST_Area(land_record.boundary_geom::geography);
      area_acres := ROUND(area_sq_meters / 4046.86, 2);
      area_hectares := ROUND(area_sq_meters / 10000, 2);

      -- Generate GeoJSON for bbox & centroid
      land_bbox_geojson := ST_AsGeoJSON(ST_Envelope(land_record.boundary_geom))::jsonb;
      land_centroid_geojson := ST_AsGeoJSON(land_centroid_geom)::jsonb;

      -- Upsert mapping into land_tile_mapping
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
      )
      VALUES (
        land_record.tenant_id,
        land_record.farmer_id,
        land_record.id,
        tile_record.id,
        tile_record.tile_id,
        land_bbox_geojson,
        land_centroid_geojson,
        area_acres,
        area_hectares,
        TRUE,
        NOW(),
        NOW()
      )
      ON CONFLICT (land_id)
      DO UPDATE SET
        mgrs_tile_id = EXCLUDED.mgrs_tile_id,
        tile_id = EXCLUDED.tile_id,
        land_bbox = EXCLUDED.land_bbox,
        land_centroid = EXCLUDED.land_centroid,
        land_area_acres = EXCLUDED.land_area_acres,
        land_area_hectares = EXCLUDED.land_area_hectares,
        needs_refresh = TRUE,
        updated_at = NOW()
      RETURNING (xmax = 0) INTO was_insert;

      IF was_insert THEN
        inserted_count := inserted_count + 1;
      ELSE
        updated_count := updated_count + 1;
      END IF;

    EXCEPTION
      WHEN OTHERS THEN
        error_count := error_count + 1;
        error_details := error_details || jsonb_build_object(
          'land_id', land_record.id,
          'land_name', land_record.name,
          'error_code', SQLSTATE,
          'error_message', SQLERRM
        );
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'success', TRUE,
    'inserted', inserted_count,
    'updated', updated_count,
    'skipped', skipped_count,
    'errors', error_count,
    'total_processed', inserted_count + updated_count,
    'error_details', error_details,
    'message', format('Processed %s lands: %s inserted, %s updated, %s skipped, %s errors',
                      inserted_count + updated_count + skipped_count + error_count,
                      inserted_count, updated_count, skipped_count, error_count)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_mgrs_tile_to_land() TO authenticated;

COMMENT ON FUNCTION public.assign_mgrs_tile_to_land() 
IS 'Assigns MGRS tiles to lands with detailed error reporting';
