-- Create donations table
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  amount INTEGER NOT NULL, -- in cents
  message TEXT,
  mollie_payment_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all donations"
  ON public.donations
  FOR SELECT
  USING (verify_admin_access());

CREATE POLICY "Admins can update donations"
  ON public.donations
  FOR UPDATE
  USING (verify_admin_access());

-- Allow anyone to insert donations (for the payment flow)
CREATE POLICY "Anyone can create donations"
  ON public.donations
  FOR INSERT
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for payment lookup
CREATE INDEX idx_donations_mollie_payment_id ON public.donations(mollie_payment_id);
CREATE INDEX idx_donations_created_at ON public.donations(created_at DESC);
