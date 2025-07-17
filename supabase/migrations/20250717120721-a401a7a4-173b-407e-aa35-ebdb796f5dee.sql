-- Create API Keys table for managing tenant API access
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  key_name VARCHAR NOT NULL,
  api_key_hash TEXT NOT NULL UNIQUE,
  api_key_prefix VARCHAR(8) NOT NULL,
  permissions JSONB NOT NULL DEFAULT '[]'::JSONB,
  rate_limit_per_hour INTEGER NOT NULL DEFAULT 1000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Webhooks table for event subscriptions
CREATE TABLE public.webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  secret_key TEXT NOT NULL,
  retry_attempts INTEGER NOT NULL DEFAULT 3,
  timeout_seconds INTEGER NOT NULL DEFAULT 30,
  custom_headers JSONB DEFAULT '{}'::JSONB,
  event_filters JSONB DEFAULT '{}'::JSONB,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create API Logs table for request/response tracking
CREATE TABLE public.api_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  api_key_id UUID REFERENCES public.api_keys(id),
  endpoint VARCHAR NOT NULL,
  method VARCHAR NOT NULL,
  status_code INTEGER NOT NULL,
  request_headers JSONB,
  request_body JSONB,
  response_headers JSONB,
  response_body JSONB,
  response_time_ms INTEGER,
  ip_address INET,
  user_agent TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Webhook Logs table for webhook delivery tracking
CREATE TABLE public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id),
  event_type VARCHAR NOT NULL,
  payload JSONB NOT NULL,
  status_code INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  error_message TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Integrations table for external system connections
CREATE TABLE public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  integration_type VARCHAR NOT NULL, -- 'sap', 'salesforce', 'tally', 'whatsapp', 'payment_gateway', 'sms'
  name VARCHAR NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}'::JSONB,
  credentials JSONB NOT NULL DEFAULT '{}'::JSONB,
  field_mappings JSONB NOT NULL DEFAULT '{}'::JSONB,
  sync_settings JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR DEFAULT 'pending',
  error_log TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Integration Sync Logs table
CREATE TABLE public.integration_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.integrations(id),
  sync_type VARCHAR NOT NULL, -- 'full', 'incremental', 'manual'
  direction VARCHAR NOT NULL, -- 'import', 'export', 'bidirectional'
  records_processed INTEGER NOT NULL DEFAULT 0,
  records_success INTEGER NOT NULL DEFAULT 0,
  records_failed INTEGER NOT NULL DEFAULT 0,
  status VARCHAR NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
  error_details JSONB,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create Data Transformations table
CREATE TABLE public.data_transformations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR NOT NULL,
  source_format VARCHAR NOT NULL,
  target_format VARCHAR NOT NULL,
  transformation_rules JSONB NOT NULL,
  validation_rules JSONB DEFAULT '{}'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_transformations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Tenant users can manage their API keys" ON public.api_keys
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

CREATE POLICY "Tenant users can manage their webhooks" ON public.webhooks
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

CREATE POLICY "Tenant users can view their API logs" ON public.api_logs
  FOR SELECT USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

CREATE POLICY "Tenant users can view their webhook logs" ON public.webhook_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.webhooks 
    WHERE webhooks.id = webhook_logs.webhook_id 
    AND webhooks.tenant_id IN (
      SELECT user_tenants.tenant_id FROM user_tenants 
      WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
    )
  ));

CREATE POLICY "Tenant users can manage their integrations" ON public.integrations
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

CREATE POLICY "Tenant users can view their integration sync logs" ON public.integration_sync_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.integrations 
    WHERE integrations.id = integration_sync_logs.integration_id 
    AND integrations.tenant_id IN (
      SELECT user_tenants.tenant_id FROM user_tenants 
      WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
    )
  ));

CREATE POLICY "Tenant users can manage their data transformations" ON public.data_transformations
  FOR ALL USING (tenant_id IN (
    SELECT user_tenants.tenant_id FROM user_tenants 
    WHERE user_tenants.user_id = auth.uid() AND user_tenants.is_active = true
  ));

-- Create indexes for performance
CREATE INDEX idx_api_keys_tenant_id ON public.api_keys(tenant_id);
CREATE INDEX idx_api_keys_hash ON public.api_keys(api_key_hash);
CREATE INDEX idx_webhooks_tenant_id ON public.webhooks(tenant_id);
CREATE INDEX idx_api_logs_tenant_id ON public.api_logs(tenant_id);
CREATE INDEX idx_api_logs_created_at ON public.api_logs(created_at);
CREATE INDEX idx_webhook_logs_webhook_id ON public.webhook_logs(webhook_id);
CREATE INDEX idx_integrations_tenant_id ON public.integrations(tenant_id);
CREATE INDEX idx_integration_sync_logs_integration_id ON public.integration_sync_logs(integration_id);

-- Create triggers for updated_at
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON public.webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_transformations_updated_at
  BEFORE UPDATE ON public.data_transformations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();