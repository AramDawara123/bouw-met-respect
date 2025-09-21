-- Complete database migration for partner management
-- Run this in Supabase SQL Editor

-- Add missing columns to partner_memberships table
ALTER TABLE public.partner_memberships 
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS account_created BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS generated_password TEXT;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'partner_memberships' 
AND column_name IN ('company_size', 'account_created', 'generated_password')
ORDER BY column_name;

-- Test insert to verify everything works
INSERT INTO public.partner_memberships (
  first_name, 
  last_name, 
  email, 
  company_name, 
  payment_status, 
  amount,
  company_size,
  account_created,
  generated_password
) VALUES (
  'Test',
  'Partner',
  'test@partner.nl',
  'Test Partner Bedrijf',
  'pending',
  0,
  'klein',
  false,
  'test123'
) ON CONFLICT (email) DO NOTHING;

-- Clean up test data
DELETE FROM public.partner_memberships WHERE email = 'test@partner.nl';

-- Show final table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'partner_memberships' 
ORDER BY ordinal_position;
