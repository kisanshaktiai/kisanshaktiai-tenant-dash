-- Create test NDVI data for existing lands to demonstrate the feature
INSERT INTO ndvi_data (
    land_id,
    ndvi_value,
    evi_value,
    ndwi_value,
    savi_value,
    date,
    image_url
)
SELECT 
    id as land_id,
    0.65 + random() * 0.25 as ndvi_value,  -- NDVI between 0.65-0.90
    0.55 + random() * 0.20 as evi_value,    -- EVI between 0.55-0.75
    0.40 + random() * 0.30 as ndwi_value,   -- NDWI between 0.40-0.70
    0.50 + random() * 0.25 as savi_value,   -- SAVI between 0.50-0.75
    CURRENT_DATE - (generate_series * interval '1 day') as date,
    'https://qfklkkzxemsbeniyugiz.supabase.co/storage/v1/object/public/land-previews/sample-ndvi-preview.png' as image_url
FROM 
    lands,
    generate_series(0, 30, 3) -- Generate data for last 30 days with 3-day intervals
WHERE 
    lands.tenant_id = 'a2a59533-b5d2-450c-bd70-7180aa40d82d'
    AND lands.is_active = true
ON CONFLICT DO NOTHING;

-- Create storage bucket for land previews if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('land-previews', 'land-previews', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for land-previews bucket
CREATE POLICY "Public can view land preview images"
ON storage.objects FOR SELECT
USING (bucket_id = 'land-previews');

CREATE POLICY "System can upload land preview images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'land-previews');

CREATE POLICY "System can update land preview images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'land-previews')
WITH CHECK (bucket_id = 'land-previews');