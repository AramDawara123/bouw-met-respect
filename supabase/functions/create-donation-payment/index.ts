import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, name, email, message } = await req.json();

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount < 5) {
      throw new Error("Minimum donation amount is €5");
    }

    if (!name || !email) {
      throw new Error("Name and email are required");
    }

    console.log("Creating Mollie payment for donation:", {
      amount: numericAmount,
      name,
      email,
    });

    // Create Mollie payment
    const mollieApiKey = Deno.env.get("MOLLIE_API_KEY");
    if (!mollieApiKey) {
      throw new Error("Mollie API key not configured");
    }

    const amountInCents = Math.round(numericAmount * 100);
    const amountInEuros = (amountInCents / 100).toFixed(2);

    const mollieResponse = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mollieApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: {
          currency: "EUR",
          value: amountInEuros,
        },
        description: `Donatie Bouw met Respect - ${name}`,
        redirectUrl: `${req.headers.get("origin")}/donatie?success=true`,
        metadata: {
          type: "donation",
          name,
          email,
          message: message || "",
        },
      }),
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
      console.error("Mollie API error:", errorMsg);
      throw new Error(errorMsg);
    }

    const molliePayment = await mollieResponse.json();
    console.log("Mollie donation payment created:", molliePayment.id);

    // Store donation record in database (optional but useful for dashboard)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { error: insertError } = await supabaseAdmin.from("donations").insert({
      name,
      email,
      amount: amountInCents,
      message: message || null,
      mollie_payment_id: molliePayment.id,
      payment_status: "pending",
      currency: "EUR",
    });

    if (insertError) {
      console.error("Error storing donation:", insertError);
      // Don't fail the payment if storing the record fails
    }

    return new Response(
      JSON.stringify({
        paymentUrl: molliePayment._links.checkout.href,
        paymentId: molliePayment.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Donation payment creation error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
