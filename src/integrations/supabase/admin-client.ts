// Admin client for dashboard access - bypasses RLS policies
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pkvayugxzgkoipclcpli.supabase.co";
// Using service role key to bypass RLS policies for admin access
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrdmF5dWd4emdrb2lwY2xjcGxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU4MTcyMywiZXhwIjoyMDcyMTU3NzIzfQ.9BxD8pO0YSUQvfwqOlhOOiH2YmwLn4iNm7vfhYqUJn8";

// Admin client that bypasses RLS policies
export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
