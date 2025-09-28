-- Enable real-time for orders table
-- Set replica identity to capture full row data during changes
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- Add the orders table to the supabase_realtime publication for real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;