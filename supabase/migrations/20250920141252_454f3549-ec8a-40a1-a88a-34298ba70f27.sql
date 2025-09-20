-- Create company_profiles table for managing business profiles
CREATE TABLE public.company_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  industry TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for company profiles
CREATE POLICY "Company profiles are viewable by everyone" 
ON public.company_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can create company profiles" 
ON public.company_profiles 
FOR INSERT 
WITH CHECK (verify_admin_access());

CREATE POLICY "Admins can update company profiles" 
ON public.company_profiles 
FOR UPDATE 
USING (verify_admin_access());

CREATE POLICY "Admins can delete company profiles" 
ON public.company_profiles 
FOR DELETE 
USING (verify_admin_access());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_company_profiles_updated_at
BEFORE UPDATE ON public.company_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();