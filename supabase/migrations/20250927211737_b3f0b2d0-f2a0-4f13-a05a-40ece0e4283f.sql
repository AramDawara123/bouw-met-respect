-- Create newsletter_signups table to store emails as fallback
CREATE TABLE public.newsletter_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  signed_up_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  mailchimp_synced BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (public newsletter signup)
CREATE POLICY "Anyone can sign up for newsletter" 
ON public.newsletter_signups 
FOR INSERT 
WITH CHECK (true);

-- Create policy for admins to view all signups
CREATE POLICY "Admins can view all newsletter signups" 
ON public.newsletter_signups 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (is_admin = true OR role = 'admin')
  )
);