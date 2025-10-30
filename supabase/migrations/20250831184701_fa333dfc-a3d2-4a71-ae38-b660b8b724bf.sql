
-- First, let's ensure the farmers table has all necessary fields and proper structure
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(15) UNIQUE;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS country_code VARCHAR(5) DEFAULT '+91';
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS pin_hash TEXT;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS village TEXT;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS taluka TEXT;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create farmer_addresses table with proper tenant isolation
CREATE TABLE IF NOT EXISTS farmer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  address_type TEXT DEFAULT 'primary',
  street_address TEXT,
  village TEXT NOT NULL,
  taluka TEXT,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (farmer_id, tenant_id) REFERENCES farmers(id, tenant_id)
);

-- Create farmer_contacts table with proper tenant isolation
CREATE TABLE IF NOT EXISTS farmer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  contact_type TEXT NOT NULL, -- 'mobile', 'email', 'whatsapp'
  contact_value TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (farmer_id, tenant_id) REFERENCES farmers(id, tenant_id)
);

-- Create farmer_authentication table for mobile + PIN login
CREATE TABLE IF NOT EXISTS farmer_authentication (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  mobile_number TEXT NOT NULL,
  country_code TEXT DEFAULT '+91',
  pin_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(mobile_number, tenant_id),
  FOREIGN KEY (farmer_id, tenant_id) REFERENCES farmers(id, tenant_id)
);

-- Ensure lands table has proper tenant isolation
ALTER TABLE lands ADD COLUMN IF NOT EXISTS tenant_id UUID;
UPDATE lands SET tenant_id = (SELECT tenant_id FROM farmers WHERE farmers.id = lands.farmer_id) WHERE tenant_id IS NULL;
ALTER TABLE lands ALTER COLUMN tenant_id SET NOT NULL;

-- Add composite foreign key constraint for lands
ALTER TABLE lands DROP CONSTRAINT IF EXISTS lands_farmer_tenant_fk;
ALTER TABLE lands ADD CONSTRAINT lands_farmer_tenant_fk 
  FOREIGN KEY (farmer_id, tenant_id) REFERENCES farmers(id, tenant_id);

-- Ensure farmer_engagement table exists and has proper structure
ALTER TABLE farmer_engagement ADD COLUMN IF NOT EXISTS tenant_id UUID;
UPDATE farmer_engagement SET tenant_id = (SELECT tenant_id FROM farmers WHERE farmers.id = farmer_engagement.farmer_id) WHERE tenant_id IS NULL;
ALTER TABLE farmer_engagement ALTER COLUMN tenant_id SET NOT NULL;

-- Add composite foreign key for farmer_engagement
ALTER TABLE farmer_engagement DROP CONSTRAINT IF EXISTS farmer_engagement_farmer_tenant_fk;
ALTER TABLE farmer_engagement ADD CONSTRAINT farmer_engagement_farmer_tenant_fk 
  FOREIGN KEY (farmer_id, tenant_id) REFERENCES farmers(id, tenant_id);

-- Ensure farmer_tags table has proper structure
ALTER TABLE farmer_tags ADD COLUMN IF NOT EXISTS tenant_id UUID;
UPDATE farmer_tags SET tenant_id = (SELECT tenant_id FROM farmers WHERE farmers.id = farmer_tags.farmer_id) WHERE tenant_id IS NULL;
ALTER TABLE farmer_tags ALTER COLUMN tenant_id SET NOT NULL;

-- Add composite foreign key for farmer_tags
ALTER TABLE farmer_tags DROP CONSTRAINT IF EXISTS farmer_tags_farmer_tenant_fk;
ALTER TABLE farmer_tags ADD CONSTRAINT farmer_tags_farmer_tenant_fk 
  FOREIGN KEY (farmer_id, tenant_id) REFERENCES farmers(id, tenant_id);

-- Ensure farmer_notes table has proper structure
ALTER TABLE farmer_notes ADD COLUMN IF NOT EXISTS tenant_id UUID;
UPDATE farmer_notes SET tenant_id = (SELECT tenant_id FROM farmers WHERE farmers.id = farmer_notes.farmer_id) WHERE tenant_id IS NULL;
ALTER TABLE farmer_notes ALTER COLUMN tenant_id SET NOT NULL;

-- Add composite foreign key for farmer_notes
ALTER TABLE farmer_notes DROP CONSTRAINT IF EXISTS farmer_notes_farmer_tenant_fk;
ALTER TABLE farmer_notes ADD CONSTRAINT farmer_notes_farmer_tenant_fk 
  FOREIGN KEY (farmer_id, tenant_id) REFERENCES farmers(id, tenant_id);

-- Ensure farmer_communications table has proper structure
ALTER TABLE farmer_communications ADD COLUMN IF NOT EXISTS tenant_id UUID;
UPDATE farmer_communications SET tenant_id = (SELECT tenant_id FROM farmers WHERE farmers.id = farmer_communications.farmer_id) WHERE tenant_id IS NULL;
ALTER TABLE farmer_communications ALTER COLUMN tenant_id SET NOT NULL;

-- Add composite foreign key for farmer_communications
ALTER TABLE farmer_communications DROP CONSTRAINT IF EXISTS farmer_communications_farmer_tenant_fk;
ALTER TABLE farmer_communications ADD CONSTRAINT farmer_communications_farmer_tenant_fk 
  FOREIGN KEY (farmer_id, tenant_id) REFERENCES farmers(id, tenant_id);

-- Ensure crop_history table has proper tenant isolation
ALTER TABLE crop_history ADD COLUMN IF NOT EXISTS farmer_id UUID;
UPDATE crop_history SET farmer_id = (SELECT farmer_id FROM lands WHERE lands.id = crop_history.land_id) WHERE farmer_id IS NULL;

-- Add composite foreign key for crop_history through lands
ALTER TABLE crop_history DROP CONSTRAINT IF EXISTS crop_history_land_tenant_fk;
ALTER TABLE crop_history ADD CONSTRAINT crop_history_land_tenant_fk 
  FOREIGN KEY (land_id, tenant_id) REFERENCES lands(id, tenant_id);

-- Ensure crop_health_assessments table has proper tenant isolation  
ALTER TABLE crop_health_assessments ADD COLUMN IF NOT EXISTS farmer_id UUID;
UPDATE crop_health_assessments SET farmer_id = (SELECT farmer_id FROM lands WHERE lands.id = crop_health_assessments.land_id) WHERE farmer_id IS NULL;

-- Add composite foreign key for crop_health_assessments through lands
ALTER TABLE crop_health_assessments DROP CONSTRAINT IF EXISTS crop_health_assessments_land_tenant_fk;
ALTER TABLE crop_health_assessments ADD CONSTRAINT crop_health_assessments_land_tenant_fk 
  FOREIGN KEY (land_id, tenant_id) REFERENCES lands(id, tenant_id);

-- Enable RLS on all farmer-related tables
ALTER TABLE farmer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_authentication ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for farmer_addresses
CREATE POLICY "Tenant users can manage farmer addresses" ON farmer_addresses
FOR ALL USING (
  tenant_id IN (
    SELECT user_tenants.tenant_id 
    FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() 
    AND user_tenants.is_active = true
  )
);

-- Create RLS policies for farmer_contacts
CREATE POLICY "Tenant users can manage farmer contacts" ON farmer_contacts
FOR ALL USING (
  tenant_id IN (
    SELECT user_tenants.tenant_id 
    FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() 
    AND user_tenants.is_active = true
  )
);

-- Create RLS policies for farmer_authentication
CREATE POLICY "Tenant users can manage farmer authentication" ON farmer_authentication
FOR ALL USING (
  tenant_id IN (
    SELECT user_tenants.tenant_id 
    FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() 
    AND user_tenants.is_active = true
  )
);

-- Create function to validate Indian mobile numbers
CREATE OR REPLACE FUNCTION validate_indian_mobile(mobile_number TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Remove any spaces, dashes, or special characters
  mobile_number := regexp_replace(mobile_number, '[^0-9+]', '', 'g');
  
  -- Check if it starts with +91 or 91 or is 10 digits
  IF mobile_number ~ '^(\+91|91)?[6-9][0-9]{9}$' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create function to format Indian mobile number
CREATE OR REPLACE FUNCTION format_indian_mobile(mobile_number TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove any spaces, dashes, or special characters
  mobile_number := regexp_replace(mobile_number, '[^0-9+]', '', 'g');
  
  -- If it starts with +91, return as is
  IF mobile_number ~ '^\+91[6-9][0-9]{9}$' THEN
    RETURN mobile_number;
  END IF;
  
  -- If it starts with 91, add +
  IF mobile_number ~ '^91[6-9][0-9]{9}$' THEN
    RETURN '+' || mobile_number;
  END IF;
  
  -- If it's 10 digits starting with 6-9, add +91
  IF mobile_number ~ '^[6-9][0-9]{9}$' THEN
    RETURN '+91' || mobile_number;
  END IF;
  
  -- Invalid format
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_farmer_addresses_updated_at BEFORE UPDATE ON farmer_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farmer_contacts_updated_at BEFORE UPDATE ON farmer_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farmer_authentication_updated_at BEFORE UPDATE ON farmer_authentication FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
