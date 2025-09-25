-- Fix company_profiles RLS policies to allow proper partner editing
-- First enable RLS if it's not already enabled
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Allow public read access" ON public.company_profiles;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.company_profiles;

-- Create simple, working policies

-- 1. Everyone can read company profiles (for public partners page)
CREATE POLICY "Public can view company profiles" 
ON public.company_profiles 
FOR SELECT 
USING (true);

-- 2. Partners can create their own company profile
CREATE POLICY "Partners can create company profile" 
ON public.company_profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  (
    -- Admin can create any profile
    verify_admin_access() OR
    -- Partner can create profile linked to their membership
    partner_membership_id IN (
      SELECT id FROM partner_memberships 
      WHERE user_id = auth.uid() AND payment_status = 'paid'
    ) OR
    -- Allow creation without partner_membership_id (admin creates)
    partner_membership_id IS NULL
  )
);

-- 3. Partners can update their own company profile
CREATE POLICY "Partners can update own company profile" 
ON public.company_profiles 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  (
    -- Admin can update any profile
    verify_admin_access() OR
    -- Partner can update their own profile
    partner_membership_id IN (
      SELECT id FROM partner_memberships 
      WHERE user_id = auth.uid() AND payment_status = 'paid'
    )
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  (
    -- Admin can update any profile
    verify_admin_access() OR
    -- Partner can update their own profile
    partner_membership_id IN (
      SELECT id FROM partner_memberships 
      WHERE user_id = auth.uid() AND payment_status = 'paid'
    )
  )
);

-- 4. Only admins can delete company profiles
CREATE POLICY "Only admins can delete company profiles" 
ON public.company_profiles 
FOR DELETE 
USING (verify_admin_access());