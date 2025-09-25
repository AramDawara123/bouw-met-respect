-- Fix RLS policies for company_profiles to work properly with partner dashboard

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Admins can update company profiles" ON public.company_profiles;
DROP POLICY IF EXISTS "Partners can update their own company profiles" ON public.company_profiles;
DROP POLICY IF EXISTS "Admins can delete company profiles" ON public.company_profiles;
DROP POLICY IF EXISTS "Anyone can create company profiles" ON public.company_profiles;
DROP POLICY IF EXISTS "Partners can create their own company profiles" ON public.company_profiles;

-- Create simplified and working policies

-- Allow everyone to view company profiles (public directory)
CREATE POLICY "Public can view company profiles" 
ON public.company_profiles 
FOR SELECT 
USING (true);

-- Allow authenticated users to create profiles (both admin and partners)
CREATE POLICY "Authenticated users can create profiles" 
ON public.company_profiles 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Admin users (email check)
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'info@bouwmetrespect.nl'
  OR
  -- Partners with paid membership can create with their membership_id
  (
    partner_membership_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM partner_memberships pm 
      WHERE pm.id = company_profiles.partner_membership_id 
      AND pm.user_id = auth.uid() 
      AND pm.payment_status = 'paid'
    )
  )
  OR
  -- Allow creation without partner_membership_id (for admin-created profiles)
  partner_membership_id IS NULL
);

-- Allow updates for admin or profile owners
CREATE POLICY "Users can update own profiles" 
ON public.company_profiles 
FOR UPDATE 
TO authenticated
USING (
  -- Admin users
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'info@bouwmetrespect.nl'
  OR
  -- Partners can edit their own profiles
  (
    partner_membership_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM partner_memberships pm 
      WHERE pm.id = company_profiles.partner_membership_id 
      AND pm.user_id = auth.uid() 
      AND pm.payment_status = 'paid'
    )
  )
)
WITH CHECK (
  -- Same conditions for the updated data
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'info@bouwmetrespect.nl'
  OR
  (
    partner_membership_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM partner_memberships pm 
      WHERE pm.id = company_profiles.partner_membership_id 
      AND pm.user_id = auth.uid() 
      AND pm.payment_status = 'paid'
    )
  )
);

-- Allow deletion for admin only
CREATE POLICY "Admin can delete profiles" 
ON public.company_profiles 
FOR DELETE 
TO authenticated
USING ((SELECT email FROM auth.users WHERE id = auth.uid()) = 'info@bouwmetrespect.nl');