-- Create orders table for webshop checkout
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  items JSONB NOT NULL,
  subtotal INTEGER NOT NULL,
  shipping INTEGER NOT NULL,
  total INTEGER NOT NULL,
  currency TEXT DEFAULT 'EUR',
  payment_status TEXT DEFAULT 'pending', -- pending, paid, failed, expired, canceled
  mollie_payment_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create orders"
ON public.orders
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Update orders"
ON public.orders
FOR UPDATE
USING (true);

CREATE INDEX orders_mollie_payment_id_idx ON public.orders (mollie_payment_id);

-- Trigger to auto-update updated_at on update
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


