-- Add digital product fields to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_digital BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Create download_tokens table for secure PDF delivery
CREATE TABLE IF NOT EXISTS download_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  order_id TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  download_count INTEGER NOT NULL DEFAULT 0,
  max_downloads INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE download_tokens ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (used by edge functions)
CREATE POLICY "Service role full access on download_tokens"
  ON download_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anyone can look up a token by its value (needed for public download endpoint)
CREATE POLICY "Public token lookup"
  ON download_tokens
  FOR SELECT
  TO anon, authenticated
  USING (true);
