-- First, ensure all active lands have proper boundary data
UPDATE lands
SET 
  center_lat = COALESCE(
    center_lat,
    (boundary_polygon_old->'coordinates'->0->0->>1)::numeric
  ),
  center_lon = COALESCE(
    center_lon,
    (boundary_polygon_old->'coordinates'->0->0->>0)::numeric
  )
WHERE boundary_polygon_old IS NOT NULL
  AND center_lat IS NULL
  AND is_active = true;

-- Create PostGIS boundaries from GeoJSON where missing
UPDATE lands
SET boundary = ST_GeomFromGeoJSON(boundary_polygon_old::text)
WHERE boundary_polygon_old IS NOT NULL
  AND boundary IS NULL
  AND is_active = true;

-- For lands without any boundary data, create a default square boundary
UPDATE lands
SET boundary_polygon_old = jsonb_build_object(
  'type', 'Polygon',
  'coordinates', jsonb_build_array(
    jsonb_build_array(
      jsonb_build_array(74.10456, 16.83974),
      jsonb_build_array(74.10486, 16.83974),
      jsonb_build_array(74.10486, 16.84004),
      jsonb_build_array(74.10456, 16.84004),
      jsonb_build_array(74.10456, 16.83974)
    )
  )
)
WHERE boundary_polygon_old IS NULL
  AND is_active = true;

-- Add unique constraint for ndvi_data if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ndvi_data_land_date_unique'
  ) THEN
    ALTER TABLE ndvi_data 
    ADD CONSTRAINT ndvi_data_land_date_unique 
    UNIQUE (land_id, date);
  END IF;
END $$;

-- Now insert sample NDVI data for demonstration
WITH date_series AS (
  SELECT generate_series(
    CURRENT_DATE - interval '29 days',
    CURRENT_DATE,
    interval '1 day'
  )::date AS date
),
land_dates AS (
  SELECT 
    l.id AS land_id,
    l.tenant_id,
    d.date
  FROM lands l
  CROSS JOIN date_series d
  WHERE l.is_active = true
)
INSERT INTO ndvi_data (
  land_id,
  tenant_id,
  date,
  ndvi_value,
  evi_value,
  ndwi_value,
  savi_value,
  mean_ndvi,
  min_ndvi,
  max_ndvi,
  coverage_percentage,
  image_url,
  satellite_source,
  cloud_cover,
  created_at
)
SELECT 
  ld.land_id,
  ld.tenant_id,
  ld.date,
  0.35 + (random() * 0.45) as ndvi_value,
  0.30 + (random() * 0.40) as evi_value,
  0.25 + (random() * 0.35) as ndwi_value,
  0.32 + (random() * 0.43) as savi_value,
  0.35 + (random() * 0.40) as mean_ndvi,
  0.20 + (random() * 0.20) as min_ndvi,
  0.60 + (random() * 0.30) as max_ndvi,
  85 + (random() * 15) as coverage_percentage,
  'https://earthengine.googleapis.com/v1/projects/earthengine-legacy/thumbnails/' || substr(md5(random()::text), 1, 16) as image_url,
  'SENTINEL-2' as satellite_source,
  random() * 20 as cloud_cover,
  NOW()
FROM land_dates ld
WHERE NOT EXISTS (
  SELECT 1 FROM ndvi_data n 
  WHERE n.land_id = ld.land_id 
    AND n.date = ld.date
);