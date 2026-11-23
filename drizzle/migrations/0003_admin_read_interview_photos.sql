CREATE POLICY "Admins can view interview photos" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'interview-photos' AND public.is_admin_user(auth.uid()));