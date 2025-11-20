-- Update RLS policy for company profiles to ensure admins can manage all profiles
DROP POLICY IF EXISTS "Admins can manage company profiles" ON public.company_profiles;

CREATE POLICY "Admins can manage company profiles"
ON public.company_profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.is_admin = true OR profiles.role = 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.is_admin = true OR profiles.role = 'admin')
  )
);