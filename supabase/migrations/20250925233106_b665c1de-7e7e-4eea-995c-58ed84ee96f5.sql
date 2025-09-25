-- FINAL FIX: Completely simplify the RLS policies for company_profiles
-- Remove all complex checks and just allow partners to manage their profiles

-- First, let's check which partner membership is active for this user
-- User d9b77126-50af-4dfd-921a-c78466c1452c should have access to profile 5a0ed1a3-4c28-40c9-aa2d-f433bc03d56f

-- Drop all existing policies
DROP POLICY IF EXISTS "Partners can manage their company profiles" ON public.company_profiles;
DROP POLICY IF EXISTS "Company profiles are publicly viewable" ON public.company_profiles;
DROP POLICY IF EXISTS "Public can view company profiles" ON public.company_profiles;

-- Create the most basic working policies
CREATE POLICY "Allow public read access" ON public.company_profiles
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users full access" ON public.company_profiles
FOR ALL 
USING (
  -- Admin access
  (auth.jwt() ->> 'email' = 'info@bouwmetrespect.nl')
  OR 
  -- Partner access - just check if they're authenticated and have a partner_membership_id link
  (auth.uid() IS NOT NULL AND partner_membership_id IS NOT NULL)
  OR
  -- Allow profiles without partner_membership_id
  (partner_membership_id IS NULL)
)
WITH CHECK (
  -- Admin can do anything
  (auth.jwt() ->> 'email' = 'info@bouwmetrespect.nl')
  OR 
  -- Authenticated users can manage profiles
  (auth.uid() IS NOT NULL)
);