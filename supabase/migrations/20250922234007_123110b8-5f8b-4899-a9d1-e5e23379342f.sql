-- Create discount codes table for Shopify-like discount system
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value INTEGER NOT NULL, -- Percentage (0-100) or fixed amount in cents
  minimum_order_amount INTEGER DEFAULT 0, -- Minimum order amount in cents
  usage_limit INTEGER, -- NULL = unlimited
  used_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for discount codes
CREATE POLICY "Discount codes are viewable by everyone" 
ON public.discount_codes 
FOR SELECT 
USING (active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can manage discount codes" 
ON public.discount_codes 
FOR ALL 
USING (verify_admin_access())
WITH CHECK (verify_admin_access());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_discount_codes_updated_at
BEFORE UPDATE ON public.discount_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add discount code field to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0; -- Discount amount applied in cents

-- Insert some example discount codes
INSERT INTO public.discount_codes (code, description, discount_type, discount_value, minimum_order_amount, usage_limit) VALUES
('WELCOME10', '10% korting voor nieuwe klanten', 'percentage', 10, 2500, 100),
('SAVE5', '€5 korting vanaf €25', 'fixed_amount', 500, 2500, NULL),
('FIRSTORDER', '15% korting op eerste bestelling', 'percentage', 15, 0, 50)
ON CONFLICT (code) DO NOTHING;