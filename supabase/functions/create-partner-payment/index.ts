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
      return new Response(
        JSON.stringify({ error: 'Missing Mollie API key' }),
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
      auth: { persistSession: false }
    });

    const { partnerData, amount } = await req.json();
    
    // Default amount if not provided (fallback to ZZP price)
    const partnerAmount = amount || 25000;

    console.log('Creating partner payment for:', partnerData);

    // Create payment with Mollie
    const molliePayload = {
      amount: { currency: 'EUR', value: (partnerAmount / 100).toFixed(2) },
      description: `Partner lidmaatschap - ${partnerData.company_name}`,
      redirectUrl: `${req.headers.get('origin')}/partnership-success`,
      webhookUrl: `${supabaseUrl}/functions/v1/mollie-webhook`,
      metadata: {
        type: 'partner_membership',
        company_name: partnerData.company_name,
        email: partnerData.email,
        company_size: partnerData.company_size || 'zzp'
      }
    };

    const mollieResponse = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mollieApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(molliePayload)
    });

    if (!mollieResponse.ok) {
      const mollieError = await mollieResponse.text();
      console.error('Mollie API error:', mollieError);
      return new Response(
        JSON.stringify({ error: 'Payment creation failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const mollieData = await mollieResponse.json();
    console.log('Mollie payment created:', mollieData.id);

    // Store partner membership data in database
    const { data: partnerMembership, error } = await supabaseService
      .from('partner_memberships')
      .insert({
        first_name: partnerData.first_name,
        last_name: partnerData.last_name,
        email: partnerData.email,
        phone: partnerData.phone,
        company_name: partnerData.company_name,
        website: partnerData.website,
        industry: partnerData.industry,
        description: partnerData.description,
        company_size: partnerData.company_size,
        mollie_payment_id: mollieData.id,
        amount: partnerAmount,
        currency: 'EUR',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to store partner data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Partner membership created:', partnerMembership.id);

    return new Response(
      JSON.stringify({
        paymentUrl: mollieData._links.checkout.href,
        partnerMembershipId: partnerMembership.id
      }),
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