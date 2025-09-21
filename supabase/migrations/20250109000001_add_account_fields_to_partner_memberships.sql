-- Add account management fields to partner_memberships table
ALTER TABLE public.partner_memberships 
ADD COLUMN IF NOT EXISTS account_created BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS generated_password TEXT;
