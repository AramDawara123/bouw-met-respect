import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
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

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe API key not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const amountInCents = Math.round(numericAmount * 100);
    const origin = req.headers.get("origin") || "https://bouw-met-respect.lovable.app";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "ideal"],
      mode: "payment",
      customer_email: email,
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: `Donatie Bouw met Respect - ${name}` },
          unit_amount: amountInCents,
        },
        quantity: 1,
      }],
      metadata: {
        type: "donation",
        name,
        email,
        message: message || "",
      },
      success_url: `${origin}/donatie?success=true`,
      cancel_url: `${origin}/donatie?canceled=true`,
    });

    // Store donation record
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
      mollie_payment_id: session.id, // reuse column for stripe session id
      payment_status: "pending",
      currency: "EUR",
    });

    if (insertError) {
      console.error("Error storing donation:", insertError);
    }

    return new Response(
      JSON.stringify({ paymentUrl: session.url, paymentId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    console.error("Donation payment creation error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
