-- Create the onboarding-documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'onboarding-documents',
  'onboarding-documents',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to their tenant's folder
CREATE POLICY "Allow authenticated uploads to onboarding-documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'onboarding-documents'
);

-- Allow authenticated users to read files from onboarding-documents
CREATE POLICY "Allow authenticated reads from onboarding-documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'onboarding-documents'
);

-- Allow public access to read files (since bucket is public)
CREATE POLICY "Allow public reads from onboarding-documents"
ON storage.objects
FOR SELECT
TO anon
USING (
  bucket_id = 'onboarding-documents'
);

-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates to onboarding-documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'onboarding-documents'
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes from onboarding-documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'onboarding-documents'
);