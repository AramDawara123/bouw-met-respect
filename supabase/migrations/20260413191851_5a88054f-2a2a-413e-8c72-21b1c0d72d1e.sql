ALTER TABLE public.membership_pricing
ADD COLUMN IF NOT EXISTS stripe_product_id text,
ADD COLUMN IF NOT EXISTS stripe_price_id text;