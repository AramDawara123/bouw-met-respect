-- Create memberships table to track membership applications and payments
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  job_title TEXT NOT NULL,
  industry_role TEXT NOT NULL,
  experience_years TEXT NOT NULL,
  specializations TEXT[] NOT NULL,
  newsletter BOOLEAN DEFAULT true,
  mollie_payment_id TEXT UNIQUE,
  payment_status TEXT DEFAULT 'pending', -- pending, paid, failed, expired
  amount INTEGER DEFAULT 2500, -- €25.00 in cents
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- Create policies for memberships
CREATE POLICY "Users can view their own memberships" 
ON public.memberships 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create memberships" 
ON public.memberships 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Update memberships" 
ON public.memberships 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_memberships_updated_at
BEFORE UPDATE ON public.memberships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();