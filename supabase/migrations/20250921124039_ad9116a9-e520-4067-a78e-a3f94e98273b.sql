-- Create partner_memberships table for partner payments
CREATE TABLE public.partner_memberships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid DEFAULT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  company_name text NOT NULL,
  website text,
  industry text,
  description text,
  logo_url text,
  mollie_payment_id text,
  payment_status text DEFAULT 'pending'::text,
  amount integer DEFAULT 50000, -- €500 for partner membership
  currency text DEFAULT 'EUR'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_memberships ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can create partner memberships" 
ON public.partner_memberships 
FOR INSERT 
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can view own partner memberships, admins view all" 
ON public.partner_memberships 
FOR SELECT 
USING ((auth.uid() = user_id) OR verify_admin_access());

CREATE POLICY "Users can update own partner memberships, admins update all" 
ON public.partner_memberships 
FOR UPDATE 
USING ((auth.uid() = user_id) OR verify_admin_access())
WITH CHECK ((auth.uid() = user_id) OR verify_admin_access());

CREATE POLICY "Only admins can delete partner memberships" 
ON public.partner_memberships 
FOR DELETE 
USING (verify_admin_access());

-- Add trigger for updated_at
CREATE TRIGGER update_partner_memberships_updated_at
BEFORE UPDATE ON public.partner_memberships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update company_profiles table to link to partner_memberships
ALTER TABLE public.company_profiles 
ADD COLUMN partner_membership_id uuid REFERENCES public.partner_memberships(id);

-- Add RLS policy to allow partners to manage their own profiles
CREATE POLICY "Partners can manage their own company profiles"
ON public.company_profiles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.partner_memberships pm
    WHERE pm.id = company_profiles.partner_membership_id
    AND pm.user_id = auth.uid()
    AND pm.payment_status = 'paid'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.partner_memberships pm
    WHERE pm.id = company_profiles.partner_membership_id
    AND pm.user_id = auth.uid()
    AND pm.payment_status = 'paid'
  )
);