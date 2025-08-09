
-- Create table to track email sending events
CREATE TABLE IF NOT EXISTS public.email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  email_address TEXT NOT NULL,
  template_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- Create policy for email events (admin access only)
CREATE POLICY "Admin can view email events" ON public.email_events
  FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "System can insert email events" ON public.email_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update email events" ON public.email_events
  FOR UPDATE USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_email_events_user_id ON public.email_events(user_id);
CREATE INDEX IF NOT EXISTS idx_email_events_status ON public.email_events(status);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON public.email_events(created_at);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_email_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_email_events_updated_at
  BEFORE UPDATE ON public.email_events
  FOR EACH ROW
  EXECUTE FUNCTION update_email_events_updated_at();
