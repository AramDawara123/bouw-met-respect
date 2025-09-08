-- Create website_content table with actual current content
CREATE TABLE public.website_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT NOT NULL,
  mission_title TEXT NOT NULL, 
  mission_text TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  primary_color TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;

-- Allow public access to read content
CREATE POLICY "Website content is viewable by everyone" 
ON public.website_content 
FOR SELECT 
USING (true);

-- Allow authenticated users to update content (for admin)
CREATE POLICY "Authenticated users can update website content" 
ON public.website_content 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert initial content
CREATE POLICY "Authenticated users can create website content" 
ON public.website_content 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Insert current website content
INSERT INTO public.website_content (
  hero_title,
  hero_subtitle,
  mission_title,
  mission_text,
  contact_email,
  contact_phone,
  primary_color,
  secondary_color
) VALUES (
  'Bouw met Respect – De beweging voor een veiligere en menselijkere bouwsector',
  'Grensoverschrijdend gedrag en een harde cultuur houden jong talent weg uit de bouw. Onze beweging gelooft dat verandering begint met respect. Sluit je aan en help mee de sector aantrekkelijker te maken voor iedereen.',
  'Hoe onze beweging helpt',
  'Van anonieme melding tot keurmerk. Wij bieden concrete hulp om grensoverschrijdend gedrag aan te pakken en de bouwsector veiliger te maken. Samen zorgen we voor cultuurverandering op de bouwplaats.',
  'info@bouwmetrespect.nl',
  '+31 6 1234 5678',
  '#8B5CF6',
  '#10B981'
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_website_content_updated_at
BEFORE UPDATE ON public.website_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();