-- Create table for action items pricing
CREATE TABLE public.action_items_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  size_type TEXT NOT NULL,
  employees_range TEXT NOT NULL,
  price_display TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  is_popular BOOLEAN DEFAULT false,
  is_quote BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.action_items_pricing ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Action items pricing is viewable by everyone" 
ON public.action_items_pricing 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage action items pricing" 
ON public.action_items_pricing 
FOR ALL 
USING (verify_admin_access()) 
WITH CHECK (verify_admin_access());

-- Insert default pricing data
INSERT INTO public.action_items_pricing (size_type, employees_range, price_display, price_cents, is_popular, is_quote, display_order) VALUES
('Klein', '1-10 medewerkers', '€250', 25000, false, false, 1),
('Middelgroot', '11-30 medewerkers', '€750', 75000, true, false, 2),
('Groot', '31-50 medewerkers', '€1250', 125000, false, false, 3),
('Enterprise', '50+ medewerkers', 'Offerte', 0, false, true, 4);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_action_items_pricing_updated_at
BEFORE UPDATE ON public.action_items_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();