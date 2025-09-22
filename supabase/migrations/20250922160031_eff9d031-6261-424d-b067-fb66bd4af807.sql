-- Add missing columns to ndvi_data table for land clipper stats
ALTER TABLE public.ndvi_data 
ADD COLUMN IF NOT EXISTS min_ndvi REAL,
ADD COLUMN IF NOT EXISTS max_ndvi REAL,
ADD COLUMN IF NOT EXISTS mean_ndvi REAL,
ADD COLUMN IF NOT EXISTS valid_pixels INTEGER,
ADD COLUMN IF NOT EXISTS total_pixels INTEGER,
ADD COLUMN IF NOT EXISTS coverage_percentage REAL,
ADD COLUMN IF NOT EXISTS computed_at TIMESTAMPTZ DEFAULT NOW();

-- Add index for faster querying
CREATE INDEX IF NOT EXISTS idx_ndvi_data_composite 
ON public.ndvi_data(tenant_id, land_id, date DESC);

-- Add index for job processing
CREATE INDEX IF NOT EXISTS idx_system_jobs_processing 
ON public.system_jobs(job_type, status, created_at) 
WHERE status IN ('pending', 'running');