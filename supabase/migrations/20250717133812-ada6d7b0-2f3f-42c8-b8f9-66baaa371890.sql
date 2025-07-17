
-- First, let's create a user_profiles table to bridge auth.users with our application data
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  avatar_url TEXT,
  date_of_birth DATE,
  gender VARCHAR,
  address JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tenant_settings table to manage tenant-specific configurations
CREATE TABLE IF NOT EXISTS public.tenant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  max_farmers INTEGER DEFAULT 10000,
  max_dealers INTEGER DEFAULT 1000,
  features_enabled JSONB DEFAULT '{}'::jsonb,
  billing_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Update farmers table to ensure proper relationships
ALTER TABLE public.farmers 
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN tenant_id SET NOT NULL;

-- Add constraint to ensure farmer belongs to a valid tenant
ALTER TABLE public.farmers 
  ADD CONSTRAINT fk_farmers_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Create function to handle new farmer registration
CREATE OR REPLACE FUNCTION public.create_farmer_profile(
  p_email VARCHAR,
  p_password VARCHAR,
  p_tenant_id UUID,
  p_farmer_data JSONB,
  p_profile_data JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB AS $$
DECLARE
  new_user_id UUID;
  new_farmer_id UUID;
  tenant_limit INTEGER;
  current_farmer_count INTEGER;
BEGIN
  -- Check tenant farmer limit
  SELECT max_farmers INTO tenant_limit 
  FROM tenant_settings 
  WHERE tenant_id = p_tenant_id;
  
  IF tenant_limit IS NULL THEN
    tenant_limit := 10000; -- Default limit
  END IF;
  
  -- Count existing farmers for tenant
  SELECT COUNT(*) INTO current_farmer_count 
  FROM farmers 
  WHERE tenant_id = p_tenant_id AND is_verified = true;
  
  IF current_farmer_count >= tenant_limit THEN
    RETURN json_build_object('error', 'Tenant farmer limit exceeded');
  END IF;
  
  -- Create auth user
  INSERT INTO auth.users (
    email, 
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data
  ) VALUES (
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    p_profile_data
  ) RETURNING id INTO new_user_id;
  
  -- Create user profile
  INSERT INTO user_profiles (
    id,
    full_name,
    phone,
    email,
    date_of_birth,
    gender,
    address
  ) VALUES (
    new_user_id,
    p_profile_data->>'full_name',
    p_profile_data->>'phone',
    p_email,
    (p_profile_data->>'date_of_birth')::date,
    p_profile_data->>'gender',
    p_profile_data->'address'
  );
  
  -- Create farmer record
  INSERT INTO farmers (
    id,
    tenant_id,
    farmer_code,
    farming_experience_years,
    total_land_acres,
    primary_crops,
    farm_type,
    has_irrigation,
    has_storage,
    has_tractor,
    irrigation_type,
    is_verified,
    created_at
  ) VALUES (
    new_user_id,
    p_tenant_id,
    p_farmer_data->>'farmer_code',
    (p_farmer_data->>'farming_experience_years')::integer,
    (p_farmer_data->>'total_land_acres')::numeric,
    ARRAY(SELECT jsonb_array_elements_text(p_farmer_data->'primary_crops')),
    p_farmer_data->>'farm_type',
    (p_farmer_data->>'has_irrigation')::boolean,
    (p_farmer_data->>'has_storage')::boolean,
    (p_farmer_data->>'has_tractor')::boolean,
    p_farmer_data->>'irrigation_type',
    false, -- Will be verified later
    now()
  ) RETURNING id INTO new_farmer_id;
  
  -- Create user_tenant relationship
  INSERT INTO user_tenants (
    user_id,
    tenant_id,
    role,
    is_active,
    is_primary
  ) VALUES (
    new_user_id,
    p_tenant_id,
    'farmer',
    true,
    true
  );
  
  -- Create default land record if land data provided
  IF p_farmer_data ? 'default_land' THEN
    INSERT INTO lands (
      farmer_id,
      tenant_id,
      name,
      area_acres,
      village,
      district,
      state,
      soil_type,
      water_source
    ) VALUES (
      new_user_id,
      p_tenant_id,
      'Main Farm',
      (p_farmer_data->'default_land'->>'area_acres')::numeric,
      p_farmer_data->'default_land'->>'village',
      p_farmer_data->'default_land'->>'district',
      p_farmer_data->'default_land'->>'state',
      p_farmer_data->'default_land'->>'soil_type',
      p_farmer_data->'default_land'->>'water_source'
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'farmer_id', new_farmer_id,
    'user_id', new_user_id
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS for new tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS policies for tenant_settings
CREATE POLICY "Tenant users can view their settings" ON tenant_settings
  FOR SELECT USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

CREATE POLICY "Tenant admins can manage settings" ON tenant_settings
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() 
    AND user_tenants.is_active = true 
    AND user_tenants.role IN ('admin', 'tenant_owner', 'tenant_admin')
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_farmers_tenant_code ON farmers(tenant_id, farmer_code);
CREATE INDEX IF NOT EXISTS idx_farmers_tenant_verified ON farmers(tenant_id, is_verified);

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_settings_updated_at
  BEFORE UPDATE ON tenant_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default tenant settings for existing tenants
INSERT INTO tenant_settings (tenant_id, max_farmers, max_dealers)
SELECT id, 10000, 1000 FROM tenants
ON CONFLICT (tenant_id) DO NOTHING;
