
-- Add missing semantic color columns to appearance_settings table
ALTER TABLE appearance_settings 
ADD COLUMN IF NOT EXISTS border_color TEXT DEFAULT '#e5e7eb',
ADD COLUMN IF NOT EXISTS muted_color TEXT DEFAULT '#f3f4f6',
ADD COLUMN IF NOT EXISTS sidebar_background_color TEXT DEFAULT '#ffffff';

-- Update existing records to have default values for new columns
UPDATE appearance_settings 
SET 
  border_color = COALESCE(border_color, '#e5e7eb'),
  muted_color = COALESCE(muted_color, '#f3f4f6'),
  sidebar_background_color = COALESCE(sidebar_background_color, '#ffffff')
WHERE border_color IS NULL OR muted_color IS NULL OR sidebar_background_color IS NULL;
