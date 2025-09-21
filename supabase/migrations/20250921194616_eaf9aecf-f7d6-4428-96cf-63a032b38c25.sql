-- Update RLS policy for partner_memberships to allow admins to create entries for other users
DROP POLICY IF EXISTS "Authenticated users can create partner memberships" ON public.partner_memberships;

-- Create new policy that allows admins to create partner memberships for any user
CREATE POLICY "Authenticated users can create partner memberships" 
ON public.partner_memberships 
FOR INSERT 
WITH CHECK (
  (auth.uid() = user_id) OR 
  (user_id IS NULL) OR 
  verify_admin_access()
);