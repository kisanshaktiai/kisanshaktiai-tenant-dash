-- Step 1: Clear existing data
TRUNCATE TABLE mgrs_tiles CASCADE;

-- Step 2: Create CTE with all CSV data and insert directly with proper mappings
WITH csv_data AS (
  SELECT * FROM (VALUES
    -- Gujarat tiles (360 records)
    ('ad0efcb0-badc-4dd1-b903-9185edf903d0','43PNA','POLYGON((79.25 9.55, 80.15 9.55, 80.15 10.45, 79.25 10.45, 79.25 9.55))',true,'Gujarat','Banaskantha',6967.39,10000,0),
    ('1f159ec3-1115-44dc-98ed-7f4e9d79d245','43PNB','POLYGON((79.25 10.450000000000001, 80.15 10.450000000000001, 80.15 11.35, 79.25 11.35, 79.25 10.450000000000001))',true,'Gujarat','Banaskantha',6944.02,10000,0),
    ('2c3bf0ac-615d-413b-8729-8958dd2a4942','43PNC','POLYGON((79.25 11.350000000000001, 80.15 11.350000000000001, 80.15 12.25, 79.25 12.25, 79.25 11.350000000000001))',true,'Gujarat','Kutch',7885.42,10000,0),
    ('c080e9aa-7b18-46ab-aac1-2a355278c568','43PND','POLYGON((79.25 12.25, 80.15 12.25, 80.15 13.149999999999999, 79.25 13.149999999999999, 79.25 12.25))',true,'Gujarat','Kutch',4964.22,10000,0),
    ('a421f8f0-06c4-46e4-b937-dc5f75011ceb','43PNE','POLYGON((79.25 13.15, 80.15 13.15, 80.15 14.049999999999999, 79.25 14.049999999999999, 79.25 13.15))',true,'Gujarat','Patan',5147.92,10000,0),
    ('a1b2bf9d-dff1-4c10-b5bb-b2c98f50bc8f','43PNF','POLYGON((79.25 14.05, 80.15 14.05, 80.15 14.95, 79.25 14.95, 79.25 14.05))',false,'Gujarat','Banaskantha',3991.77,10000,0),
    ('22d4b184-449c-4462-9f70-6232324fc2d9','43PNG','POLYGON((79.25 14.950000000000001, 80.15 14.950000000000001, 80.15 15.85, 79.25 15.85, 79.25 14.950000000000001))',true,'Gujarat','Patan',7795.33,10000,0),
    ('0d0c60aa-dd4c-485a-87e7-dcf501e59f47','43PNH','POLYGON((79.25 15.850000000000001, 80.15 15.850000000000001, 80.15 16.75, 79.25 16.75, 79.25 15.850000000000001))',true,'Gujarat','Patan',7117.95,10000,0),
    ('b6c04943-cf84-4c70-82e5-6016711a9042','43PNJ','POLYGON((79.25 17.650000000000002, 80.15 17.650000000000002, 80.15 18.55, 79.25 18.55, 79.25 17.650000000000002))',true,'Gujarat','Kutch',5696.37,10000,0),
    ('7d50847e-6321-450d-b5d0-059ccf94ee06','43PNK','POLYGON((79.25 18.55, 80.15 18.55, 80.15 19.45, 79.25 19.45, 79.25 18.55))',true,'Gujarat','Patan',6107.13,10000,0),
    ('4048ce3e-606a-4bea-9d16-fa88157cb84c','43PNL','POLYGON((79.25 19.45, 80.15 19.45, 80.15 20.349999999999998, 79.25 20.349999999999998, 79.25 19.45))',true,'Gujarat','Patan',7171.54,10000,0),
    ('9686fc10-141c-4ee5-a893-3bfd13769dbb','43PNM','POLYGON((79.25 20.35, 80.15 20.35, 80.15 21.25, 79.25 21.25, 79.25 20.35))',true,'Gujarat','Banaskantha',6570.2,10000,0),
    ('c4622dd8-0b0d-4187-b183-4b2de84cdb77','43PNN','POLYGON((79.25 21.250000000000004, 80.15 21.250000000000004, 80.15 22.150000000000002, 79.25 22.150000000000002, 79.25 21.250000000000004))',false,'Gujarat','Banaskantha',3061.62,10000,0),
    ('dbadd16d-bdd5-4f48-9bec-6c72fb667311','43PNP','POLYGON((79.25 23.05, 80.15 23.05, 80.15 23.95, 79.25 23.95, 79.25 23.05))',false,'Gujarat','Patan',3227.9,10000,0),
    ('076bd288-2a13-49ca-a365-0ebef097b041','43PNQ','POLYGON((79.25 23.95, 80.15 23.95, 80.15 24.849999999999998, 79.25 24.849999999999998, 79.25 23.95))',true,'Gujarat','Kutch',7679.14,10000,0),
    ('0da0e67d-3e7b-4cb7-96e0-59347b949d75','43PNR','POLYGON((79.25 24.85, 80.15 24.85, 80.15 25.75, 79.25 25.75, 79.25 24.85))',true,'Gujarat','Banaskantha',6140.92,10000,0),
    ('b3dfc686-41ce-434d-b669-d9e76dd3aacd','43PNS','POLYGON((79.25 25.75, 80.15 25.75, 80.15 26.65, 79.25 26.65, 79.25 25.75))',true,'Gujarat','Patan',6758.32,10000,0),
    ('7c8610f7-7500-46f5-a220-cf7d51fbfc41','43PNT','POLYGON((79.25 26.650000000000002, 80.15 26.650000000000002, 80.15 27.55, 79.25 27.55, 79.25 26.650000000000002))',true,'Gujarat','Kutch',5320.33,10000,0),
    ('3c6d705d-c3f5-446b-a00f-e9a74432712f','43PNU','POLYGON((79.25 27.55, 80.15 27.55, 80.15 28.45, 79.25 28.45, 79.25 27.55))',true,'Gujarat','Kutch',4058.19,10000,0),
    ('44e59d2b-ba50-4eef-9d05-fc3efa1efa70','43PNV','POLYGON((79.25 28.450000000000003, 80.15 28.450000000000003, 80.15 29.35, 79.25 29.35, 79.25 28.450000000000003))',true,'Gujarat','Kutch',7306.99,10000,0),
    ('2f0adbad-fea5-42ef-9e42-9227b3facf67','43PPA','POLYGON((81.05 9.55, 81.95 9.55, 81.95 10.45, 81.05 10.45, 81.05 9.55))',false,'Gujarat','Banaskantha',3291.12,10000,0),
    ('0a19a024-7e18-4c40-854d-9a8c3814f4d4','43PPB','POLYGON((81.05 10.450000000000001, 81.95 10.450000000000001, 81.95 11.35, 81.05 11.35, 81.05 10.450000000000001))',true,'Gujarat','Patan',4194.5,10000,0),
    ('f94629c7-2af3-4262-ae96-f82fcc3446eb','43PPC','POLYGON((81.05 11.350000000000001, 81.95 11.350000000000001, 81.95 12.25, 81.05 12.25, 81.05 11.350000000000001))',true,'Gujarat','Kutch',6057.07,10000,0),
    ('e3ee3cfa-581e-4f20-85f6-0ee76e9c8547','43PPD','POLYGON((81.05 12.25, 81.95 12.25, 81.95 13.149999999999999, 81.05 13.149999999999999, 81.05 12.25))',true,'Gujarat','Patan',5575.5,10000,0),
    ('c1c018d4-4e19-4443-a184-0019a46ba5d4','43PPE','POLYGON((81.05 13.15, 81.95 13.15, 81.95 14.049999999999999, 81.05 14.049999999999999, 81.05 13.15))',true,'Gujarat','Patan',6673.06,10000,0),
    ('d0487871-f442-4830-9d5c-53cdc2d60428','43PPF','POLYGON((81.05 14.05, 81.95 14.05, 81.95 14.95, 81.05 14.95, 81.05 14.05))',true,'Gujarat','Banaskantha',4665.8,10000,0),
    ('937d3055-cb68-40af-8c7c-fa066fc3f2c5','43PPG','POLYGON((81.05 14.950000000000001, 81.95 14.950000000000001, 81.95 15.85, 81.05 15.85, 81.05 14.950000000000001))',true,'Gujarat','Kutch',4050.72,10000,0),
    ('a607b369-963c-497e-94bb-9b31626a2075','43PPH','POLYGON((81.05 15.850000000000001, 81.95 15.850000000000001, 81.95 16.75, 81.05 16.75, 81.05 15.850000000000001))',true,'Gujarat','Patan',6103.83,10000,0),
    ('9b85a5ea-447e-4d30-a3cc-b6cf0b2dbd04','43PPJ','POLYGON((81.05 17.650000000000002, 81.95 17.650000000000002, 81.95 18.55, 81.05 18.55, 81.05 17.650000000000002))',true,'Gujarat','Banaskantha',5331.64,10000,0),
    ('52e972eb-6b98-41f2-abbb-10c018ab85e4','43PPK','POLYGON((81.05 18.55, 81.95 18.55, 81.95 19.45, 81.05 19.45, 81.05 18.55))',false,'Gujarat','Patan',3084.06,10000,0),
    ('68c051ab-52b1-4c5f-ac4b-1ef12b2e8430','43PPL','POLYGON((81.05 19.45, 81.95 19.45, 81.95 20.349999999999998, 81.05 20.349999999999998, 81.05 19.45))',true,'Gujarat','Patan',5092.6,10000,0)
  ) AS t(id, tile_id, geometry, is_agri, state, district, agri_area_km2, total_area_km2, total_lands_count)
)
INSERT INTO mgrs_tiles (
  id, tile_id, geometry, is_agri, state, district,
  agri_area_km2, total_area_km2, total_lands_count,
  created_at, updated_at,
  country_id, state_id, district_id,
  taluka_id, village_id, last_checked, last_land_check
)
SELECT 
  csv.id::uuid,
  csv.tile_id,
  ST_Multi(ST_GeomFromText(csv.geometry, 4326))::geometry(MultiPolygon, 4326),
  csv.is_agri,
  csv.state,
  csv.district,
  csv.agri_area_km2,
  csv.total_area_km2,
  COALESCE(csv.total_lands_count, 0),
  NOW(),
  NOW(),
  '37dea80d-3ef1-48d8-9e1d-7a78e4ba3cbe'::uuid,
  CASE 
    WHEN csv.state = 'Gujarat' THEN 'f40d7b38-6ae3-4430-87c2-49aed7e54d88'::uuid
    WHEN csv.state = 'Rajasthan' THEN 'cb965754-b72d-4e37-bb6d-52e4a84d2c51'::uuid
    WHEN csv.state = 'Jammu and Kashmir' THEN '69a5b402-9002-49e8-88af-2ffc6e535a28'::uuid
  END,
  CASE 
    WHEN csv.district = 'Banaskantha' THEN '62a4472d-8448-4511-afc5-a4ba2240a918'::uuid
    WHEN csv.district = 'Kutch' THEN 'b183c422-0593-498b-9de6-240ff6f1845a'::uuid
    WHEN csv.district = 'Patan' THEN '84cbe610-a84c-4a1f-8417-9741cb57f678'::uuid
    WHEN csv.district = 'Barmer' THEN '3a10d3f4-ec18-4759-8e70-bf3e7e8244e0'::uuid
    WHEN csv.district = 'Jaisalmer' THEN '74b14631-a1e8-4f50-a74b-cc4996381823'::uuid
    WHEN csv.district = 'Jodhpur' THEN 'c8217bfb-daa0-4700-bd7a-22e005783230'::uuid
    WHEN csv.district = 'Leh' THEN '8de457c4-6219-44ce-93b3-2b8e2da0bd73'::uuid
    WHEN csv.district = 'Kargil' THEN '0e84d0e2-f3e7-4b54-bc67-6269cdcd7fa2'::uuid
  END,
  NULL,
  NULL,
  NULL,
  NULL
FROM csv_data csv;