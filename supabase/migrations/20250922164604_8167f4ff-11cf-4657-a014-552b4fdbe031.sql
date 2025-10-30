-- Create test NDVI data with proper tenant_id for existing lands
INSERT INTO ndvi_data (
    land_id,
    tenant_id,
    ndvi_value,
    evi_value,
    ndwi_value,
    savi_value,
    date,
    image_url,
    source,
    satellite
)
SELECT 
    l.id as land_id,
    l.tenant_id,
    0.65 + random() * 0.25 as ndvi_value,
    0.55 + random() * 0.20 as evi_value,
    0.40 + random() * 0.30 as ndwi_value,
    0.50 + random() * 0.25 as savi_value,
    CURRENT_DATE - (gs * interval '3 days') as date,
    'https://qfklkkzxemsbeniyugiz.supabase.co/storage/v1/object/public/land-previews/' || l.id || '/' || to_char(CURRENT_DATE - (gs * interval '3 days'), 'YYYY-MM-DD') || '.png' as image_url,
    'sentinel-2' as source,
    'sentinel-2-l2a' as satellite
FROM 
    lands l,
    generate_series(0, 10) gs
WHERE 
    l.tenant_id = 'a2a59533-b5d2-450c-bd70-7180aa40d82d'
    AND l.is_active = true
ON CONFLICT (land_id, date) DO NOTHING;