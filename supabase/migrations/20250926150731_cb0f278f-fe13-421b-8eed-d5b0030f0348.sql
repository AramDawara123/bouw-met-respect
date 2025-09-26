-- Enable real-time updates for partner_memberships table
ALTER TABLE public.partner_memberships REPLICA IDENTITY FULL;

-- Add partner_memberships to the supabase_realtime publication if not already added
-- This allows real-time updates to be sent to clients
DO $$
BEGIN
  -- Check if the table is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'partner_memberships'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_memberships;
  END IF;
END $$;

-- Also ensure company_profiles has real-time enabled
ALTER TABLE public.company_profiles REPLICA IDENTITY FULL;

-- Add company_profiles to the supabase_realtime publication if not already added
DO $$
BEGIN
  -- Check if the table is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'company_profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.company_profiles;
  END IF;
END $$;