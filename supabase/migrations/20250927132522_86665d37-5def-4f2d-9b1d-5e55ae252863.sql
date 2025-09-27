-- Create partner pricing tiers table
CREATE TABLE public.partner_pricing_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_range TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  price_display TEXT NOT NULL,
  is_quote BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.partner_pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Create policies for partner pricing tiers
CREATE POLICY "Partner pricing tiers are viewable by everyone" 
ON public.partner_pricing_tiers 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage partner pricing tiers" 
ON public.partner_pricing_tiers 
FOR ALL 
USING (verify_admin_access())
WITH CHECK (verify_admin_access());

-- Insert default pricing tiers
INSERT INTO public.partner_pricing_tiers (employee_range, price_cents, price_display, display_order, is_quote) VALUES
('1-10 medewerkers', 23000, '€230', 1, false),
('11-30 medewerkers', 75000, '€750', 2, false),
('31-50 medewerkers', 125000, '€1250', 3, false),
('50+ medewerkers', 0, 'Offerte', 4, true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_partner_pricing_tiers_updated_at
BEFORE UPDATE ON public.partner_pricing_tiers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();