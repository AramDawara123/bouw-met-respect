-- Add company_size field to partner_memberships table
ALTER TABLE public.partner_memberships 
ADD COLUMN company_size TEXT;

-- Update default amount to reflect new ZZP pricing
-- ZZP: €250/jaar = 25000 cents (new default)
-- Klein: €450/jaar = 45000 cents  
-- Middelgroot: €750/jaar = 75000 cents
-- Groot: €0/jaar = 0 cents (offerte op maat)
ALTER TABLE public.partner_memberships 
ALTER COLUMN amount SET DEFAULT 25000;

-- Add comment to document the new pricing structure for partners
COMMENT ON COLUMN public.partner_memberships.amount IS 'Amount in cents: ZZP=25000 (€250), Klein=45000 (€450), Middelgroot=75000 (€750), Groot=0 (offerte)';
COMMENT ON COLUMN public.partner_memberships.company_size IS 'Company size category: zzp, klein, middelgroot, groot';
