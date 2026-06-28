
CREATE TABLE public.home_interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  intro TEXT NOT NULL DEFAULT '',
  full_interview TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.home_interviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_interviews TO authenticated;
GRANT ALL ON public.home_interviews TO service_role;

ALTER TABLE public.home_interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view interviews"
  ON public.home_interviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can insert interviews"
  ON public.home_interviews FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update interviews"
  ON public.home_interviews FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete unlocked interviews"
  ON public.home_interviews FOR DELETE TO authenticated
  USING (is_locked = false);

CREATE OR REPLACE FUNCTION public.update_home_interviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_home_interviews_updated_at
  BEFORE UPDATE ON public.home_interviews
  FOR EACH ROW EXECUTE FUNCTION public.update_home_interviews_updated_at();

-- Storage policies for interview-photos bucket
CREATE POLICY "Public can view interview photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'interview-photos');

CREATE POLICY "Authenticated can upload interview photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'interview-photos');

CREATE POLICY "Authenticated can update interview photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'interview-photos');

CREATE POLICY "Authenticated can delete interview photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'interview-photos');

-- Seed initial rows
INSERT INTO public.home_interviews (position, name, role, intro, full_interview, image_url, is_locked) VALUES
(1, 'Bestuurder Stichting Bouw met Respect', 'Oprichter & Bestuurder', 'Waarom ik deze stichting ben begonnen en wat psychologische veiligheid op de bouwplaats voor mij betekent.', 'Plaatshouder — vervang deze tekst via het dashboard met het echte interview.', '/lovable-uploads/af5847a3-a5b8-4469-a490-1a2dd06dd44b.png', true),
(2, 'Verhaal uit de bouw', 'Vakman', 'Een eerlijk verhaal over de cultuur op de bouwplaats en wat er moet veranderen.', 'Plaatshouder — vervang deze tekst via het dashboard.', '/lovable-uploads/0aa319ff-868a-4104-9b80-da10435fc7c7.png', false),
(3, 'Samen bouwen aan respect', 'Partner', 'Hoe wij als partner bijdragen aan een veilige en respectvolle werkomgeving.', 'Plaatshouder — vervang deze tekst via het dashboard.', '/lovable-uploads/af266479-6043-45e9-8c66-dfb97bebf09b.png', false);
