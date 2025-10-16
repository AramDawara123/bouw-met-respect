-- Create analytics events table for real visitor tracking
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  page_path TEXT,
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  device_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_session_id ON public.analytics_events(session_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert analytics events (for tracking)
CREATE POLICY "Anyone can insert analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

-- Only allow reading for authenticated users (for admin dashboard)
CREATE POLICY "Authenticated users can read analytics"
ON public.analytics_events
FOR SELECT
USING (auth.role() = 'authenticated');