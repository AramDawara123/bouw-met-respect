-- Create table for storing QR codes
CREATE TABLE public.qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  qr_size INTEGER NOT NULL DEFAULT 200,
  error_correction TEXT NOT NULL DEFAULT 'M',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own QR codes" 
ON public.qr_codes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own QR codes" 
ON public.qr_codes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own QR codes" 
ON public.qr_codes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own QR codes" 
ON public.qr_codes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can view all QR codes
CREATE POLICY "Admins can view all QR codes" 
ON public.qr_codes 
FOR SELECT 
USING (verify_admin_access());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_qr_codes_updated_at
BEFORE UPDATE ON public.qr_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();