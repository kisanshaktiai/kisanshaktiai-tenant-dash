-- Add metadata column to store additional request details
ALTER TABLE public.ndvi_request_queue
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add farmer_id column for farmer-specific requests
ALTER TABLE public.ndvi_request_queue
ADD COLUMN IF NOT EXISTS farmer_id uuid;

-- Add index for farmer_id queries
CREATE INDEX IF NOT EXISTS idx_ndvi_request_queue_farmer_id 
ON public.ndvi_request_queue(farmer_id);

-- Add comments for documentation
COMMENT ON COLUMN public.ndvi_request_queue.metadata IS 
'Additional request metadata including estimated_completion, land_count, created_via, etc.';

COMMENT ON COLUMN public.ndvi_request_queue.farmer_id IS 
'Optional farmer ID for farmer-specific NDVI requests';