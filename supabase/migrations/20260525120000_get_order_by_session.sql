-- RPC: order ophalen via Stripe session ID (voor bedankpagina)
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
