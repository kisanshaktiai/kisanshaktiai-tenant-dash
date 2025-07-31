
-- Update the leads table constraints to match frontend values
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_organization_type_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_organization_type_check 
CHECK (organization_type IN ('Agri_Company', 'NGO', 'University', 'Government', 'Co-Operative', 'other'));

-- Update budget range constraint to match frontend values
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_budget_range_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_budget_range_check 
CHECK (budget_range IN ('under_25k', '25k_50k', '50k_100k', '100k_plus'));

-- Ensure RLS policies allow anonymous users to insert leads
DROP POLICY IF EXISTS "Anonymous users can submit leads" ON public.leads;
CREATE POLICY "Anonymous users can submit leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- Add a policy for reading leads (for admins/authenticated users)
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
CREATE POLICY "Authenticated users can view leads" 
ON public.leads 
FOR SELECT 
USING (auth.uid() IS NOT NULL);
