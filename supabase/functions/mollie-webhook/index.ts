import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mollieApiKey = Deno.env.get('MOLLIE_API_KEY');
    if (!mollieApiKey) {
      return new Response('Missing Mollie API key', { headers: corsHeaders, status: 500 });
    }

    let paymentId: string | null = null;
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = await req.formData();
      paymentId = String(form.get('id') || '');
    } else {
      try {
        const json = await req.json();
        paymentId = json?.id || null;
      } catch {
        // ignore
      }
    }

    if (!paymentId) {
      return new Response('No payment id', { headers: corsHeaders, status: 400 });
    }

    const detailsResp = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${mollieApiKey}` }
    });

    if (!detailsResp.ok) {
      return new Response('Failed to fetch payment', { headers: corsHeaders, status: 502 });
    }

    const payment = await detailsResp.json();
    const status = payment.status as string;
    const metadata = payment.metadata || {};

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    let newStatus = 'pending';
    if (status === 'paid' || status === 'authorized') newStatus = 'paid';
    else if (status === 'failed') newStatus = 'failed';
    else if (status === 'canceled') newStatus = 'canceled';
    else if (status === 'expired') newStatus = 'expired';
    else newStatus = 'pending';

    // Check if this is a partner membership payment
    if (metadata.type === 'partner_membership') {
      const { error } = await supabaseService
        .from('partner_memberships')
        .update({ payment_status: newStatus })
        .eq('mollie_payment_id', paymentId);

      if (error) {
        return new Response(`Partner DB update error: ${error.message}`, { headers: corsHeaders, status: 500 });
      }
    } else {
      // Regular order payment
      const { error } = await supabaseService
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('mollie_payment_id', paymentId);

      if (error) {
        return new Response(`Order DB update error: ${error.message}`, { headers: corsHeaders, status: 500 });
      }
    }

    return new Response('OK', { headers: corsHeaders, status: 200 });
  } catch (e: any) {
    return new Response(e?.message || 'Webhook error', { headers: corsHeaders, status: 500 });
  }
});


