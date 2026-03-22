-- secure_storage_rules.sql
-- Enforce security rules on the incident-media Supabase Storage bucket

-- 1. Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('incident-media', 'incident-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enforce Size and MIME Type limits at the bucket level
UPDATE storage.buckets
SET file_size_limit = 10485760, -- 10 MB limit
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
WHERE id = 'incident-media';

-- 3. Setup Row Level Security (RLS) Policies on storage.objects

-- Drop existing generic policies if any
DROP POLICY IF EXISTS "Public views incident media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload incident media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own media" ON storage.objects;

-- Allow public read access (Required for incident report rendering)
CREATE POLICY "Public views incident media"
ON storage.objects FOR SELECT
USING (bucket_id = 'incident-media');

-- Allow authenticated users to insert files to their own folder (folder name = user_id)
CREATE POLICY "Authenticated users upload incident media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'incident-media' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'incident-media' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'incident-media' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
