-- SIMPLIFIED APPROACH: Allow partners to update their own company profiles
-- Drop all existing policies and create simple ones

DROP POLICY IF EXISTS "Users can update own profiles" ON public.company_profiles;
DROP POLICY IF EXISTS "Authenticated users can create profiles" ON public.company_profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.company_profiles;

-- Create simple policies that work
CREATE POLICY "Partners can manage their company profiles" ON public.company_profiles
FOR ALL 
USING (
  -- Admin access for info@bouwmetrespect.nl
  (auth.jwt() ->> 'email' = 'info@bouwmetrespect.nl')
  OR 
  -- Partner access: if there's a partner_membership_id and it belongs to the current user
  (partner_membership_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM partner_memberships pm 
    WHERE pm.id = company_profiles.partner_membership_id 
    AND pm.user_id = auth.uid()
  ))
  OR
  -- Allow creating profiles without partner_membership_id (for admin)
  (partner_membership_id IS NULL)
)
WITH CHECK (
  -- Admin can do anything
  (auth.jwt() ->> 'email' = 'info@bouwmetrespect.nl')
  OR 
  -- Partner can only create/update profiles linked to their membership
  (partner_membership_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM partner_memberships pm 
    WHERE pm.id = company_profiles.partner_membership_id 
    AND pm.user_id = auth.uid()
  ))
  OR
  -- Allow creating profiles without partner_membership_id (for admin)
  (partner_membership_id IS NULL)
);