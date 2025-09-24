// Admin client for dashboard access - bypasses RLS policies
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pkvayugxzgkoipclcpli.supabase.co";
// Using the correct service role key from Supabase
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrdmF5dWd4emdrb2lwY2xjcGxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjk2MTcyMywiZXhwIjoyMDUyNTIxNzIzfQ.LSfMRFKVTtcUGtB8_5j6HtyBwRHB8A3bOaxNW6eNH9A";

// Admin client that bypasses RLS policies
export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
