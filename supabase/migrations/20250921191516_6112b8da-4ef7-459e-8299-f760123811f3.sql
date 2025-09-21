-- Restore products table that was lost in revert
CREATE TABLE IF NOT EXISTS public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price integer NOT NULL,
  image_url text,
  category text,
  in_stock boolean DEFAULT true,
  features text[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can create products" 
ON public.products 
FOR INSERT 
WITH CHECK (verify_admin_access());

CREATE POLICY "Admins can update products" 
ON public.products 
FOR UPDATE 
USING (verify_admin_access());

CREATE POLICY "Admins can delete products" 
ON public.products 
FOR DELETE 
USING (verify_admin_access());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some sample products
INSERT INTO public.products (name, description, price, category, image_url, features) VALUES
('Duurzame Bouwhelm', 'Veiligheidshelm gemaakt van gerecycled materiaal', 4500, 'Veiligheid', '/placeholder.svg', '{"Gerecycled materiaal", "CE gecertificeerd", "Verstelbaar"}'),
('Eco Werkhandschoenen', 'Werkhandschoenen van duurzame materialen', 2500, 'Veiligheid', '/placeholder.svg', '{"Ademend materiaal", "Goede grip", "Duurzaam"}'),
('Respectvolle Bouw Handboek', 'Complete gids voor respectvolle bouwpraktijken', 3500, 'Educatie', '/placeholder.svg', '{"150 paginas", "Praktische tips", "Case studies"}')
ON CONFLICT (id) DO NOTHING;