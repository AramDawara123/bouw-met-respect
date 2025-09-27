-- Add RLS policy to allow partners to create their own company profiles
CREATE POLICY "Partners can create their own company profiles" 
ON public.company_profiles 
FOR INSERT 
WITH CHECK (
  partner_membership_id IS NOT NULL AND
  EXISTS (
    SELECT 1 
    FROM public.partner_memberships pm 
    WHERE pm.id = partner_membership_id 
    AND pm.user_id = auth.uid()
    AND pm.payment_status = 'paid'
  )
);

-- Add RLS policy to allow partners to update their own company profiles
CREATE POLICY "Partners can update their own company profiles" 
ON public.company_profiles 
FOR UPDATE 
USING (
  partner_membership_id IS NOT NULL AND
  EXISTS (
    SELECT 1 
    FROM public.partner_memberships pm 
    WHERE pm.id = partner_membership_id 
    AND pm.user_id = auth.uid()
    AND pm.payment_status = 'paid'
  )
);

-- Add RLS policy to allow partners to delete their own company profiles
CREATE POLICY "Partners can delete their own company profiles" 
ON public.company_profiles 
FOR DELETE 
USING (
  partner_membership_id IS NOT NULL AND
  EXISTS (
    SELECT 1 
    FROM public.partner_memberships pm 
    WHERE pm.id = partner_membership_id 
    AND pm.user_id = auth.uid()
    AND pm.payment_status = 'paid'
  )
);