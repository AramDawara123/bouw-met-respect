-- Add RLS policies for membership_pricing management
CREATE POLICY "Admins can manage membership pricing"
ON public.membership_pricing
FOR ALL
USING (verify_admin_access())
WITH CHECK (verify_admin_access());