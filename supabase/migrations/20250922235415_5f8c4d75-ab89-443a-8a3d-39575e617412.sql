-- Add applies_to field to discount_codes table
ALTER TABLE public.discount_codes 
ADD COLUMN applies_to text NOT NULL DEFAULT 'products';

-- Add check constraint for applies_to values
ALTER TABLE public.discount_codes 
ADD CONSTRAINT discount_applies_to_check 
CHECK (applies_to IN ('products', 'memberships', 'partners'));

-- Update existing discount codes to apply to products by default
UPDATE public.discount_codes 
SET applies_to = 'products' 
WHERE applies_to IS NULL;