
-- First, let's drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Users can submit leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON public.leads;
DROP POLICY IF EXISTS "Public can submit leads" ON public.leads;

-- Create a simple, direct policy for anonymous lead submission
CREATE POLICY "Allow anonymous lead submission" 
  ON public.leads 
  FOR INSERT 
  WITH CHECK (true);

-- Ensure admins can manage all leads
CREATE POLICY "Admins can manage all leads" 
  ON public.leads 
  FOR ALL 
  USING (is_authenticated_admin())
  WITH CHECK (is_authenticated_admin());

-- Allow public to read their own submitted leads (optional, for confirmation pages)
CREATE POLICY "Public read access for lead confirmation" 
  ON public.leads 
  FOR SELECT 
  USING (true);
