-- Enable Row Level Security on company_profiles table
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for company_profiles to allow public read access
-- This is appropriate since this is for a public partners page
CREATE POLICY "Company profiles are viewable by everyone" 
ON public.company_profiles 
FOR SELECT 
USING (true);

-- Allow admins to manage company profiles
CREATE POLICY "Admins can manage company profiles" 
ON public.company_profiles 
FOR ALL 
USING (verify_admin_access())
WITH CHECK (verify_admin_access());