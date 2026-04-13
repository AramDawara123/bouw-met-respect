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

    const { membershipData, membershipType, amount } = await req.json();

    if (!membershipData || !membershipType) {
      throw new Error('Membership data and type are required');
    }

    let defaultAmount;
    switch(membershipType) {
      case 'klein': defaultAmount = 25000; break;
      case 'middelgroot': defaultAmount = 75000; break;
      case 'groot': defaultAmount = 125000; break;
      default: defaultAmount = 25000;
    }

    const membershipAmount = amount || defaultAmount;
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('Stripe API key not configured');

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    const origin = req.headers.get('origin') || 'https://bouw-met-respect.lovable.app';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'ideal'],
      mode: 'payment',
      customer_email: membershipData.email,
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Bouw met Respect ${membershipType.charAt(0).toUpperCase() + membershipType.slice(1)} Lidmaatschap`,
          },
          unit_amount: membershipAmount,
        },
        quantity: 1,
      }],
      metadata: {
        type: 'membership',
        email: membershipData.email,
        membershipType,
      },
      success_url: `${origin}/membership-success`,
      cancel_url: `${origin}/membership-success?canceled=true`,
    });

    // Store membership in database
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { data: membership, error: membershipError } = await supabaseService
      .from('memberships')
      .insert({
        user_id: user?.id || null,
        first_name: membershipData.firstName,
        last_name: membershipData.lastName,
        email: membershipData.email,
        phone: membershipData.phone,
        company: membershipData.company || null,
        job_title: membershipData.jobTitle,
        industry_role: membershipData.industryRole,
        experience_years: membershipData.experienceYears,
        specializations: membershipData.specializations,
        newsletter: membershipData.newsletter,
        mollie_payment_id: session.id,
        membership_type: membershipType,
        payment_status: 'pending',
        amount: membershipAmount,
        currency: 'EUR'
      })
      .select()
      .single();

    if (membershipError) {
      console.error('Database error:', membershipError);
      throw new Error(`Database error: ${membershipError.message}`);
    }

    return new Response(
      JSON.stringify({ paymentUrl: session.url, membershipId: membership.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Payment creation error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
