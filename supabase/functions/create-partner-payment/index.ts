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
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Stripe API key' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      db: { schema: 'public' }
    });

    const { partnerData, amount, originalAmount, discountCode, discountAmount, skipPayment } = await req.json();
    
    const baseAmount = originalAmount || 25000;
    const partnerAmount = amount || baseAmount;
    const finalDiscountAmount = discountAmount || 0;

    // Handle free partnerships
    if (skipPayment || partnerAmount === 0) {
      const insertData: Record<string, unknown> = {
        user_id: null,
        first_name: partnerData.first_name,
        last_name: partnerData.last_name,
        email: partnerData.email,
        phone: partnerData.phone,
        company_name: partnerData.company_name,
        website: partnerData.website,
        industry: partnerData.industry,
        description: partnerData.description || '',
        mollie_payment_id: null,
        amount: partnerAmount,
        currency: 'EUR',
        payment_status: 'paid'
      };

      if (discountCode && finalDiscountAmount > 0) {
        insertData.description = (insertData.description as string) + `\n\nKortingscode toegepast: ${discountCode} (€${(finalDiscountAmount / 100).toFixed(2)} korting - GRATIS)`;
      }

      const { data: partnerMembership, error } = await supabaseService
        .from('partner_memberships')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: `Failed to store partner data: ${error.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, partnerMembershipId: partnerMembership.id, message: 'Free partnership created successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Stripe Checkout Session
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    const origin = req.headers.get('origin') || 'https://bouw-met-respect.lovable.app';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'ideal'],
      mode: 'payment',
      customer_email: partnerData.email,
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Partner lidmaatschap - ${partnerData.company_name}${discountCode ? ` (Code: ${discountCode})` : ''}`,
          },
          unit_amount: partnerAmount,
        },
        quantity: 1,
      }],
      metadata: {
        type: 'partner_membership',
        company_name: partnerData.company_name,
        email: partnerData.email,
        company_size: partnerData.company_size || 'zzp',
        original_amount: String(baseAmount),
        final_amount: String(partnerAmount),
        ...(discountCode && { discount_code: discountCode, discount_amount: String(finalDiscountAmount) })
      },
      success_url: `${origin}/partnership-success`,
      cancel_url: `${origin}/partnership-success?canceled=true`,
    });

    // Store partner membership
    let finalDescription = partnerData.description || '';
    if (discountCode && finalDiscountAmount > 0) {
      finalDescription += `\n\nKortingscode toegepast: ${discountCode} (€${(finalDiscountAmount / 100).toFixed(2)} korting)`;
    }

    const { data: partnerMembership, error } = await supabaseService
      .from('partner_memberships')
      .insert({
        user_id: null,
        first_name: partnerData.first_name,
        last_name: partnerData.last_name,
        email: partnerData.email,
        phone: partnerData.phone,
        company_name: partnerData.company_name,
        website: partnerData.website,
        industry: partnerData.industry,
        description: finalDescription,
        mollie_payment_id: session.id,
        amount: partnerAmount,
        currency: 'EUR',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: `Failed to store partner data: ${error.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ paymentUrl: session.url, partnerMembershipId: partnerMembership.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
