-- Ensure the update trigger exists for company_profiles table
CREATE OR REPLACE TRIGGER update_company_profiles_updated_at
    BEFORE UPDATE ON public.company_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();