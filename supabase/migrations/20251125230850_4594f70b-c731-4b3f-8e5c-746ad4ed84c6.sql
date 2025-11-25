-- Add display_order column to membership_pricing table
ALTER TABLE public.membership_pricing 
ADD COLUMN display_order integer DEFAULT 0;

-- Update existing data with proper display order
UPDATE public.membership_pricing 
SET display_order = 1 
WHERE membership_type = 'klein';

UPDATE public.membership_pricing 
SET display_order = 2 
WHERE membership_type = 'middelgroot';

UPDATE public.membership_pricing 
SET display_order = 3 
WHERE membership_type = 'groot';

UPDATE public.membership_pricing 
SET display_order = 4 
WHERE membership_type = 'offerte';