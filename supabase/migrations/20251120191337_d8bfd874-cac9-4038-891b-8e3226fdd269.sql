-- Function to automatically create company profile when partner membership is created
CREATE OR REPLACE FUNCTION public.create_company_profile_for_partner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create a company profile for the new partner membership
  INSERT INTO public.company_profiles (
    name,
    description,
    website,
    industry,
    contact_email,
    contact_phone,
    logo_url,
    partner_membership_id,
    is_featured,
    display_order
  )
  VALUES (
    NEW.company_name,
    NEW.description,
    NEW.website,
    NEW.industry,
    NEW.email,
    NEW.phone,
    NEW.logo_url,
    NEW.id,
    false,
    0
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to create company profile when partner membership is created
DROP TRIGGER IF EXISTS on_partner_membership_created ON public.partner_memberships;
CREATE TRIGGER on_partner_membership_created
  AFTER INSERT ON public.partner_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.create_company_profile_for_partner();

-- Create company profiles for existing partner memberships that don't have one
INSERT INTO public.company_profiles (
  name,
  description,
  website,
  industry,
  contact_email,
  contact_phone,
  logo_url,
  partner_membership_id,
  is_featured,
  display_order
)
SELECT 
  pm.company_name,
  pm.description,
  pm.website,
  pm.industry,
  pm.email,
  pm.phone,
  pm.logo_url,
  pm.id,
  false,
  0
FROM public.partner_memberships pm
LEFT JOIN public.company_profiles cp ON cp.partner_membership_id = pm.id
WHERE cp.id IS NULL;