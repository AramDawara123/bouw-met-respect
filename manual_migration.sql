-- Add account management fields to partner_memberships table
-- Run this in Supabase SQL Editor

ALTER TABLE public.partner_memberships 
ADD COLUMN IF NOT EXISTS account_created BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS generated_password TEXT;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'partner_memberships' 
AND column_name IN ('account_created', 'generated_password');
