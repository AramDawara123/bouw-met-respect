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
    const { amount, name, email, message } = await req.json();

    if (!amount || amount < 5) {
      throw new Error('Minimum donation amount is €5');
    }

    if (!name || !email) {
      throw new Error('Name and email are required');
    }

    console.log('Creating Mollie payment for donation:', { amount, name, email });

    // Create Mollie payment
    const mollieApiKey = Deno.env.get('MOLLIE_API_KEY');
    if (!mollieApiKey) {
      throw new Error('Mollie API key not configured');
    }

    const amountInEuros = amount.toFixed(2);

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
        description: `Donatie Bouw met Respect - ${name}`,
        redirectUrl: `${req.headers.get('origin')}/donatie?success=true`,
        metadata: {
          type: 'donation',
          name,
          email,
          message: message || ''
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
    console.log('Mollie donation payment created:', molliePayment.id);

    return new Response(
      JSON.stringify({ 
        paymentUrl: molliePayment._links.checkout.href,
        paymentId: molliePayment.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Donation payment creation error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
