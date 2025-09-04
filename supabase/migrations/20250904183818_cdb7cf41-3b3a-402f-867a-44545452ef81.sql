-- Create comprehensive dealers table with tenant isolation
CREATE TABLE IF NOT EXISTS public.dealers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  dealer_code VARCHAR(50) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  contact_person VARCHAR(255) NOT NULL,
  designation VARCHAR(100),
  phone VARCHAR(20) NOT NULL,
  alternate_phone VARCHAR(20),
  email VARCHAR(255) NOT NULL,
  alternate_email VARCHAR(255),
  website VARCHAR(255),
  
  -- Address information
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  postal_code VARCHAR(20),
  gps_location JSONB,
  
  -- Business information
  gst_number VARCHAR(50),
  pan_number VARCHAR(50),
  business_type VARCHAR(50) DEFAULT 'retailer', -- retailer, distributor, wholesaler
  establishment_year INTEGER,
  employee_count INTEGER,
  
  -- Territory and coverage
  territory_id UUID,
  assigned_zones TEXT[],
  coverage_area_km NUMERIC(10, 2),
  service_villages TEXT[],
  
  -- Performance metrics
  performance_score NUMERIC(3, 2) DEFAULT 0.00,
  sales_target NUMERIC(15, 2),
  sales_achieved NUMERIC(15, 2) DEFAULT 0.00,
  customer_rating NUMERIC(2, 1) DEFAULT 0.0,
  total_farmers_served INTEGER DEFAULT 0,
  
  -- Commission and financials
  commission_rate NUMERIC(5, 2) DEFAULT 0.00,
  outstanding_amount NUMERIC(15, 2) DEFAULT 0.00,
  credit_limit NUMERIC(15, 2) DEFAULT 0.00,
  payment_terms VARCHAR(50),
  
  -- Verification and compliance
  verification_status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
  kyc_documents JSONB DEFAULT '[]'::jsonb,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  agreement_signed BOOLEAN DEFAULT false,
  agreement_date DATE,
  
  -- Activity tracking
  last_order_date DATE,
  total_orders INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  engagement_score NUMERIC(3, 2) DEFAULT 0.00,
  
  -- Status and metadata
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, suspended, blocked
  onboarding_status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  
  UNIQUE(tenant_id, dealer_code),
  UNIQUE(tenant_id, email)
);

-- Create dealer_territories table
CREATE TABLE IF NOT EXISTS public.dealer_territories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  territory_name VARCHAR(255) NOT NULL,
  territory_type VARCHAR(50) DEFAULT 'primary', -- primary, secondary, temporary
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

-- Create dealer_performance_history table
CREATE TABLE IF NOT EXISTS public.dealer_performance_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  period_type VARCHAR(20) NOT NULL, -- daily, weekly, monthly, quarterly, yearly
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

-- Create dealer_communications table
CREATE TABLE IF NOT EXISTS public.dealer_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  communication_type VARCHAR(50) NOT NULL, -- announcement, alert, notification, message
  channel VARCHAR(50) NOT NULL, -- sms, whatsapp, email, in_app
  subject VARCHAR(255),
  content TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, failed, read
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Create dealer_incentives table
CREATE TABLE IF NOT EXISTS public.dealer_incentives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  incentive_type VARCHAR(50) NOT NULL, -- commission, bonus, reward, recognition
  incentive_name VARCHAR(255) NOT NULL,
  description TEXT,
  amount NUMERIC(15, 2),
  percentage NUMERIC(5, 2),
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  achievement_status VARCHAR(50) DEFAULT 'pending', -- pending, achieved, paid, cancelled
  achieved_date DATE,
  payout_date DATE,
  payout_reference VARCHAR(100),
  valid_from DATE,
  valid_till DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_dealers_tenant_id ON public.dealers(tenant_id);
CREATE INDEX idx_dealers_status ON public.dealers(status);
CREATE INDEX idx_dealers_verification_status ON public.dealers(verification_status);
CREATE INDEX idx_dealers_city_state ON public.dealers(city, state);
CREATE INDEX idx_dealers_performance ON public.dealers(performance_score DESC);
CREATE INDEX idx_dealer_territories_dealer ON public.dealer_territories(dealer_id);
CREATE INDEX idx_dealer_performance_dealer_period ON public.dealer_performance_history(dealer_id, period_type, period_start);
CREATE INDEX idx_dealer_communications_dealer ON public.dealer_communications(dealer_id);
CREATE INDEX idx_dealer_incentives_dealer ON public.dealer_incentives(dealer_id);

-- Enable Row Level Security
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_performance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_incentives ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dealers table
CREATE POLICY "Tenant users can view their dealers"
  ON public.dealers
  FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Tenant admins can manage dealers"
  ON public.dealers
  FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() 
    AND is_active = true 
    AND role IN ('tenant_owner', 'tenant_admin')
  ));

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

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dealers_updated_at
  BEFORE UPDATE ON public.dealers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealer_territories_updated_at
  BEFORE UPDATE ON public.dealer_territories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealer_incentives_updated_at
  BEFORE UPDATE ON public.dealer_incentives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for dealers
ALTER PUBLICATION supabase_realtime ADD TABLE public.dealers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dealer_territories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dealer_performance_history;