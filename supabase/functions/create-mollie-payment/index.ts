import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the user (optional for guest payments)
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

    // Default prices based on membership type
    let defaultAmount;
    switch(membershipType) {
      case 'klein':
        defaultAmount = 25000; // €250.00
        break;
      case 'middelgroot':
        defaultAmount = 75000; // €750.00
        break;
      case 'groot':
        defaultAmount = 125000; // €1250.00
        break;
      default:
        defaultAmount = 25000; // €250.00
    }

    const membershipAmount = amount || defaultAmount;
    const amountInEuros = (membershipAmount / 100).toFixed(2);

    console.log('Creating Mollie payment for membership:', { membershipData, membershipType, amount: membershipAmount });

    // Create Mollie payment
    const mollieApiKey = Deno.env.get('MOLLIE_API_KEY');
    if (!mollieApiKey) {
      throw new Error('Mollie API key not configured');
    }

    // Create the payment with Mollie
    const mollieResponse = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mollieApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: {
          currency: 'EUR',
          value: amountInEuros
        },
        description: `Bouw met Respect ${membershipType.charAt(0).toUpperCase() + membershipType.slice(1)} Lidmaatschap`,
        redirectUrl: `${req.headers.get('origin')}/membership-success`,
        metadata: {
          membershipData: JSON.stringify(membershipData),
          membershipType: membershipType,
          userId: user?.id || null
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
      console.error('Mollie API error:', errorMsg);
      throw new Error(errorMsg);
    }

    const molliePayment = await mollieResponse.json();
    console.log('Mollie payment created:', molliePayment.id);

    // Store membership application in database using service role key
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
        mollie_payment_id: molliePayment.id,
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

    console.log('Membership application stored:', membership.id);

    return new Response(
      JSON.stringify({ 
        paymentUrl: molliePayment._links.checkout.href,
        membershipId: membership.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Payment creation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});