-- Create function to update farmer's total land acres
CREATE OR REPLACE FUNCTION update_farmer_total_land_acres()
RETURNS TRIGGER AS $$
DECLARE
  total_acres DECIMAL;
BEGIN
  -- Calculate the sum of all land areas for the farmer
  SELECT COALESCE(SUM(area_acres), 0) INTO total_acres
  FROM lands
  WHERE farmer_id = COALESCE(NEW.farmer_id, OLD.farmer_id);
  
  -- Update the farmer's total_land_acres
  UPDATE farmers
  SET 
    total_land_acres = total_acres,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.farmer_id, OLD.farmer_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for lands table
DROP TRIGGER IF EXISTS update_farmer_land_on_change ON lands;
CREATE TRIGGER update_farmer_land_on_change
AFTER INSERT OR UPDATE OR DELETE ON lands
FOR EACH ROW
EXECUTE FUNCTION update_farmer_total_land_acres();

-- Update all existing farmers' total_land_acres
UPDATE farmers f
SET total_land_acres = (
  SELECT COALESCE(SUM(l.area_acres), 0)
  FROM lands l
  WHERE l.farmer_id = f.id
);

-- Add missing columns to dealers table if they don't exist
ALTER TABLE dealers 
ADD COLUMN IF NOT EXISTS dealer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS business_name VARCHAR(255);

-- Update dealer names from existing data if available
UPDATE dealers 
SET dealer_name = COALESCE(dealer_name, business_name, 'Dealer ' || LEFT(id::text, 8))
WHERE dealer_name IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lands_farmer_tenant ON lands(farmer_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_farmers_tenant_login ON farmers(tenant_id, last_login_at);
CREATE INDEX IF NOT EXISTS idx_farmers_app_opens ON farmers(total_app_opens);

-- Add some sample data for testing if needed
DO $$
BEGIN
  -- Only add sample data if there are farmers but no lands
  IF EXISTS (SELECT 1 FROM farmers LIMIT 1) 
     AND NOT EXISTS (SELECT 1 FROM lands LIMIT 1) THEN
    
    -- Add sample lands for existing farmers
    INSERT INTO lands (farmer_id, tenant_id, area_acres, soil_type, current_crop, water_source)
    SELECT 
      f.id,
      f.tenant_id,
      ROUND((RANDOM() * 10 + 1)::numeric, 2), -- Random area between 1-11 acres
      CASE WHEN RANDOM() < 0.5 THEN 'loamy' ELSE 'clay' END,
      CASE 
        WHEN RANDOM() < 0.3 THEN 'wheat'
        WHEN RANDOM() < 0.6 THEN 'rice'  
        ELSE 'cotton'
      END,
      CASE WHEN RANDOM() < 0.5 THEN 'well' ELSE 'canal' END
    FROM farmers f
    WHERE NOT EXISTS (
      SELECT 1 FROM lands l WHERE l.farmer_id = f.id
    )
    LIMIT 10; -- Add lands for up to 10 farmers
  END IF;
END $$;