-- Create storage bucket for product images and company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('smb', 'smb', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the smb bucket
CREATE POLICY "Public Access to SMB bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'smb');

CREATE POLICY "Authenticated users can upload to SMB bucket"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'smb' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update in SMB bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'smb' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'smb' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete from SMB bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'smb' AND auth.role() = 'authenticated');