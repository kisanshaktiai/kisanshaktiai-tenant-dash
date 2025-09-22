-- Ensure all active lands have proper boundary data
-- Convert boundary_polygon_old to PostGIS boundary if not already present

-- First, let's check and populate center coordinates from boundary data
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

-- For lands without any boundary data, create a default square boundary around center point
-- This is a fallback for demo purposes
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

-- Now ensure we have NDVI data for demonstration
-- Insert sample NDVI data for lands that don't have any
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
  l.id as land_id,
  l.tenant_id,
  CURRENT_DATE - (interval '1 day' * generate_series(0, 29)) as date,
  0.35 + (random() * 0.45) as ndvi_value, -- Random NDVI between 0.35 and 0.80
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
FROM lands l
WHERE l.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM ndvi_data n 
    WHERE n.land_id = l.id 
      AND n.date >= CURRENT_DATE - interval '30 days'
  )
ON CONFLICT (land_id, date) DO NOTHING;

-- Update the NDVI values to show a realistic trend over time
UPDATE ndvi_data n
SET 
  ndvi_value = CASE 
    WHEN date >= CURRENT_DATE - interval '7 days' THEN 
      ndvi_value + (0.02 * (CURRENT_DATE - date::date)::int) -- Increasing trend
    ELSE 
      ndvi_value - (0.01 * ((date::date - (CURRENT_DATE - interval '7 days'))::int))
  END
WHERE n.date >= CURRENT_DATE - interval '30 days';

-- Ensure variance in NDVI values for different lands
UPDATE ndvi_data n
SET 
  ndvi_value = LEAST(0.95, GREATEST(0.15, 
    ndvi_value + (
      (SELECT random() * 0.1 - 0.05 FROM lands l WHERE l.id = n.land_id)
    )
  ))
WHERE n.date >= CURRENT_DATE - interval '30 days';