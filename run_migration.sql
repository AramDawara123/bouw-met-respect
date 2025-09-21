-- Run this SQL in your Supabase SQL Editor to create the products table

-- Create products table for webshop management
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Price in cents
  image_url TEXT,
  category TEXT,
  in_stock BOOLEAN DEFAULT true,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for products
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can create products" ON public.products;
CREATE POLICY "Admins can create products" 
ON public.products 
FOR INSERT 
WITH CHECK (verify_admin_access());

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" 
ON public.products 
FOR UPDATE 
USING (verify_admin_access());

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" 
ON public.products 
FOR DELETE 
USING (verify_admin_access());

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert only the 4 existing products from the webshop
INSERT INTO public.products (name, description, price, image_url, category, in_stock, features) VALUES
('Bouw met Respect Koffiebeker', 'Hoogwaardige keramische koffiebeker met ons logo. Perfect voor op kantoor of de bouwkeet.', 1295, '/lovable-uploads/132795ea-2daa-4305-a106-02650a9bf06c.png', 'Drinkbekers', true, ARRAY['Keramiek', 'Vaatwasserbestendig', '350ml inhoud']),
('RVS Thermosbeker', 'Robuuste roestvrijstalen thermosbeker die je koffie urenlang warm houdt. Ideaal voor bouwplaatsen.', 1895, '/lovable-uploads/2a13d9d8-47a2-4787-9cba-80dfe398fd9e.png', 'Drinkbekers', true, ARRAY['Dubbelwandige isolatie', 'Lekvrij', '500ml inhoud']),
('Bouw met Respect Pen Set', 'Set van 3 hoogwaardige balpennen met ons logo. Ideaal voor het tekenen van contracten en plannen.', 895, '/lovable-uploads/370194bf-f017-421b-ab19-49ae1435a82e.png', 'Schrijfwaren', true, ARRAY['Set van 3 stuks', 'Blauwe inkt', 'Herbruikbaar']),
('Premium Metalen Pen', 'Elegante metalen pen met gegraveerd logo. Perfect voor belangrijke ondertekeningen.', 1595, '/lovable-uploads/6a653db4-1d30-46c2-83c1-760e5459fb7d.png', 'Schrijfwaren', true, ARRAY['Metalen behuizing', 'Gegraveerd logo', 'Geschenkdoosje'])
ON CONFLICT (id) DO NOTHING;

-- Add comment to document the products table
COMMENT ON TABLE public.products IS 'Products table for webshop management. Contains all products that can be purchased through the webshop.';
