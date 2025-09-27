-- Add discount_code column to partner_memberships table
ALTER TABLE public.partner_memberships 
ADD COLUMN discount_code text;