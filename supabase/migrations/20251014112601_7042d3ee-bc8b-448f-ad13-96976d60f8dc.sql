-- Add NDVI and soil testing tracking columns to lands table
ALTER TABLE lands 
ADD COLUMN IF NOT EXISTS ndvi_tested boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS soil_tested boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_processed_at timestamp with time zone;

-- Create index for faster queries on testing status
CREATE INDEX IF NOT EXISTS idx_lands_ndvi_tested ON lands(ndvi_tested) WHERE ndvi_tested = false;
CREATE INDEX IF NOT EXISTS idx_lands_soil_tested ON lands(soil_tested) WHERE soil_tested = false;

-- Add index on queue status for faster processing
CREATE INDEX IF NOT EXISTS idx_ndvi_queue_status ON ndvi_request_queue(status, created_at);

-- Create function to auto-trigger queue processing
CREATE OR REPLACE FUNCTION notify_ndvi_queue_change()
RETURNS trigger AS $$
BEGIN
  -- Notify when new items are queued
  IF NEW.status = 'queued' THEN
    PERFORM pg_notify('ndvi_queue_new', json_build_object(
      'id', NEW.id,
      'tenant_id', NEW.tenant_id,
      'land_ids', NEW.land_ids
    )::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for queue notifications
DROP TRIGGER IF EXISTS ndvi_queue_notification ON ndvi_request_queue;
CREATE TRIGGER ndvi_queue_notification
  AFTER INSERT OR UPDATE ON ndvi_request_queue
  FOR EACH ROW
  EXECUTE FUNCTION notify_ndvi_queue_change();

-- Add processing metadata to queue table if not exists
ALTER TABLE ndvi_request_queue 
ADD COLUMN IF NOT EXISTS retry_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_error text,
ADD COLUMN IF NOT EXISTS processing_duration_ms integer;