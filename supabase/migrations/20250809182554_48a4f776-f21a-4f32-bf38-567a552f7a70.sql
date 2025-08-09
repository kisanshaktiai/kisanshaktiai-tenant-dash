
-- Enable realtime for onboarding tables
ALTER TABLE public.onboarding_workflows REPLICA IDENTITY FULL;
ALTER TABLE public.onboarding_steps REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.onboarding_workflows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.onboarding_steps;

-- Create storage bucket for onboarding document uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'onboarding-documents',
  'onboarding-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'image/svg+xml']
);

-- RLS policies for onboarding documents bucket
CREATE POLICY "Users can upload onboarding documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'onboarding-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their onboarding documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'onboarding-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their onboarding documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'onboarding-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their onboarding documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'onboarding-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Enhanced RLS policies for onboarding tables
CREATE POLICY "Users can manage onboarding workflows for their tenants"
ON public.onboarding_workflows
FOR ALL
USING (
  tenant_id IN (
    SELECT ut.tenant_id 
    FROM public.user_tenants ut 
    WHERE ut.user_id = auth.uid() 
    AND ut.is_active = true
  )
);

CREATE POLICY "Users can manage onboarding steps for their workflows"
ON public.onboarding_steps
FOR ALL
USING (
  workflow_id IN (
    SELECT ow.id 
    FROM public.onboarding_workflows ow
    JOIN public.user_tenants ut ON ow.tenant_id = ut.tenant_id
    WHERE ut.user_id = auth.uid() 
    AND ut.is_active = true
  )
);
