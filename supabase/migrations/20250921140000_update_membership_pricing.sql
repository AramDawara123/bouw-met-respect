-- Update membership types enum to include new ZZP category
ALTER TYPE public.membership_type ADD VALUE 'zzp';

-- Update the membership_type enum to reflect new structure
-- Note: We need to recreate the enum to reorder values properly
CREATE TYPE public.membership_type_new AS ENUM ('zzp', 'klein', 'middelgroot', 'groot');

-- Update the memberships table to use the new enum
ALTER TABLE public.memberships 
ALTER COLUMN membership_type TYPE public.membership_type_new 
USING membership_type::text::public.membership_type_new;

-- Drop the old enum type
DROP TYPE public.membership_type;

-- Rename the new enum type
ALTER TYPE public.membership_type_new RENAME TO membership_type;

-- Update default amount to reflect new ZZP pricing
-- ZZP: €250/jaar = 25000 cents
-- Klein: €450/jaar = 45000 cents  
-- Middelgroot: €750/jaar = 75000 cents
-- Groot: €0/jaar = 0 cents (offerte op maat)
ALTER TABLE public.memberships 
ALTER COLUMN amount SET DEFAULT 25000;

-- Update existing 'klein' memberships to new structure if needed
-- This is optional - you may want to keep existing memberships as-is
-- UPDATE public.memberships 
-- SET membership_type = 'zzp' 
-- WHERE membership_type = 'klein' AND amount = 25000;

-- Add comment to document the new pricing structure
COMMENT ON COLUMN public.memberships.amount IS 'Amount in cents: ZZP=25000 (€250), Klein=45000 (€450), Middelgroot=75000 (€750), Groot=0 (offerte)';
