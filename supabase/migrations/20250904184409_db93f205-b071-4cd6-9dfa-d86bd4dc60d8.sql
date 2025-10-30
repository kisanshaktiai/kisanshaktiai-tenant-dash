-- Drop existing tables and indexes if they exist
DROP TABLE IF EXISTS public.dealer_incentives CASCADE;
DROP TABLE IF EXISTS public.dealer_communications CASCADE;
DROP TABLE IF EXISTS public.dealer_performance_history CASCADE;
DROP TABLE IF EXISTS public.dealer_territories CASCADE;

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_dealers_tenant_id;
DROP INDEX IF EXISTS idx_dealers_status;
DROP INDEX IF EXISTS idx_dealers_verification_status;
DROP INDEX IF EXISTS idx_dealers_city_state;
DROP INDEX IF EXISTS idx_dealers_performance;

-- Now alter the existing dealers table to add new columns
ALTER TABLE public.dealers 
ADD COLUMN IF NOT EXISTS legal_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS designation VARCHAR(100),
ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS alternate_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255),
ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India',
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS gps_location JSONB,
ADD COLUMN IF NOT EXISTS gst_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS pan_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS business_type VARCHAR(50) DEFAULT 'retailer',
ADD COLUMN IF NOT EXISTS establishment_year INTEGER,
ADD COLUMN IF NOT EXISTS employee_count INTEGER,
ADD COLUMN IF NOT EXISTS territory_id UUID,
ADD COLUMN IF NOT EXISTS assigned_zones TEXT[],
ADD COLUMN IF NOT EXISTS coverage_area_km NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS service_villages TEXT[],
ADD COLUMN IF NOT EXISTS performance_score NUMERIC(3, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS sales_target NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS sales_achieved NUMERIC(15, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS customer_rating NUMERIC(2, 1) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS total_farmers_served INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS outstanding_amount NUMERIC(15, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(15, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(50),
ADD COLUMN IF NOT EXISTS kyc_documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_by UUID,
ADD COLUMN IF NOT EXISTS agreement_signed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS agreement_date DATE,
ADD COLUMN IF NOT EXISTS last_order_date DATE,
ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS engagement_score NUMERIC(3, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Recreate dealer_territories table
CREATE TABLE public.dealer_territories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  territory_name VARCHAR(255) NOT NULL,
  territory_type VARCHAR(50) DEFAULT 'primary',
  coverage_villages TEXT[],
  coverage_blocks TEXT[],
  coverage_districts TEXT[],
  population_served INTEGER,
  farmer_count INTEGER,
  area_sq_km NUMERIC(10, 2),
  boundary_geojson JSONB,
  assigned_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Recreate dealer_performance_history table
CREATE TABLE public.dealer_performance_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  period_type VARCHAR(20) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  sales_target NUMERIC(15, 2),
  sales_achieved NUMERIC(15, 2),
  order_count INTEGER DEFAULT 0,
  farmer_acquisitions INTEGER DEFAULT 0,
  product_categories_sold INTEGER DEFAULT 0,
  avg_order_value NUMERIC(15, 2),
  commission_earned NUMERIC(15, 2),
  performance_score NUMERIC(3, 2),
  ranking INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Recreate dealer_communications table
CREATE TABLE public.dealer_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  communication_type VARCHAR(50) NOT NULL,
  channel VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  content TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Recreate dealer_incentives table
CREATE TABLE public.dealer_incentives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  incentive_type VARCHAR(50) NOT NULL,
  incentive_name VARCHAR(255) NOT NULL,
  description TEXT,
  amount NUMERIC(15, 2),
  percentage NUMERIC(5, 2),
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  achievement_status VARCHAR(50) DEFAULT 'pending',
  achieved_date DATE,
  payout_date DATE,
  payout_reference VARCHAR(100),
  valid_from DATE,
  valid_till DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Recreate indexes
CREATE INDEX idx_dealer_territories_dealer ON public.dealer_territories(dealer_id);
CREATE INDEX idx_dealer_performance_dealer_period ON public.dealer_performance_history(dealer_id, period_type, period_start);
CREATE INDEX idx_dealer_communications_dealer ON public.dealer_communications(dealer_id);
CREATE INDEX idx_dealer_incentives_dealer ON public.dealer_incentives(dealer_id);

-- Enable Row Level Security on new tables
ALTER TABLE public.dealer_territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_performance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_incentives ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dealer_territories
CREATE POLICY "Tenant users can view territories"
  ON public.dealer_territories
  FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Tenant admins can manage territories"
  ON public.dealer_territories
  FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true 
    AND role IN ('tenant_owner', 'tenant_admin')
  ));

-- Create RLS policies for dealer_performance_history
CREATE POLICY "Tenant users can view performance"
  ON public.dealer_performance_history
  FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "System can insert performance records"
  ON public.dealer_performance_history
  FOR INSERT
  WITH CHECK (true);

-- Create RLS policies for dealer_communications
CREATE POLICY "Tenant users can view communications"
  ON public.dealer_communications
  FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Tenant admins can manage communications"
  ON public.dealer_communications
  FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true 
    AND role IN ('tenant_owner', 'tenant_admin')
  ));

-- Create RLS policies for dealer_incentives
CREATE POLICY "Tenant users can view incentives"
  ON public.dealer_incentives
  FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Tenant admins can manage incentives"
  ON public.dealer_incentives
  FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true 
    AND role IN ('tenant_owner', 'tenant_admin')
  ));

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_dealer_territories_updated_at
  BEFORE UPDATE ON public.dealer_territories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealer_incentives_updated_at
  BEFORE UPDATE ON public.dealer_incentives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for dealers tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.dealers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dealer_territories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dealer_performance_history;