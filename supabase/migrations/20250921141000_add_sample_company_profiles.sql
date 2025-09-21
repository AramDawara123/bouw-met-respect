-- Add sample company profiles for testing
-- These are example companies to showcase the partners page functionality

INSERT INTO public.company_profiles (
  name,
  description,
  website,
  logo_url,
  industry,
  contact_email,
  contact_phone,
  is_featured,
  display_order
) VALUES 
(
  'Bouwbedrijf Respectvol',
  'Een vooruitstrevend bouwbedrijf dat sociale veiligheid en respect centraal stelt. Wij bouwen niet alleen gebouwen, maar ook aan een betere werksfeer.',
  'https://www.respectvolbouwen.nl',
  '/lovable-uploads/0aa319ff-868a-4104-9b80-da10435fc7c7.png',
  'Bouw & Constructie',
  'info@respectvolbouwen.nl',
  '+31 20 123 4567',
  true,
  1
),
(
  'Veilig Werk Nederland',
  'Specialist in arbeidsveiligheid en sociale veiligheid op de bouwplaats. Wij begeleiden bedrijven naar een veiligere werkomgeving.',
  'https://www.veiligwerk.nl',
  '/lovable-uploads/132795ea-2daa-4305-a106-02650a9bf06c.png',
  'Arbeidsveiligheid',
  'contact@veiligwerk.nl',
  '+31 30 987 6543',
  false,
  2
),
(
  'Inclusief Bouwen BV',
  'Wij geloven in een inclusieve bouwsector waar iedereen zich welkom voelt. Diversiteit en respect zijn onze kernwaarden.',
  'https://www.inclusiefbouwen.nl',
  '/lovable-uploads/279d19f0-d46f-4c9c-96ab-f2ca307a0797.png',
  'Bouw & Renovatie',
  'hello@inclusiefbouwen.nl',
  '+31 40 555 7890',
  false,
  3
),
(
  'Respect Training Institute',
  'Gespecialiseerd in trainingen voor respectvolle communicatie en sociale veiligheid in de bouwsector.',
  'https://www.respecttraining.nl',
  '/lovable-uploads/2a13d9d8-47a2-4787-9cba-80dfe398fd9e.png',
  'Training & Educatie',
  'info@respecttraining.nl',
  '+31 10 321 9876',
  true,
  4
);

-- Add comment to document sample data
COMMENT ON TABLE public.company_profiles IS 'Company profiles for partners page. Sample data added for demonstration purposes.';
