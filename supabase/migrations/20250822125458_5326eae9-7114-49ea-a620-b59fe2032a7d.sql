
-- Create executive dashboard metrics table
CREATE TABLE public.executive_dashboard_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC(15,4) NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- 'kpi', 'trend', 'comparison'
  time_period VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  dimensions JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  recorded_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create farmer analytics table
CREATE TABLE public.farmer_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  farmer_id UUID NOT NULL,
  adoption_score NUMERIC(5,2) DEFAULT 0,
  engagement_score NUMERIC(5,2) DEFAULT 0,
  lifetime_value NUMERIC(12,2) DEFAULT 0,
  churn_risk_score NUMERIC(5,2) DEFAULT 0,
  segment VARCHAR(50),
  last_activity_date DATE,
  total_transactions INTEGER DEFAULT 0,
  total_spent NUMERIC(12,2) DEFAULT 0,
  app_usage_days INTEGER DEFAULT 0,
  features_used JSONB DEFAULT '[]',
  performance_metrics JSONB DEFAULT '{}',
  predicted_metrics JSONB DEFAULT '{}',
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product performance analytics table
CREATE TABLE public.product_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  product_id UUID NOT NULL,
  time_period VARCHAR(50) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  revenue NUMERIC(12,2) DEFAULT 0,
  conversion_rate NUMERIC(5,4) DEFAULT 0,
  average_order_value NUMERIC(10,2) DEFAULT 0,
  geographic_performance JSONB DEFAULT '{}',
  seasonal_trends JSONB DEFAULT '{}',
  competitive_metrics JSONB DEFAULT '{}',
  inventory_turnover NUMERIC(8,4) DEFAULT 0,
  profit_margin NUMERIC(5,4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create custom reports table
CREATE TABLE public.custom_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  report_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL, -- 'dashboard', 'table', 'chart'
  description TEXT,
  query_config JSONB NOT NULL DEFAULT '{}',
  visualization_config JSONB NOT NULL DEFAULT '{}',
  filters JSONB DEFAULT '{}',
  schedule_config JSONB DEFAULT '{}', -- for automated reports
  is_public BOOLEAN DEFAULT false,
  is_scheduled BOOLEAN DEFAULT false,
  created_by UUID,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create report executions table
CREATE TABLE public.report_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  execution_status VARCHAR(50) NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
  result_data JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  row_count INTEGER DEFAULT 0,
  file_url TEXT, -- for exported reports
  executed_by UUID,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create predictive analytics table
CREATE TABLE public.predictive_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  model_type VARCHAR(100) NOT NULL, -- 'demand_forecast', 'churn_prediction', 'yield_prediction'
  target_entity_type VARCHAR(50) NOT NULL, -- 'farmer', 'product', 'campaign'
  target_entity_id UUID,
  prediction_date DATE NOT NULL,
  prediction_horizon INTEGER NOT NULL, -- days into future
  predicted_value NUMERIC(15,4),
  confidence_score NUMERIC(5,4) DEFAULT 0,
  model_version VARCHAR(50),
  input_features JSONB DEFAULT '{}',
  prediction_metadata JSONB DEFAULT '{}',
  actual_value NUMERIC(15,4), -- filled in later for model accuracy tracking
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data export logs table
CREATE TABLE public.data_export_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  export_type VARCHAR(50) NOT NULL, -- 'excel', 'csv', 'pdf', 'api'
  export_format VARCHAR(20) NOT NULL,
  data_source VARCHAR(100) NOT NULL,
  filters_applied JSONB DEFAULT '{}',
  row_count INTEGER DEFAULT 0,
  file_size_bytes INTEGER DEFAULT 0,
  file_url TEXT,
  download_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  exported_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_executive_dashboard_metrics_tenant_date ON public.executive_dashboard_metrics(tenant_id, recorded_date);
CREATE INDEX idx_executive_dashboard_metrics_name ON public.executive_dashboard_metrics(metric_name);
CREATE INDEX idx_farmer_analytics_tenant_farmer ON public.farmer_analytics(tenant_id, farmer_id);
CREATE INDEX idx_farmer_analytics_segment ON public.farmer_analytics(segment);
CREATE INDEX idx_farmer_analytics_churn_risk ON public.farmer_analytics(churn_risk_score DESC);
CREATE INDEX idx_product_analytics_tenant_product ON public.product_analytics(tenant_id, product_id);
CREATE INDEX idx_product_analytics_period ON public.product_analytics(period_start, period_end);
CREATE INDEX idx_custom_reports_tenant ON public.custom_reports(tenant_id);
CREATE INDEX idx_custom_reports_schedule ON public.custom_reports(is_scheduled, next_run_at);
CREATE INDEX idx_report_executions_report ON public.report_executions(report_id);
CREATE INDEX idx_report_executions_status ON public.report_executions(execution_status);
CREATE INDEX idx_predictive_analytics_tenant_type ON public.predictive_analytics(tenant_id, model_type);
CREATE INDEX idx_predictive_analytics_target ON public.predictive_analytics(target_entity_type, target_entity_id);
CREATE INDEX idx_data_export_logs_tenant ON public.data_export_logs(tenant_id);
CREATE INDEX idx_data_export_logs_expires ON public.data_export_logs(expires_at);

-- Add RLS policies
ALTER TABLE public.executive_dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_logs ENABLE ROW LEVEL SECURITY;

-- Executive dashboard metrics policies
CREATE POLICY "Tenant users can manage dashboard metrics" ON public.executive_dashboard_metrics
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

-- Farmer analytics policies
CREATE POLICY "Tenant users can view farmer analytics" ON public.farmer_analytics
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

-- Product analytics policies
CREATE POLICY "Tenant users can view product analytics" ON public.product_analytics
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

-- Custom reports policies
CREATE POLICY "Tenant users can manage reports" ON public.custom_reports
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

-- Report executions policies
CREATE POLICY "Tenant users can view executions" ON public.report_executions
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

-- Predictive analytics policies
CREATE POLICY "Tenant users can view predictions" ON public.predictive_analytics
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

-- Data export logs policies
CREATE POLICY "Tenant users can view export logs" ON public.data_export_logs
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

-- Add foreign key constraints
ALTER TABLE public.executive_dashboard_metrics ADD CONSTRAINT fk_executive_metrics_tenant 
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.farmer_analytics ADD CONSTRAINT fk_farmer_analytics_tenant 
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.product_analytics ADD CONSTRAINT fk_product_analytics_tenant 
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.custom_reports ADD CONSTRAINT fk_custom_reports_tenant 
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.report_executions ADD CONSTRAINT fk_report_executions_report 
  FOREIGN KEY (report_id) REFERENCES public.custom_reports(id) ON DELETE CASCADE;

ALTER TABLE public.report_executions ADD CONSTRAINT fk_report_executions_tenant 
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.predictive_analytics ADD CONSTRAINT fk_predictive_analytics_tenant 
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.data_export_logs ADD CONSTRAINT fk_data_export_logs_tenant 
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Add triggers for updated_at
CREATE TRIGGER update_executive_dashboard_metrics_updated_at BEFORE UPDATE ON public.executive_dashboard_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farmer_analytics_updated_at BEFORE UPDATE ON public.farmer_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_analytics_updated_at BEFORE UPDATE ON public.product_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_reports_updated_at BEFORE UPDATE ON public.custom_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_predictive_analytics_updated_at BEFORE UPDATE ON public.predictive_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_export_logs_updated_at BEFORE UPDATE ON public.data_export_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
