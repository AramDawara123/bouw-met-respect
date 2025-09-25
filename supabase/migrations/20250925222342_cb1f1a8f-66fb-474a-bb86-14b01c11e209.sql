-- Fix RLS policies to allow public viewing of company_profiles
-- Drop existing SELECT policies to avoid conflicts
DROP POLICY IF EXISTS "Company profiles are viewable by everyone" ON public.company_profiles;

-- Create a comprehensive policy that allows public viewing of all company profiles
CREATE POLICY "Company profiles are publicly viewable" 
ON public.company_profiles 
FOR SELECT 
USING (true);

-- Ensure the table has RLS enabled
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;