-- Remove date_from and date_to columns from ndvi_request_queue table
ALTER TABLE public.ndvi_request_queue 
DROP COLUMN IF EXISTS date_from,
DROP COLUMN IF EXISTS date_to;

-- Add comment explaining the change
COMMENT ON TABLE public.ndvi_request_queue IS 'NDVI request queue - using acquisition_date from API response instead of date ranges';