
-- Create leads table to store inquiry form submissions
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  organization_type TEXT NOT NULL CHECK (organization_type IN ('agri_company', 'ngo', 'university', 'government', 'cooperative')),
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-1000', '1000+')),
  expected_farmers INTEGER,
  budget_range TEXT CHECK (budget_range IN ('under_10k', '10k_50k', '50k_100k', '100k_plus')),
  timeline TEXT CHECK (timeline IN ('immediate', '1_month', '3_months', '6_months', 'flexible')),
  requirements TEXT,
  current_solution TEXT,
  how_did_you_hear TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'closed_won', 'closed_lost')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  lead_source TEXT DEFAULT 'website',
  notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  follow_up_date DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy for public to submit leads (inquiry form)
CREATE POLICY "Anyone can submit leads" ON public.leads
  FOR INSERT WITH CHECK (true);

-- Policy for admin users to manage all leads
CREATE POLICY "Admins can manage all leads" ON public.leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_leads_updated_at();
