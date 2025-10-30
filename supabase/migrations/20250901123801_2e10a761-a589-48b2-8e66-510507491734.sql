
-- Add the missing columns to the farmers table
ALTER TABLE farmers 
ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'english',
ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'mobile';

-- Add the notes and metadata columns that were intended before
ALTER TABLE farmers 
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farmers_language_preference ON farmers(language_preference);
CREATE INDEX IF NOT EXISTS idx_farmers_preferred_contact_method ON farmers(preferred_contact_method);
