-- Add is_quote column to membership_pricing table
ALTER TABLE public.membership_pricing 
ADD COLUMN is_quote boolean DEFAULT false;

-- Add the Offerte tier to the database
INSERT INTO public.membership_pricing (
  membership_type,
  price,
  yearly_price_display,
  employees_range,
  is_quote
) VALUES (
  'offerte',
  0,
  'Op maat',
  '50+ medewerkers',
  true
);