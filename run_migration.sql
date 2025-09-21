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

-- Insert existing products from the hardcoded webshop
INSERT INTO public.products (name, description, price, image_url, category, in_stock, features) VALUES
('Bouw met Respect Koffiebeker', 'Hoogwaardige keramische koffiebeker met ons logo. Perfect voor op kantoor of de bouwkeet.', 1295, '/lovable-uploads/132795ea-2daa-4305-a106-02650a9bf06c.png', 'Drinkbekers', true, ARRAY['Keramiek', 'Vaatwasserbestendig', '350ml inhoud']),
('RVS Thermosbeker', 'Robuuste roestvrijstalen thermosbeker die je koffie urenlang warm houdt. Ideaal voor bouwplaatsen.', 1895, '/lovable-uploads/2a13d9d8-47a2-4787-9cba-80dfe398fd9e.png', 'Drinkbekers', true, ARRAY['Dubbelwandige isolatie', 'Lekvrij', '500ml inhoud']),
('Bouw met Respect Pen Set', 'Set van 3 hoogwaardige balpennen met ons logo. Ideaal voor het tekenen van contracten en plannen.', 895, '/lovable-uploads/370194bf-f017-421b-ab19-49ae1435a82e.png', 'Schrijfwaren', true, ARRAY['Set van 3 stuks', 'Blauwe inkt', 'Herbruikbaar']),
('Premium Metalen Pen', 'Elegante metalen pen met gegraveerd logo. Perfect voor belangrijke ondertekeningen.', 1595, '/lovable-uploads/6a653db4-1d30-46c2-83c1-760e5459fb7d.png', 'Schrijfwaren', true, ARRAY['Metalen behuizing', 'Gegraveerd logo', 'Luxe uitstraling']),
('Bouw met Respect T-shirt', 'Comfortabel katoenen T-shirt met ons logo. Beschikbaar in verschillende maten.', 1995, '/lovable-uploads/57ee5fd1-0371-463e-880a-4d53b9e64436.png', 'Kleding', true, ARRAY['100% katoen', 'Verschillende maten', 'Duurzaam geproduceerd']),
('Veiligheidshelm BMR', 'Professionele veiligheidshelm met Bouw met Respect logo. Voldoet aan alle veiligheidsnormen.', 2495, '/lovable-uploads/7b41cfaf-011f-4a79-aaa7-a4a6deb29c1c.png', 'Veiligheid', true, ARRAY['CE gecertificeerd', 'Verstelbaar', 'Ventilatie gaten']),
('Reflecterend Veiligheidsvest', 'High-vis veiligheidsvest met BMR logo. Essentieel voor elke bouwplaats.', 1295, '/lovable-uploads/a1441b5c-4e80-4aa5-9535-e2d1a585a97d.png', 'Veiligheid', true, ARRAY['High-vis materiaal', 'Reflecterende strips', 'Verschillende maten']),
('Werkhandschoenen Pro', 'Duurzame werkhandschoenen voor alle bouwwerkzaamheden. Met BMR logo.', 1595, '/lovable-uploads/af266479-6043-45e9-8c66-dfb97bebf09b.png', 'Veiligheid', true, ARRAY['Slijtvast', 'Goede grip', 'Verschillende maten']),
('BMR Gereedschapskist', 'Robuuste gereedschapskist met Bouw met Respect branding. Ideaal voor professionals.', 4995, '/lovable-uploads/af5847a3-a5b8-4469-a490-1a2dd06dd44b.png', 'Gereedschap', true, ARRAY['Metalen constructie', 'Meerdere compartimenten', 'Hangslot inclusief']),
('Meetlint BMR Edition', 'Professioneel meetlint van 5 meter met ons logo. Onmisbaar op elke bouwplaats.', 1295, '/lovable-uploads/b490bd1a-4422-4f83-8394-d7a2f6d940b9.png', 'Gereedschap', true, ARRAY['5 meter lengte', 'Sterk en duurzaam', 'Magnetische haak']),
('Waterpas Precision', 'Nauwkeurige waterpas met BMR logo. Voor perfecte resultaten.', 2995, '/lovable-uploads/c1a704b2-e7df-4ac3-8a4c-6dba63413a43.png', 'Gereedschap', true, ARRAY['Hoge nauwkeurigheid', '60cm lengte', 'Robuuste behuizing']),
('Bouw met Respect Pet', 'Stoere pet met geborduurd logo. Beschermt tegen zon en regen.', 1495, '/lovable-uploads/73f1d5f7-784d-4f62-afe1-8e5ebef9771f.png', 'Kleding', true, ARRAY['Verstelbaar', 'Geborduurd logo', 'UV-bescherming'])
ON CONFLICT (id) DO NOTHING;

-- Add comment to document the products table
COMMENT ON TABLE public.products IS 'Products table for webshop management. Contains all products that can be purchased through the webshop.';
