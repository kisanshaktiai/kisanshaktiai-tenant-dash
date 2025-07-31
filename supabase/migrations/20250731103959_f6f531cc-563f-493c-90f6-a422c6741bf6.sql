
-- Update budget range constraint with new values
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_budget_range_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_budget_range_check 
CHECK (budget_range IN ('under_50k', '50k_100k', '100k_1000k', '1000k_plus'));
