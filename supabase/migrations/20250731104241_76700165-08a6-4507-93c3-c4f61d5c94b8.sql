
-- Drop existing restrictive policies on leads table
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

-- Create new policies that allow public inquiry submissions
CREATE POLICY "Anyone can submit inquiries" 
  ON public.leads 
  FOR INSERT 
  WITH CHECK (true);

-- Allow admins to view and manage all leads
CREATE POLICY "Authenticated admins can view all leads" 
  ON public.leads 
  FOR SELECT 
  USING (is_authenticated_admin());

CREATE POLICY "Authenticated admins can update all leads" 
  ON public.leads 
  FOR UPDATE 
  USING (is_authenticated_admin());

CREATE POLICY "Authenticated admins can delete all leads" 
  ON public.leads 
  FOR DELETE 
  USING (is_authenticated_admin());
