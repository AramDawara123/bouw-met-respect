-- Create landing_pages table for SEO landing pages
CREATE TABLE public.landing_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  
  -- SEO fields
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  meta_keywords TEXT,
  
  -- Classification
  region TEXT,
  industry TEXT,
  problem_type TEXT,
  
  -- Content
  h1_title TEXT NOT NULL,
  intro_text TEXT NOT NULL,
  main_content TEXT NOT NULL,
  statistics JSONB DEFAULT '{}',
  solutions_text TEXT,
  cta_text TEXT,
  
  -- Schema markup
  schema_markup JSONB DEFAULT '{}',
  
  -- Status
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

-- Public read access for published pages
CREATE POLICY "Published landing pages viewable by everyone"
ON public.landing_pages
FOR SELECT
USING (is_published = true);

-- Admin management
CREATE POLICY "Admins can manage landing pages"
ON public.landing_pages
FOR ALL
USING (verify_admin_access())
WITH CHECK (verify_admin_access());

-- Create index for slug lookups
CREATE INDEX idx_landing_pages_slug ON public.landing_pages(slug);
CREATE INDEX idx_landing_pages_region ON public.landing_pages(region);
CREATE INDEX idx_landing_pages_industry ON public.landing_pages(industry);

-- Add trigger for updated_at
CREATE TRIGGER update_landing_pages_updated_at
BEFORE UPDATE ON public.landing_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();