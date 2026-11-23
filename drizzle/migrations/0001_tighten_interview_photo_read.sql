DROP POLICY IF EXISTS "Visitors can view homepage interview photos" ON storage.objects;
CREATE POLICY "Visitors can view homepage interview photos" ON storage.objects
FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'interview-photos'
  AND EXISTS (
    SELECT 1 FROM public.home_interviews h
    WHERE h.image_url = storage.objects.name
       OR h.image_url LIKE '%/interview-photos/' || storage.objects.name
       OR h.image_url LIKE '%/interview-photos/' || storage.objects.name || '?%'
  )
);