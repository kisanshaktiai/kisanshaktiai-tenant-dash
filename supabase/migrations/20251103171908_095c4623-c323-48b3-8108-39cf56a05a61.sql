-- Create audit_logs table for tracking all organization changes
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_email TEXT,
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete'
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  field_name TEXT,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX idx_audit_logs_tenant_id ON public.audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);

-- RLS Policies
CREATE POLICY "Users can view audit logs for their tenant"
  ON public.audit_logs
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Add realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;

-- Create organization_analytics table for cached analytics data
CREATE TABLE IF NOT EXISTS public.organization_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
  total_farmers INTEGER DEFAULT 0,
  active_farmers INTEGER DEFAULT 0,
  total_dealers INTEGER DEFAULT 0,
  active_dealers INTEGER DEFAULT 0,
  total_products INTEGER DEFAULT 0,
  active_products INTEGER DEFAULT 0,
  total_campaigns INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  revenue_impact DECIMAL(15,2) DEFAULT 0,
  storage_used_mb INTEGER DEFAULT 0,
  api_calls_today INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organization_analytics ENABLE ROW LEVEL SECURITY;

-- Create index
CREATE INDEX idx_org_analytics_tenant_id ON public.organization_analytics(tenant_id);

-- RLS Policies
CREATE POLICY "Users can view analytics for their tenant"
  ON public.organization_analytics
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "System can update analytics"
  ON public.organization_analytics
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to update analytics
CREATE OR REPLACE FUNCTION public.refresh_organization_analytics(p_tenant_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.organization_analytics (
    tenant_id,
    total_farmers,
    active_farmers,
    total_dealers,
    active_dealers,
    total_products,
    active_products,
    total_campaigns,
    calculated_at,
    updated_at
  )
  VALUES (
    p_tenant_id,
    (SELECT COUNT(*) FROM public.farmers WHERE tenant_id = p_tenant_id),
    (SELECT COUNT(*) FROM public.farmers WHERE tenant_id = p_tenant_id AND status = 'active'),
    (SELECT COUNT(*) FROM public.dealers WHERE tenant_id = p_tenant_id),
    (SELECT COUNT(*) FROM public.dealers WHERE tenant_id = p_tenant_id AND status = 'active'),
    (SELECT COUNT(*) FROM public.products WHERE tenant_id = p_tenant_id),
    (SELECT COUNT(*) FROM public.products WHERE tenant_id = p_tenant_id AND is_active = true),
    (SELECT COUNT(*) FROM public.campaigns WHERE tenant_id = p_tenant_id),
    now(),
    now()
  )
  ON CONFLICT (tenant_id)
  DO UPDATE SET
    total_farmers = EXCLUDED.total_farmers,
    active_farmers = EXCLUDED.active_farmers,
    total_dealers = EXCLUDED.total_dealers,
    active_dealers = EXCLUDED.active_dealers,
    total_products = EXCLUDED.total_products,
    active_products = EXCLUDED.active_products,
    total_campaigns = EXCLUDED.total_campaigns,
    calculated_at = now(),
    updated_at = now();
END;
$$;

-- Create AI insights table
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- 'security', 'performance', 'cost', 'engagement'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,
  impact_score INTEGER DEFAULT 0, -- 0-100
  data_source JSONB,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Create index
CREATE INDEX idx_ai_insights_tenant_id ON public.ai_insights(tenant_id);
CREATE INDEX idx_ai_insights_priority ON public.ai_insights(priority);
CREATE INDEX idx_ai_insights_is_resolved ON public.ai_insights(is_resolved);

-- RLS Policies
CREATE POLICY "Users can view AI insights for their tenant"
  ON public.ai_insights
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update AI insights for their tenant"
  ON public.ai_insights
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Add realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_insights;