-- Enable Row Level Security on profiles table
-- This table already has policies defined but RLS was not enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;