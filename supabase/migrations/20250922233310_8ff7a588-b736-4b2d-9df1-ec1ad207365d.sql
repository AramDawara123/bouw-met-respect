-- Add discount fields to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0; -- Discount percentage (0-100)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_fixed INTEGER DEFAULT 0; -- Fixed discount in cents
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_active BOOLEAN DEFAULT false; -- Whether discount is active

-- Create membership_pricing table for dynamic pricing
CREATE TABLE IF NOT EXISTS public.membership_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  membership_type TEXT NOT NULL UNIQUE,
  price INTEGER NOT NULL, -- Price in cents
  yearly_price_display TEXT NOT NULL, -- Display format like "€250"
  employees_range TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.membership_pricing ENABLE ROW LEVEL SECURITY;

-- Create policies for membership_pricing
CREATE POLICY "Membership pricing is viewable by everyone" 
ON public.membership_pricing 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage membership pricing" 
ON public.membership_pricing 
FOR ALL 
USING (verify_admin_access())
WITH CHECK (verify_admin_access());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_membership_pricing_updated_at
BEFORE UPDATE ON public.membership_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default membership pricing
INSERT INTO public.membership_pricing (membership_type, price, yearly_price_display, employees_range) VALUES
('klein', 25000, '€250', '1-10 medewerkers'),
('middelgroot', 75000, '€750', '11-30 medewerkers'),
('groot', 125000, '€1250', '31-50 medewerkers')
ON CONFLICT (membership_type) DO UPDATE SET
  price = EXCLUDED.price,
  yearly_price_display = EXCLUDED.yearly_price_display,
  employees_range = EXCLUDED.employees_range,
  updated_at = now();