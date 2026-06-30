GRANT SELECT ON public.home_interviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.home_interviews TO authenticated;
GRANT ALL ON public.home_interviews TO service_role;