-- Create membership types enum
CREATE TYPE public.membership_type AS ENUM ('klein', 'middelgroot', 'groot');

-- Add membership_type column to memberships table
ALTER TABLE public.memberships 
ADD COLUMN membership_type public.membership_type DEFAULT 'klein';

-- Update the amount to be variable based on membership type
-- Klein: €250/jaar = 25000 cents
-- Middelgroot: €750/jaar = 75000 cents  
-- Groot: €1250/jaar = 125000 cents
ALTER TABLE public.memberships 
ALTER COLUMN amount SET DEFAULT 25000;