
-- Create enhanced farmer tables and related entities

-- Farmer tags for categorization and filtering
CREATE TABLE IF NOT EXISTS public.farmer_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  farmer_id UUID NOT NULL,
  tag_name TEXT NOT NULL,
  tag_color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE
);

-- Farmer segments for grouping and targeting
CREATE TABLE IF NOT EXISTS public.farmer_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  segment_name TEXT NOT NULL,
  segment_criteria JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  color TEXT DEFAULT '#10B981',
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Farmer notes for detailed tracking
CREATE TABLE IF NOT EXISTS public.farmer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  farmer_id UUID NOT NULL,
  note_content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  is_important BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE
);

-- Communication history tracking
CREATE TABLE IF NOT EXISTS public.farmer_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  farmer_id UUID NOT NULL,
  communication_type TEXT NOT NULL CHECK (communication_type IN ('sms', 'whatsapp', 'email', 'call', 'app_notification')),
  message_content TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  response_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed', 'bounced')),
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE
);

-- Farmer engagement metrics
CREATE TABLE IF NOT EXISTS public.farmer_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  farmer_id UUID NOT NULL,
  app_opens_count INTEGER DEFAULT 0,
  last_app_open TIMESTAMP WITH TIME ZONE,
  features_used TEXT[] DEFAULT '{}',
  communication_responses INTEGER DEFAULT 0,
  activity_score INTEGER DEFAULT 0,
  churn_risk_score INTEGER DEFAULT 0,
  engagement_level TEXT DEFAULT 'low' CHECK (engagement_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE,
  UNIQUE(tenant_id, farmer_id)
);

-- Lead management system
CREATE TABLE IF NOT EXISTS public.farmer_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  lead_source TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  location JSONB,
  land_size NUMERIC,
  crops_interested TEXT[],
  lead_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'converted', 'lost')),
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  converted_farmer_id UUID REFERENCES farmers(id),
  converted_at TIMESTAMP WITH TIME ZONE,
  next_follow_up TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Import/Export logs
CREATE TABLE IF NOT EXISTS public.farmer_import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  imported_by UUID REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_size INTEGER,
  total_records INTEGER DEFAULT 0,
  successful_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_log JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Bulk operations tracking
CREATE TABLE IF NOT EXISTS public.bulk_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  operation_type TEXT NOT NULL,
  target_farmer_ids UUID[] NOT NULL,
  operation_data JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_log JSONB DEFAULT '[]',
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Enable RLS on all new tables
ALTER TABLE public.farmer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_operations ENABLE ROW LEVEL SECURITY;

-- RLS policies for tenant isolation
CREATE POLICY "Tenant users can manage farmer tags" ON public.farmer_tags
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Tenant users can manage farmer segments" ON public.farmer_segments
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Tenant users can manage farmer notes" ON public.farmer_notes
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Tenant users can manage communications" ON public.farmer_communications
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Tenant users can manage engagement" ON public.farmer_engagement
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Tenant users can manage leads" ON public.farmer_leads
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Tenant users can view import logs" ON public.farmer_import_logs
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Tenant users can manage bulk operations" ON public.bulk_operations
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants 
    WHERE user_id = auth.uid() AND is_active = true
  ));

-- Create indexes for performance
CREATE INDEX idx_farmer_tags_tenant_farmer ON public.farmer_tags(tenant_id, farmer_id);
CREATE INDEX idx_farmer_segments_tenant ON public.farmer_segments(tenant_id);
CREATE INDEX idx_farmer_notes_tenant_farmer ON public.farmer_notes(tenant_id, farmer_id);
CREATE INDEX idx_farmer_communications_tenant_farmer ON public.farmer_communications(tenant_id, farmer_id);
CREATE INDEX idx_farmer_engagement_tenant_farmer ON public.farmer_engagement(tenant_id, farmer_id);
CREATE INDEX idx_farmer_leads_tenant_status ON public.farmer_leads(tenant_id, status);
CREATE INDEX idx_farmer_leads_assigned_to ON public.farmer_leads(assigned_to);
CREATE INDEX idx_bulk_operations_tenant_status ON public.bulk_operations(tenant_id, status);

-- Update triggers for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_farmer_segments_updated_at BEFORE UPDATE ON public.farmer_segments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farmer_notes_updated_at BEFORE UPDATE ON public.farmer_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farmer_engagement_updated_at BEFORE UPDATE ON public.farmer_engagement FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farmer_leads_updated_at BEFORE UPDATE ON public.farmer_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
