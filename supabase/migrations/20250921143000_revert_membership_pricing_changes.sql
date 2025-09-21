-- Revert the membership pricing changes back to original structure
-- This reverts the changes made in 20250921140000_update_membership_pricing.sql

-- First, drop the new enum type if it exists
DROP TYPE IF EXISTS public.membership_type_new;

-- Recreate the original enum without zzp
CREATE TYPE public.membership_type_temp AS ENUM ('klein', 'middelgroot', 'groot');

-- Update the memberships table to use the temp enum
ALTER TABLE public.memberships 
ALTER COLUMN membership_type TYPE public.membership_type_temp 
USING membership_type::text::public.membership_type_temp;

-- Drop the modified enum type
DROP TYPE IF EXISTS public.membership_type;

-- Rename the temp enum type back to the original name
ALTER TYPE public.membership_type_temp RENAME TO membership_type;

-- Restore original default amount for memberships (Klein = €250)
ALTER TABLE public.memberships 
ALTER COLUMN amount SET DEFAULT 25000;

-- Update comment to reflect original pricing structure
COMMENT ON COLUMN public.memberships.amount IS 'Amount in cents: Klein=25000 (€250), Middelgroot=75000 (€750), Groot=125000 (€1250)';
