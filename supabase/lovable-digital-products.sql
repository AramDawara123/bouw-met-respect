-- =============================================================================
-- BOUW MET RESPECT – Digitale producten & download tokens
-- Plak dit in de Lovable SQL Editor en voer uit (één keer).
-- Veilig om opnieuw uit te voeren: gebruikt IF NOT EXISTS / DROP IF EXISTS.
-- =============================================================================

-- Extensie voor veilige download-tokens (gen_random_bytes)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- 1. Producten: digitale velden
-- -----------------------------------------------------------------------------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_digital BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pdf_url TEXT;

COMMENT ON COLUMN public.products.is_digital IS 'True = digitaal product (PDF download na betaling)';
COMMENT ON COLUMN public.products.pdf_url IS 'Publieke URL van de PDF in storage bucket smb';

-- -----------------------------------------------------------------------------
-- 2. Download tokens tabel (beveiligde downloadlinks in e-mail)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.download_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  order_id TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  download_count INTEGER NOT NULL DEFAULT 0,
  max_downloads INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS download_tokens_token_idx
  ON public.download_tokens (token);

CREATE INDEX IF NOT EXISTS download_tokens_order_id_idx
  ON public.download_tokens (order_id);

CREATE INDEX IF NOT EXISTS download_tokens_customer_email_idx
  ON public.download_tokens (customer_email);

COMMENT ON TABLE public.download_tokens IS 'Beveiligde downloadlinks voor digitale producten (edge function download-pdf)';

-- -----------------------------------------------------------------------------
-- 3. Row Level Security
-- -----------------------------------------------------------------------------
ALTER TABLE public.download_tokens ENABLE ROW LEVEL SECURITY;

-- Verwijder oude policies als je dit script opnieuw draait
DROP POLICY IF EXISTS "Service role full access on download_tokens" ON public.download_tokens;
DROP POLICY IF EXISTS "Public token lookup" ON public.download_tokens;

-- Edge functions (service role) mogen alles
CREATE POLICY "Service role full access on download_tokens"
  ON public.download_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Publieke download-endpoint mag token opzoeken
CREATE POLICY "Public token lookup"
  ON public.download_tokens
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- 4. Storage: bucket + PDF-map (product-pdfs/)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('smb', 'smb', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read product PDFs" ON storage.objects;
CREATE POLICY "Public read product PDFs"
  ON storage.objects
  FOR SELECT
  TO public
  USING (
    bucket_id = 'smb'
    AND (storage.foldername(name))[1] = 'product-pdfs'
  );

DROP POLICY IF EXISTS "Authenticated upload product PDFs" ON storage.objects;
CREATE POLICY "Authenticated upload product PDFs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'smb'
    AND (storage.foldername(name))[1] = 'product-pdfs'
  );

DROP POLICY IF EXISTS "Authenticated update product PDFs" ON storage.objects;
CREATE POLICY "Authenticated update product PDFs"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'smb'
    AND (storage.foldername(name))[1] = 'product-pdfs'
  );

DROP POLICY IF EXISTS "Authenticated delete product PDFs" ON storage.objects;
CREATE POLICY "Authenticated delete product PDFs"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'smb'
    AND (storage.foldername(name))[1] = 'product-pdfs'
  );

-- -----------------------------------------------------------------------------
-- 5. RPC: order ophalen via Stripe session (bedankpagina)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_order_by_session(p_session_id TEXT)
RETURNS TABLE (
  id UUID,
  items JSONB,
  subtotal INTEGER,
  shipping INTEGER,
  total INTEGER,
  discount_amount INTEGER,
  customer_first_name TEXT,
  customer_last_name TEXT,
  customer_email TEXT,
  payment_status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    o.id,
    o.items,
    o.subtotal,
    o.shipping,
    o.total,
    o.discount_amount,
    o.customer_first_name,
    o.customer_last_name,
    o.customer_email,
    o.payment_status,
    o.created_at
  FROM public.orders o
  WHERE o.mollie_payment_id = p_session_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_order_by_session(TEXT) TO anon, authenticated, service_role;

-- =============================================================================
-- Klaar! Controleer met:
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'products' AND column_name IN ('is_digital', 'pdf_url');
-- SELECT * FROM information_schema.tables WHERE table_name = 'download_tokens';
-- =============================================================================
