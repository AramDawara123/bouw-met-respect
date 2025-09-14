// Admin client for dashboard access - bypasses RLS policies
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pkvayugxzgkoipclcpli.supabase.co";
// This should be the service role key in production, but for now we'll use the anon key
// In production, you should store this in environment variables
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrdmF5dWd4emdrb2lwY2xjcGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODE3MjMsImV4cCI6MjA3MjE1NzcyM30.6pjPyFAoU5LQMi162jh5M9KzSLq5QA-TegXo8NnTnWE";

// Admin client that bypasses RLS policies
export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
