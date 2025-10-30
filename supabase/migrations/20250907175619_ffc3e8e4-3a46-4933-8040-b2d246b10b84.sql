-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_white_label_configs_updated_at ON public.white_label_configs;

-- Drop existing function if it exists  
DROP FUNCTION IF EXISTS public.update_white_label_configs_updated_at();

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_white_label_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.version = COALESCE(OLD.version, 0) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER update_white_label_configs_updated_at
BEFORE UPDATE ON public.white_label_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_white_label_configs_updated_at();

-- Add columns to appearance_settings if they don't exist
DO $$ 
BEGIN
  -- Add applies_to flag to indicate settings apply to web/mobile/both
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'appearance_settings' 
                AND column_name = 'applies_to') THEN
    ALTER TABLE public.appearance_settings 
    ADD COLUMN applies_to TEXT DEFAULT 'web' CHECK (applies_to IN ('web', 'mobile', 'both'));
  END IF;
END $$;