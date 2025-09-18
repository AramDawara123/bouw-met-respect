-- Create orders table for webshop functionality
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  email TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal INTEGER NOT NULL DEFAULT 0,
  shipping INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  mollie_payment_id TEXT,
  customer_first_name TEXT,
  customer_last_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  address_street TEXT,
  address_house_number TEXT,
  address_postcode TEXT,
  address_city TEXT,
  address_country TEXT DEFAULT 'Nederland',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Orders are viewable by admins" 
ON public.orders 
FOR SELECT 
USING (verify_admin_access());

CREATE POLICY "Authenticated users can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update orders" 
ON public.orders 
FOR UPDATE 
USING (verify_admin_access());

CREATE POLICY "Admins can delete orders" 
ON public.orders 
FOR DELETE 
USING (verify_admin_access());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();