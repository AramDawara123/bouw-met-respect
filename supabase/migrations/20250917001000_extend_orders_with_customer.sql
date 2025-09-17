-- Extend orders with customer details for webshop checkout
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS customer_first_name TEXT,
ADD COLUMN IF NOT EXISTS customer_last_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS address_street TEXT,
ADD COLUMN IF NOT EXISTS address_house_number TEXT,
ADD COLUMN IF NOT EXISTS address_postcode TEXT,
ADD COLUMN IF NOT EXISTS address_city TEXT,
ADD COLUMN IF NOT EXISTS address_country TEXT;

-- Optional helpful index
CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON public.orders (customer_email);

