
-- Create campaigns table with advanced features
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN ('promotional', 'educational', 'seasonal', 'government_scheme')),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled')),
  
  -- Scheduling
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Budget & Targeting
  total_budget DECIMAL(12,2),
  spent_budget DECIMAL(12,2) DEFAULT 0,
  target_audience_size INTEGER DEFAULT 0,
  
  -- Content & Channels
  channels JSONB DEFAULT '[]'::jsonb, -- ['sms', 'whatsapp', 'app', 'email']
  content_config JSONB DEFAULT '{}'::jsonb,
  personalization_config JSONB DEFAULT '{}'::jsonb,
  
  -- Automation
  is_automated BOOLEAN DEFAULT false,
  automation_config JSONB DEFAULT '{}'::jsonb,
  trigger_config JSONB DEFAULT '{}'::jsonb,
  
  -- A/B Testing
  ab_testing_config JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  tags JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create campaign segments table
CREATE TABLE IF NOT EXISTS campaign_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  segment_type VARCHAR(50) NOT NULL DEFAULT 'custom',
  
  -- Segment Logic
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  logic_operator VARCHAR(10) DEFAULT 'AND' CHECK (logic_operator IN ('AND', 'OR')),
  
  -- Geographic & Behavioral
  geographic_filters JSONB DEFAULT '{}'::jsonb,
  behavioral_filters JSONB DEFAULT '{}'::jsonb,
  crop_filters JSONB DEFAULT '{}'::jsonb,
  
  -- Exclusions
  exclusion_rules JSONB DEFAULT '{}'::jsonb,
  
  -- Metrics
  estimated_size INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE,
  
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create campaign templates table
CREATE TABLE IF NOT EXISTS campaign_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_type VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  
  -- Template Content
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  layout_config JSONB DEFAULT '{}'::jsonb,
  style_config JSONB DEFAULT '{}'::jsonb,
  
  -- Multi-language
  language_versions JSONB DEFAULT '{}'::jsonb,
  default_language VARCHAR(10) DEFAULT 'en',
  
  -- Usage & Performance
  usage_count INTEGER DEFAULT 0,
  performance_score DECIMAL(3,2),
  
  is_public BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create campaign executions table for tracking delivery
CREATE TABLE IF NOT EXISTS campaign_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  farmer_id UUID,
  
  -- Delivery Details
  channel VARCHAR(50) NOT NULL,
  message_content JSONB,
  personalized_content JSONB,
  
  -- Status & Tracking
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'clicked', 'converted', 'failed', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,
  
  -- Engagement Metrics
  engagement_score DECIMAL(3,2),
  conversion_value DECIMAL(10,2),
  
  -- Error Handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create campaign analytics table for performance tracking
CREATE TABLE IF NOT EXISTS campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  
  -- Time Period
  date_period DATE NOT NULL,
  hour_period INTEGER, -- For hourly analytics
  
  -- Metrics by Channel
  channel VARCHAR(50) NOT NULL,
  
  -- Delivery Metrics
  messages_sent INTEGER DEFAULT 0,
  messages_delivered INTEGER DEFAULT 0,
  messages_failed INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Engagement Metrics
  open_rate DECIMAL(5,2) DEFAULT 0,
  click_rate DECIMAL(5,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  unsubscribe_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Financial Metrics
  cost_per_message DECIMAL(8,4),
  total_cost DECIMAL(10,2),
  revenue_generated DECIMAL(12,2),
  roi DECIMAL(8,2),
  
  -- Advanced Metrics
  engagement_score DECIMAL(5,2),
  viral_coefficient DECIMAL(5,2),
  customer_lifetime_value DECIMAL(10,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(campaign_id, date_period, hour_period, channel)
);

-- Create campaign automations table
CREATE TABLE IF NOT EXISTS campaign_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Automation Type & Config
  automation_type VARCHAR(50) NOT NULL CHECK (automation_type IN ('trigger_based', 'drip_sequence', 'event_based', 'seasonal', 'follow_up', 'response_based')),
  trigger_conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Flow Configuration
  workflow_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  timing_config JSONB DEFAULT '{}'::jsonb,
  
  -- Status & Metrics
  is_active BOOLEAN DEFAULT true,
  total_executions INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_id ON campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_campaign_segments_tenant_id ON campaign_segments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_segments_active ON campaign_segments(is_active);

CREATE INDEX IF NOT EXISTS idx_campaign_templates_tenant_id ON campaign_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_type ON campaign_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_public ON campaign_templates(is_public);

CREATE INDEX IF NOT EXISTS idx_campaign_executions_campaign_id ON campaign_executions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_executions_farmer_id ON campaign_executions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_campaign_executions_status ON campaign_executions(status);
CREATE INDEX IF NOT EXISTS idx_campaign_executions_channel ON campaign_executions(channel);

CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_date ON campaign_analytics(date_period);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_channel ON campaign_analytics(channel);

CREATE INDEX IF NOT EXISTS idx_campaign_automations_tenant_id ON campaign_automations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_automations_type ON campaign_automations(automation_type);
CREATE INDEX IF NOT EXISTS idx_campaign_automations_active ON campaign_automations(is_active);

-- Enable RLS on all tables
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_automations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for campaigns
CREATE POLICY "Tenant users can manage their campaigns" ON campaigns
FOR ALL USING (
  tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  )
);

CREATE POLICY "Tenant users can manage their segments" ON campaign_segments
FOR ALL USING (
  tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  )
);

CREATE POLICY "Users can view public templates or manage their own" ON campaign_templates
FOR ALL USING (
  is_public = true OR 
  tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  )
);

CREATE POLICY "Tenant users can manage their campaign executions" ON campaign_executions
FOR ALL USING (
  tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  )
);

CREATE POLICY "Tenant users can view their campaign analytics" ON campaign_analytics
FOR ALL USING (
  tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  )
);

CREATE POLICY "Tenant users can manage their automations" ON campaign_automations
FOR ALL USING (
  tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  )
);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_segments_updated_at BEFORE UPDATE ON campaign_segments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_templates_updated_at BEFORE UPDATE ON campaign_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_executions_updated_at BEFORE UPDATE ON campaign_executions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_analytics_updated_at BEFORE UPDATE ON campaign_analytics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_automations_updated_at BEFORE UPDATE ON campaign_automations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
