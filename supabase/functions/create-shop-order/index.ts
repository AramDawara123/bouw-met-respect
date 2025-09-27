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

    const { items, customer, discountCode, discountAmount } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Geen items ontvangen');
    }

    const subtotalCents = items.reduce((sum: number, it: any) => {
      const priceCents = Math.round(Number(it.price) * 100);
      const qty = Number(it.quantity || 1);
      return sum + priceCents * qty;
    }, 0);

    const discountAmountCents = Math.round((discountAmount || 0));
    const subtotalAfterDiscount = Math.max(0, subtotalCents - discountAmountCents);
    const shippingCents = (subtotalAfterDiscount >= 5000 || discountAmountCents >= subtotalCents) ? 0 : 500;
    const totalCents = subtotalAfterDiscount + shippingCents;
    const totalEuroValue = (totalCents / 100).toFixed(2);

    const origin = req.headers.get('origin') || Deno.env.get('PUBLIC_SITE_URL') || 'https://example.com';

    // Handle free orders (0 euro total)
    if (totalCents === 0) {
      // Create free order directly without Mollie
      const supabaseService = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
      );

      const orderId = 'FREE-' + Date.now();

      const { error: insertError } = await supabaseService
        .from('orders')
        .insert({
          user_id: user?.id || null,
          email: (customer?.email) || user?.email || null,
          items,
          subtotal: subtotalCents,
          shipping: shippingCents,
          total: totalCents,
          discount_amount: discountAmountCents,
          discount_code: discountCode || null,
          currency: 'EUR',
          payment_status: 'paid', // Free orders are automatically paid
          mollie_payment_id: orderId,
          customer_first_name: customer?.firstName || null,
          customer_last_name: customer?.lastName || null,
          customer_email: customer?.email || null,
          customer_phone: customer?.phone || null,
          address_street: customer?.street || null,
          address_house_number: customer?.houseNumber || null,
          address_postcode: customer?.postcode || null,
          address_city: customer?.city || null,
          address_country: customer?.country || null
        });

      if (insertError) {
        console.error('Free order save failed:', insertError.message);
        throw new Error('Kon gratis bestelling niet opslaan');
      }

      // Return success response for free order
      return new Response(
        JSON.stringify({ 
          success: true, 
          orderId: orderId,
          redirectUrl: `${origin}/webshop?status=paid&free=true`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const mollieApiKey = Deno.env.get('MOLLIE_API_KEY');
    if (!mollieApiKey) {
      throw new Error('Mollie API key niet geconfigureerd');
    }

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
          email: (customer?.email) || user?.email || null,
          customer,
          items,
          subtotalCents: subtotalAfterDiscount,
          shippingCents,
          totalCents,
          discountCode: discountCode || null,
          discountAmount: discountAmountCents
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

    // Try to store the order, but do not block checkout if it fails
    try {
      const supabaseService = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
      );

      const { error: insertError } = await supabaseService
        .from('orders')
        .insert({
          user_id: user?.id || null,
          email: (customer?.email) || user?.email || null,
          items,
          subtotal: subtotalCents,
          shipping: shippingCents,
          total: totalCents,
          discount_amount: discountAmountCents,
          discount_code: discountCode || null,
          currency: 'EUR',
          payment_status: 'pending',
          mollie_payment_id: molliePayment.id,
          customer_first_name: customer?.firstName || null,
          customer_last_name: customer?.lastName || null,
          customer_email: customer?.email || null,
          customer_phone: customer?.phone || null,
          address_street: customer?.street || null,
          address_house_number: customer?.houseNumber || null,
          address_postcode: customer?.postcode || null,
          address_city: customer?.city || null,
          address_country: customer?.country || null
        });

      if (insertError) {
        console.error('Order save failed, continuing to checkout:', insertError.message);
      }
    } catch (dbErr) {
      console.error('Order save threw exception, continuing to checkout:', dbErr);
    }

    return new Response(
      JSON.stringify({ 
        paymentUrl: molliePayment._links.checkout.href,
        orderId: molliePayment.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});


