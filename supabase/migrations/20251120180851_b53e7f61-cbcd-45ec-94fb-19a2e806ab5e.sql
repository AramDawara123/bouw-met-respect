-- Add missing columns to existing tables

-- Add missing fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add missing fields to orders table  
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS subtotal INTEGER,
ADD COLUMN IF NOT EXISTS shipping INTEGER,
ADD COLUMN IF NOT EXISTS total INTEGER,
ADD COLUMN IF NOT EXISTS customer_first_name TEXT,
ADD COLUMN IF NOT EXISTS customer_last_name TEXT;

-- Add missing fields to memberships table
ALTER TABLE public.memberships
ADD COLUMN IF NOT EXISTS membership_type TEXT;

-- Create QR codes table
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  qr_size INTEGER DEFAULT 256,
  error_correction TEXT DEFAULT 'M',
  foreground_color TEXT DEFAULT '#000000',
  background_color TEXT DEFAULT '#ffffff',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own QR codes"
ON public.qr_codes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own QR codes"
ON public.qr_codes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own QR codes"
ON public.qr_codes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own QR codes"
ON public.qr_codes FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_qr_codes_updated_at
BEFORE UPDATE ON public.qr_codes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();