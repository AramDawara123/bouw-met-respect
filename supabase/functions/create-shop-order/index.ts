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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    let user = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;
    }

    const { items, email } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Geen items ontvangen');
    }

    const subtotalCents = items.reduce((sum: number, it: any) => {
      const priceCents = Math.round(Number(it.price) * 100);
      const qty = Number(it.quantity || 1);
      return sum + priceCents * qty;
    }, 0);

    const shippingCents = subtotalCents >= 2500 ? 0 : 495;
    const totalCents = subtotalCents + shippingCents;
    const totalEuroValue = (totalCents / 100).toFixed(2);

    const mollieApiKey = Deno.env.get('live_AaMAbMqxnuJtnQw3VfRBgmtkQ9SnTUMOLLIE_API_KEY');
    if (!mollieApiKey) {
      throw new Error('Mollie API key niet geconfigureerd');
    }

    const origin = req.headers.get('origin') || Deno.env.get('PUBLIC_SITE_URL') || 'https://example.com';
    const webhookUrl = Deno.env.get('MOLLIE_WEBHOOK_URL');

    const mollieResponse = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mollieApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: { currency: 'EUR', value: totalEuroValue },
        description: 'Webshop bestelling',
        redirectUrl: `${origin}/webshop?status=paid`,
        webhookUrl: webhookUrl || undefined,
        metadata: {
          email: email || user?.email || null,
          items,
          subtotalCents,
          shippingCents,
          totalCents
        }
      })
    });

    if (!mollieResponse.ok) {
      let errorMsg = `Mollie API error: ${mollieResponse.status}`;
      try {
        const errJson = await mollieResponse.json();
        errorMsg = errJson?.detail || errJson?.message || JSON.stringify(errJson);
      } catch (_) {
        const errorText = await mollieResponse.text();
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const molliePayment = await mollieResponse.json();

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { error: insertError } = await supabaseService
      .from('orders')
      .insert({
        user_id: user?.id || null,
        email: email || user?.email || null,
        items,
        subtotal: subtotalCents,
        shipping: shippingCents,
        total: totalCents,
        currency: 'EUR',
        payment_status: 'pending',
        mollie_payment_id: molliePayment.id
      });

    if (insertError) {
      throw new Error(`Database error: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({ paymentUrl: molliePayment._links.checkout.href }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});


