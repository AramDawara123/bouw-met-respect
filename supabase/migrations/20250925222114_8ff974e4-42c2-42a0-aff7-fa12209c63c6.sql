-- Fix RLS policies for company_profiles to allow partners to edit their own profiles

-- Drop the existing conflicting policies
DROP POLICY IF EXISTS "Partners and admins can update company profiles" ON public.company_profiles;
DROP POLICY IF EXISTS "Public profile creation and basic updates" ON public.company_profiles;

-- Create a clear policy for partners to update their own company profiles
CREATE POLICY "Partners can update their own company profiles" 
ON public.company_profiles 
FOR UPDATE 
USING (
  -- Allow if user is admin
  verify_admin_access() 
  OR 
  -- Allow if user owns the partner membership linked to this profile
  (
    EXISTS (
      SELECT 1 
      FROM partner_memberships pm
      WHERE pm.user_id = auth.uid() 
      AND pm.payment_status = 'paid'
      AND pm.id = company_profiles.partner_membership_id
    )
  )
)
WITH CHECK (
  -- Same conditions for the updated data
  verify_admin_access() 
  OR 
  (
    EXISTS (
      SELECT 1 
      FROM partner_memberships pm
      WHERE pm.user_id = auth.uid() 
      AND pm.payment_status = 'paid'
      AND pm.id = company_profiles.partner_membership_id
    )
  )
);

-- Allow partners to create profiles linked to their membership
CREATE POLICY "Partners can create their own company profiles" 
ON public.company_profiles 
FOR INSERT 
WITH CHECK (
  -- Allow if user is admin (for general profile creation)
  verify_admin_access() 
  OR 
  -- Allow if inserting a profile linked to user's own partner membership
  (
    partner_membership_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 
      FROM partner_memberships pm
      WHERE pm.user_id = auth.uid() 
      AND pm.payment_status = 'paid'
      AND pm.id = partner_membership_id
    )
  )
  OR
  -- Allow public profile creation (for non-partner profiles)
  partner_membership_id IS NULL
);