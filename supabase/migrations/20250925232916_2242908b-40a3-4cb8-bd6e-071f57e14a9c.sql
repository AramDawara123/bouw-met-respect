-- Fix company profiles RLS policies by creating security definer function
-- This solves the "permission denied for table users" error

-- Create security definer function to get current user email
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can update own profiles" ON public.company_profiles;
DROP POLICY IF EXISTS "Authenticated users can create profiles" ON public.company_profiles;

-- Create new policies using the security definer function
CREATE POLICY "Users can update own profiles" ON public.company_profiles
FOR UPDATE 
USING ((public.get_current_user_email() = 'info@bouwmetrespect.nl') OR 
       ((partner_membership_id IS NOT NULL) AND 
        (EXISTS (SELECT 1 FROM partner_memberships pm 
                WHERE pm.id = company_profiles.partner_membership_id 
                AND pm.user_id = auth.uid() 
                AND pm.payment_status = 'paid'))))
WITH CHECK ((public.get_current_user_email() = 'info@bouwmetrespect.nl') OR 
            ((partner_membership_id IS NOT NULL) AND 
             (EXISTS (SELECT 1 FROM partner_memberships pm 
                     WHERE pm.id = company_profiles.partner_membership_id 
                     AND pm.user_id = auth.uid() 
                     AND pm.payment_status = 'paid'))));

CREATE POLICY "Authenticated users can create profiles" ON public.company_profiles
FOR INSERT 
WITH CHECK ((public.get_current_user_email() = 'info@bouwmetrespect.nl') OR 
            ((partner_membership_id IS NOT NULL) AND 
             (EXISTS (SELECT 1 FROM partner_memberships pm 
                     WHERE pm.id = company_profiles.partner_membership_id 
                     AND pm.user_id = auth.uid() 
                     AND pm.payment_status = 'paid'))) OR 
            (partner_membership_id IS NULL));