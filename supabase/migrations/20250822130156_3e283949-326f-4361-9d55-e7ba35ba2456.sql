
-- Create dealers table (enhanced version)
CREATE TABLE IF NOT EXISTS public.dealers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  dealer_code VARCHAR(50) UNIQUE NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  alternate_phone VARCHAR(50),
  address JSONB NOT NULL DEFAULT '{}',
  business_type VARCHAR(100), -- 'retailer', 'distributor', 'agent'
  registration_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'rejected', 'suspended'
  onboarding_status VARCHAR(50) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  kyc_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  territory_id UUID,
  product_authorizations JSONB DEFAULT '[]', -- array of product IDs
  commission_structure JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  banking_details JSONB DEFAULT '{}',
  documents JSONB DEFAULT '[]', -- uploaded documents
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create territories table
CREATE TABLE public.dealer_territories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  territory_name VARCHAR(255) NOT NULL,
  territory_code VARCHAR(50) NOT NULL,
  description TEXT,
  geographic_boundaries JSONB NOT NULL DEFAULT '{}', -- GeoJSON or coordinate data
  coverage_areas JSONB DEFAULT '[]', -- cities, districts, postal codes
  population_data JSONB DEFAULT '{}',
  market_potential JSONB DEFAULT '{}',
  assigned_dealers JSONB DEFAULT '[]', -- array of dealer IDs
  territory_manager_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dealer performance tracking table
CREATE TABLE public.dealer_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  dealer_id UUID NOT NULL,
  performance_period VARCHAR(50) NOT NULL, -- 'monthly', 'quarterly', 'yearly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  sales_target NUMERIC(12,2) DEFAULT 0,
  sales_achieved NUMERIC(12,2) DEFAULT 0,
  farmers_acquired INTEGER DEFAULT 0,
  farmers_target INTEGER DEFAULT 0,
  product_sales JSONB DEFAULT '{}', -- product-wise sales data
  response_time_avg NUMERIC(8,2) DEFAULT 0, -- in hours
  customer_satisfaction_score NUMERIC(3,2) DEFAULT 0,
  commission_earned NUMERIC(10,2) DEFAULT 0,
  performance_score NUMERIC(5,2) DEFAULT 0,
  ranking INTEGER,
  achievements JSONB DEFAULT '[]',
  improvement_areas JSONB DEFAULT '[]',
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dealer communications table
CREATE TABLE IF NOT EXISTS public.dealer_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  communication_type VARCHAR(50) NOT NULL, -- 'announcement', 'training', 'notification', 'message'
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  sender_id UUID NOT NULL,
  recipient_ids UUID[] NOT NULL,
  attachments JSONB DEFAULT '[]',
  delivery_status JSONB DEFAULT '{}', -- per-recipient delivery status
  read_receipts JSONB DEFAULT '{}', -- per-recipient read status
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dealer incentives table
CREATE TABLE public.dealer_incentives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  dealer_id UUID,
  incentive_name VARCHAR(255) NOT NULL,
  incentive_type VARCHAR(50) NOT NULL, -- 'commission', 'bonus', 'reward', 'contest'
  calculation_method VARCHAR(50) NOT NULL, -- 'percentage', 'fixed', 'tiered', 'performance_based'
  criteria JSONB NOT NULL DEFAULT '{}',
  reward_structure JSONB NOT NULL DEFAULT '{}',
  eligibility_rules JSONB DEFAULT '{}',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'completed', 'cancelled'
  total_budget NUMERIC(12,2),
  amount_allocated NUMERIC(12,2) DEFAULT 0,
  amount_paid NUMERIC(12,2) DEFAULT 0,
  participants_count INTEGER DEFAULT 0,
  winners JSONB DEFAULT '[]',
  leaderboard JSONB DEFAULT '[]',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dealer onboarding steps table
CREATE TABLE public.dealer_onboarding_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  dealer_id UUID NOT NULL,
  step_name VARCHAR(255) NOT NULL,
  step_type VARCHAR(50) NOT NULL, -- 'document_upload', 'verification', 'training', 'agreement'
  step_order INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'skipped', 'failed'
  required_documents JSONB DEFAULT '[]',
  submitted_documents JSONB DEFAULT '[]',
  verification_data JSONB DEFAULT '{}',
  completion_data JSONB DEFAULT '{}',
  assigned_to UUID, -- staff member responsible
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_dealers_tenant ON public.dealers(tenant_id);
CREATE INDEX idx_dealers_code ON public.dealers(dealer_code);
CREATE INDEX idx_dealers_status ON public.dealers(registration_status);
CREATE INDEX idx_dealers_territory ON public.dealers(territory_id);

CREATE INDEX idx_dealer_territories_tenant ON public.dealer_territories(tenant_id);
CREATE INDEX idx_dealer_territories_code ON public.dealer_territories(territory_code);

CREATE INDEX idx_dealer_performance_dealer ON public.dealer_performance(dealer_id);
CREATE INDEX idx_dealer_performance_period ON public.dealer_performance(performance_period, period_start, period_end);

CREATE INDEX idx_dealer_communications_tenant ON public.dealer_communications(tenant_id);
CREATE INDEX idx_dealer_communications_recipients ON public.dealer_communications USING GIN(recipient_ids);
CREATE INDEX idx_dealer_communications_type ON public.dealer_communications(communication_type);

CREATE INDEX idx_dealer_incentives_tenant ON public.dealer_incentives(tenant_id);
CREATE INDEX idx_dealer_incentives_dealer ON public.dealer_incentives(dealer_id);
CREATE INDEX idx_dealer_incentives_status ON public.dealer_incentives(status);

CREATE INDEX idx_dealer_onboarding_steps_dealer ON public.dealer_onboarding_steps(dealer_id);
CREATE INDEX idx_dealer_onboarding_steps_status ON public.dealer_onboarding_steps(status);

-- Add RLS policies
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_incentives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_onboarding_steps ENABLE ROW LEVEL SECURITY;

-- Dealers policies
CREATE POLICY "Tenant users can manage dealers" ON public.dealers
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

-- Territories policies
CREATE POLICY "Tenant users can manage territories" ON public.dealer_territories
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

-- Performance policies
CREATE POLICY "Tenant users can view performance" ON public.dealer_performance
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

-- Communications policies
CREATE POLICY "Tenant users can manage communications" ON public.dealer_communications
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

-- Incentives policies
CREATE POLICY "Tenant users can manage incentives" ON public.dealer_incentives
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

-- Onboarding steps policies
CREATE POLICY "Tenant users can manage onboarding" ON public.dealer_onboarding_steps
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

-- Add foreign key constraints
ALTER TABLE public.dealers ADD CONSTRAINT fk_dealers_tenant 
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.dealers ADD CONSTRAINT fk_dealers_territory 
  FOREIGN KEY (territory_id) REFERENCES public.dealer_territories(id) ON DELETE SET NULL;

ALTER TABLE public.dealer_territories ADD CONSTRAINT fk_territories_tenant 
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.dealer_performance ADD CONSTRAINT fk_performance_dealer 
  FOREIGN KEY (dealer_id) REFERENCES public.dealers(id) ON DELETE CASCADE;

ALTER TABLE public.dealer_performance ADD CONSTRAINT fk_performance_tenant 
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.dealer_communications ADD CONSTRAINT fk_communications_tenant 
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.dealer_incentives ADD CONSTRAINT fk_incentives_tenant 
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.dealer_incentives ADD CONSTRAINT fk_incentives_dealer 
  FOREIGN KEY (dealer_id) REFERENCES public.dealers(id) ON DELETE CASCADE;

ALTER TABLE public.dealer_onboarding_steps ADD CONSTRAINT fk_onboarding_dealer 
  FOREIGN KEY (dealer_id) REFERENCES public.dealers(id) ON DELETE CASCADE;

ALTER TABLE public.dealer_onboarding_steps ADD CONSTRAINT fk_onboarding_tenant 
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Add triggers for updated_at
CREATE TRIGGER update_dealers_updated_at BEFORE UPDATE ON public.dealers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealer_territories_updated_at BEFORE UPDATE ON public.dealer_territories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealer_performance_updated_at BEFORE UPDATE ON public.dealer_performance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealer_communications_updated_at BEFORE UPDATE ON public.dealer_communications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealer_incentives_updated_at BEFORE UPDATE ON public.dealer_incentives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealer_onboarding_steps_updated_at BEFORE UPDATE ON public.dealer_onboarding_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
