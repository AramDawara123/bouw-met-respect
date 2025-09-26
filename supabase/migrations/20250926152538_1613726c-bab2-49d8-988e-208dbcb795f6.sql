-- Enable real-time updates for action_items_pricing table
ALTER TABLE public.action_items_pricing REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.action_items_pricing;