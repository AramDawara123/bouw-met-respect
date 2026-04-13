import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

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

    const origin = req.headers.get('origin') || Deno.env.get('PUBLIC_SITE_URL') || 'https://bouw-met-respect.lovable.app';

    // Handle free orders (0 euro total)
    if (totalCents === 0) {
      const supabaseService = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
      );

      const orderId = 'FREE-' + Date.now();

      const { error: insertError } = await supabaseService
        .from('orders')
        .insert({
          items,
          subtotal: subtotalCents,
          shipping: shippingCents,
          total: totalCents,
          discount_amount: discountAmountCents,
          discount_code: discountCode || null,
          currency: 'EUR',
          payment_status: 'paid',
          mollie_payment_id: orderId,
          customer_name: `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Klant',
          customer_first_name: customer?.firstName || null,
          customer_last_name: customer?.lastName || null,
          customer_email: customer?.email || user?.email || '',
          customer_phone: customer?.phone || null,
          customer_address: customer?.street ? `${customer.street} ${customer.houseNumber || ''}`.trim() : null,
          customer_postal_code: customer?.postcode || null,
          customer_city: customer?.city || null,
          total_amount: totalCents,
        });

      if (insertError) {
        console.error('Free order save failed:', insertError.message);
        throw new Error('Kon gratis bestelling niet opslaan');
      }

      // Increment discount usage
      if (discountCode) {
        try {
          await supabaseService.rpc('increment_discount_usage', { code_to_increment: discountCode.toUpperCase() });
        } catch (e) { console.error('Discount increment error:', e); }
      }

      // Send confirmation email
      try {
        await supabaseService.functions.invoke('send-order-confirmation', {
          body: {
            orderId,
            customerEmail: customer?.email || user?.email,
            customerName: `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Klant',
            orderItems: items.map((item: any) => ({ name: item.name, quantity: item.quantity || 1, price: item.price })),
            subtotal: subtotalCents,
            shipping: shippingCents,
            total: totalCents,
            shippingAddress: { street: customer?.street, houseNumber: customer?.houseNumber, postcode: customer?.postcode, city: customer?.city, country: customer?.country || 'Nederland' },
            orderDate: new Date().toLocaleDateString('nl-NL')
          }
        });
      } catch (e) { console.error('Email error:', e); }

      return new Response(
        JSON.stringify({ success: true, orderId, redirectUrl: `${origin}/order-thank-you?orderId=${orderId}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Paid order - create Stripe Checkout Session
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('Stripe API key niet geconfigureerd');

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: { name: item.name },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: Number(item.quantity || 1),
    }));

    // Add shipping as a line item if applicable
    if (shippingCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: 'Verzendkosten' },
          unit_amount: shippingCents,
        },
        quantity: 1,
      });
    }

    const sessionParams: any = {
      payment_method_types: ['card', 'ideal'],
      mode: 'payment',
      line_items: lineItems,
      metadata: {
        type: 'order',
        customer_email: customer?.email || '',
        customer_name: `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim(),
        discount_code: discountCode || '',
        discount_amount: String(discountAmountCents),
      },
      success_url: `${origin}/webshop?status=paid`,
      cancel_url: `${origin}/webshop?status=canceled`,
    };

    if (customer?.email) {
      sessionParams.customer_email = customer.email;
    }

    // Apply discount if present
    if (discountAmountCents > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: discountAmountCents,
        currency: 'eur',
        duration: 'once',
        name: discountCode || 'Korting',
      });
      sessionParams.discounts = [{ coupon: coupon.id }];
      // Remove shipping line item and recalculate since Stripe handles discount
      // Actually, let Stripe handle the line items and discount separately
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Store order in database
    try {
      const supabaseService = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
      );

      const { error: insertError } = await supabaseService
        .from('orders')
        .insert({
          items,
          subtotal: subtotalCents,
          shipping: shippingCents,
          total: totalCents,
          discount_amount: discountAmountCents,
          discount_code: discountCode || null,
          currency: 'EUR',
          payment_status: 'pending',
          mollie_payment_id: session.id,
          customer_name: `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Klant',
          customer_first_name: customer?.firstName || null,
          customer_last_name: customer?.lastName || null,
          customer_email: customer?.email || '',
          customer_phone: customer?.phone || null,
          customer_address: customer?.street ? `${customer.street} ${customer.houseNumber || ''}`.trim() : null,
          customer_postal_code: customer?.postcode || null,
          customer_city: customer?.city || null,
          total_amount: totalCents,
        });

      if (insertError) {
        console.error('Order save failed:', insertError.message);
      } else if (discountCode) {
        try {
          await supabaseService.rpc('increment_discount_usage', { code_to_increment: discountCode.toUpperCase() });
        } catch (e) { console.error('Discount increment error:', e); }
      }
    } catch (dbErr) {
      console.error('Order save exception:', dbErr);
    }

    return new Response(
      JSON.stringify({ paymentUrl: session.url, orderId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
