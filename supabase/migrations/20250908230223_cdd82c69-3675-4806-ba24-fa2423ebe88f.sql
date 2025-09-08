-- Add motivation and vision fields to memberships table
ALTER TABLE public.memberships 
ADD COLUMN IF NOT EXISTS motivation TEXT,
ADD COLUMN IF NOT EXISTS respectful_practices TEXT,
ADD COLUMN IF NOT EXISTS respectful_workplace TEXT,
ADD COLUMN IF NOT EXISTS boundary_behavior TEXT;