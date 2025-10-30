-- Fix the search path for the function we just created
CREATE OR REPLACE FUNCTION update_farmer_total_land_acres()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_acres DECIMAL;
BEGIN
  -- Calculate the sum of all land areas for the farmer
  SELECT COALESCE(SUM(area_acres), 0) INTO total_acres
  FROM public.lands
  WHERE farmer_id = COALESCE(NEW.farmer_id, OLD.farmer_id);
  
  -- Update the farmer's total_land_acres
  UPDATE public.farmers
  SET 
    total_land_acres = total_acres,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.farmer_id, OLD.farmer_id);
  
  RETURN NEW;
END;
$$;