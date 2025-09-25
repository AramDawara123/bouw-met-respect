-- Drop any remaining RLS policies on company_profiles
DROP POLICY IF EXISTS "Users can view their own company profiles" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can create company profiles" ON public.company_profiles;  
DROP POLICY IF EXISTS "Users can update their own company profiles" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can delete their own company profiles" ON public.company_profiles;
DROP POLICY IF EXISTS "Admins can view all company profiles" ON public.company_profiles;
DROP POLICY IF EXISTS "Admins can manage all company profiles" ON public.company_profiles;
DROP POLICY IF EXISTS "Partners can manage their company profiles" ON public.company_profiles;
DROP POLICY IF EXISTS "Public can view company profiles" ON public.company_profiles;

-- Make sure RLS is completely disabled
ALTER TABLE public.company_profiles DISABLE ROW LEVEL SECURITY;

-- Create storage policies for logo uploads in the smb bucket
CREATE POLICY "Anyone can upload company logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'smb' AND (storage.foldername(name))[1] = 'company-logos');

CREATE POLICY "Anyone can view company logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'smb' AND (storage.foldername(name))[1] = 'company-logos');

CREATE POLICY "Anyone can update company logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'smb' AND (storage.foldername(name))[1] = 'company-logos');

CREATE POLICY "Anyone can delete company logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'smb' AND (storage.foldername(name))[1] = 'company-logos');