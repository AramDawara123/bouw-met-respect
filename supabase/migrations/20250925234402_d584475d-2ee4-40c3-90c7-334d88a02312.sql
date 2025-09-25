-- Completely remove RLS policies and disable RLS on company_profiles table
-- Drop all existing policies
DROP POLICY IF EXISTS "Public can view company profiles" ON public.company_profiles;
DROP POLICY IF EXISTS "Partners can create company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Partners can update own company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Only admins can delete company profiles" ON public.company_profiles;

-- Disable Row Level Security completely
ALTER TABLE public.company_profiles DISABLE ROW LEVEL SECURITY;