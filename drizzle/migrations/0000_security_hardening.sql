CREATE OR REPLACE FUNCTION public.is_admin_user(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _uid AND (is_admin = true OR role = 'admin'))
$$;

-- Prevent self-escalation via profile edits
CREATE OR REPLACE FUNCTION public.protect_profile_admin_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_admin_user(auth.uid()) THEN
    IF TG_OP = 'INSERT' THEN
      NEW.is_admin := false; NEW.role := NULL;
    ELSIF NEW.is_admin IS DISTINCT FROM OLD.is_admin OR NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Not allowed to change admin fields';
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS protect_profile_admin_fields ON public.profiles;
CREATE TRIGGER protect_profile_admin_fields BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_admin_fields();

DROP POLICY IF EXISTS "Anyone can insert profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- search_path pin
ALTER FUNCTION public.send_digital_product_email_on_paid() SET search_path = public, extensions;

-- app_config: RLS on, no client access
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_config FROM anon, authenticated;

-- analytics
DROP POLICY IF EXISTS "Authenticated users can read analytics" ON public.analytics_events;
CREATE POLICY "Admins can read analytics" ON public.analytics_events FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
CREATE POLICY "Anyone can insert valid analytics events" ON public.analytics_events FOR INSERT TO anon, authenticated
WITH CHECK (length(session_id) BETWEEN 1 AND 200 AND event_type IN ('pageview','session_start','session_end','click','event') AND coalesce(length(page_path),0) <= 2000);

-- orders / donations inserts
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create valid orders" ON public.orders FOR INSERT TO anon, authenticated
WITH CHECK (customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND total_amount >= 0 AND coalesce(payment_status,'pending') IN ('pending','open'));
DROP POLICY IF EXISTS "Anyone can create donations" ON public.donations;
CREATE POLICY "Anyone can create valid donations" ON public.donations FOR INSERT TO anon, authenticated
WITH CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND amount > 0 AND coalesce(payment_status,'pending') IN ('pending','open'));

-- memberships
DROP POLICY IF EXISTS "Update memberships" ON public.memberships;
CREATE POLICY "Admins can update memberships" ON public.memberships FOR UPDATE TO authenticated
USING (public.is_admin_user(auth.uid())) WITH CHECK (public.is_admin_user(auth.uid()));
DROP POLICY IF EXISTS "Users can create memberships" ON public.memberships;
CREATE POLICY "Users can create valid memberships" ON public.memberships FOR INSERT TO anon, authenticated
WITH CHECK ((user_id IS NULL OR user_id = auth.uid()) AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND coalesce(payment_status,'pending') IN ('pending','open','quote_requested'));

-- download tokens: only edge functions (service role)
DROP POLICY IF EXISTS "Public token lookup" ON public.download_tokens;
REVOKE SELECT ON public.download_tokens FROM anon, authenticated;

-- home_interviews writes: admins only
DROP POLICY IF EXISTS "Authenticated can delete interviews" ON public.home_interviews;
DROP POLICY IF EXISTS "Authenticated can insert interviews" ON public.home_interviews;
DROP POLICY IF EXISTS "Authenticated can update interviews" ON public.home_interviews;
CREATE POLICY "Admins can insert interviews" ON public.home_interviews FOR INSERT TO authenticated WITH CHECK (public.is_admin_user(auth.uid()));
CREATE POLICY "Admins can update interviews" ON public.home_interviews FOR UPDATE TO authenticated USING (public.is_admin_user(auth.uid())) WITH CHECK (public.is_admin_user(auth.uid()));
CREATE POLICY "Admins can delete interviews" ON public.home_interviews FOR DELETE TO authenticated USING (public.is_admin_user(auth.uid()));

-- storage writes: admins only
DROP POLICY IF EXISTS "Authenticated users can upload to SMB bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update in SMB bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from SMB bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload product PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update product PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete product PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload interview photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update interview photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete interview photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view interview photos" ON storage.objects;
CREATE POLICY "Admins can upload site files" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('smb','interview-photos') AND public.is_admin_user(auth.uid()));
CREATE POLICY "Admins can update site files" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id IN ('smb','interview-photos') AND public.is_admin_user(auth.uid()))
WITH CHECK (bucket_id IN ('smb','interview-photos') AND public.is_admin_user(auth.uid()));
CREATE POLICY "Admins can delete site files" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id IN ('smb','interview-photos') AND public.is_admin_user(auth.uid()));
CREATE POLICY "Visitors can view homepage interview photos" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'interview-photos' AND EXISTS (
  SELECT 1 FROM public.home_interviews h WHERE h.image_url = storage.objects.name OR h.image_url LIKE '%' || storage.objects.name));