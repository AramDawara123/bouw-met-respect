import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 create-partner-payment function called');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📋 Starting partner payment creation process');
    
    const mollieApiKey = Deno.env.get('MOLLIE_API_KEY');
    if (!mollieApiKey) {
      console.error('❌ Missing Mollie API key');
      return new Response(
        JSON.stringify({ error: 'Missing Mollie API key' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('🔍 Checking Supabase configuration');
    console.log('Supabase URL:', supabaseUrl ? 'Present' : 'Missing');
    console.log('Service Key:', supabaseServiceKey ? 'Present' : 'Missing');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('🔧 Creating Supabase service client');
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { 
        persistSession: false,
        autoRefreshToken: false
      },
      db: { schema: 'public' }
    });

    const { partnerData, amount, discountCode, discountAmount } = await req.json();
    
    // Default amount if not provided (fallback to ZZP price)
    const partnerAmount = amount || 25000;
    const finalDiscountAmount = discountAmount || 0;

    console.log('Creating partner payment for:', partnerData);
    console.log('Amount:', partnerAmount, 'Discount:', finalDiscountAmount, 'Final:', partnerAmount);
    if (discountCode) {
      console.log('Discount code applied:', discountCode);
    }

    // Create payment with Mollie
    const molliePayload = {
      amount: { currency: 'EUR', value: (partnerAmount / 100).toFixed(2) },
      description: `Partner lidmaatschap - ${partnerData.company_name}${discountCode ? ` (Code: ${discountCode})` : ''}`,
      redirectUrl: `${req.headers.get('origin')}/partnership-success`,
      webhookUrl: `${supabaseUrl}/functions/v1/mollie-webhook`,
      metadata: {
        type: 'partner_membership',
        company_name: partnerData.company_name,
        email: partnerData.email,
        company_size: partnerData.company_size || 'zzp',
        ...(discountCode && { discount_code: discountCode, discount_amount: finalDiscountAmount })
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
      console.error('Mollie Response Status:', mollieResponse.status);
      console.error('Mollie Response Headers:', Object.fromEntries(mollieResponse.headers.entries()));
      
      // Parse the error response if possible
      let errorMessage = 'Payment creation failed';
      try {
        const errorData = JSON.parse(mollieError);
        if (errorData.detail) {
          errorMessage = `Mollie API: ${errorData.detail}`;
        }
        if (mollieResponse.status === 401) {
          errorMessage = 'Mollie API key authentication failed. Please check your API key configuration.';
        }
      } catch (e) {
        console.error('Could not parse Mollie error response');
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const mollieData = await mollieResponse.json();
    console.log('Mollie payment created:', mollieData.id);

    // Store partner membership data in database
    const insertData = {
      user_id: null, // Explicitly set to null for anonymous signups
      first_name: partnerData.first_name,
      last_name: partnerData.last_name,
      email: partnerData.email,
      phone: partnerData.phone,
      company_name: partnerData.company_name,
      website: partnerData.website,
      industry: partnerData.industry,
      description: partnerData.description,
      mollie_payment_id: mollieData.id,
      amount: partnerAmount,
      currency: 'EUR',
      payment_status: 'pending'
    };

    console.log('Attempting to insert partner membership with data:', insertData);

    // If discount was applied, track it in metadata or description
    let finalDescription = partnerData.description || '';
    if (discountCode && finalDiscountAmount > 0) {
      finalDescription += `\n\nKortingscode toegepast: ${discountCode} (€${(finalDiscountAmount / 100).toFixed(2)} korting)`;
      insertData.description = finalDescription;
    }

    const { data: partnerMembership, error } = await supabaseService
      .from('partner_memberships')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Database error details:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      return new Response(
        JSON.stringify({ error: `Failed to store partner data: ${error.message}` }),
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