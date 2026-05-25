import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import {
  generateDigitalDownloadLinks,
  sendDigitalProductEmails,
} from "../_shared/digital-downloads.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, orderId } = await req.json();
    if (!sessionId && !orderId) {
      throw new Error("sessionId of orderId is verplicht");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    let query = supabase.from("orders").select("*");
    if (sessionId) {
      query = query.eq("mollie_payment_id", sessionId);
    } else {
      query = query.eq("id", orderId);
    }

    const { data: orderData, error: orderError } = await query.maybeSingle();
    if (orderError || !orderData) {
      return new Response(
        JSON.stringify({ error: "Bestelling niet gevonden", downloads: [] }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeSessionId = orderData.mollie_payment_id as string;

    // Sync payment status from Stripe if still pending
    if (orderData.payment_status !== "paid" && stripeSessionId?.startsWith("cs_")) {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (stripeKey) {
        const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
        const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
        if (session.payment_status === "paid") {
          await supabase
            .from("orders")
            .update({ payment_status: "paid" })
            .eq("id", orderData.id);
          orderData.payment_status = "paid";
        }
      }
    }

    if (orderData.payment_status !== "paid") {
      return new Response(
        JSON.stringify({
          error: "Betaling nog niet voltooid",
          paymentStatus: orderData.payment_status,
          downloads: [],
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resolvedOrderId = stripeSessionId || orderData.id;
    const customerEmail = orderData.customer_email || "";
    const customerName =
      `${orderData.customer_first_name || ""} ${orderData.customer_last_name || ""}`.trim() || "Klant";
    const orderDate = new Date(orderData.created_at).toLocaleDateString("nl-NL");
    const orderItems: Array<{ id?: string; name: string; quantity: number; price: number }> =
      Array.isArray(orderData.items) ? orderData.items : [];

    // Reuse existing tokens if already created
    const { data: existingTokens } = await supabase
      .from("download_tokens")
      .select("token, product_name, expires_at")
      .eq("order_id", resolvedOrderId);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    let downloadLinks: Array<{ productName: string; url: string; expiresAt: string }> = [];

    if (existingTokens && existingTokens.length > 0) {
      downloadLinks = existingTokens.map((t) => ({
        productName: t.product_name,
        url: `${supabaseUrl}/functions/v1/download-pdf?token=${t.token}`,
        expiresAt: new Date(t.expires_at).toLocaleDateString("nl-NL"),
      }));
    } else {
      downloadLinks = await generateDigitalDownloadLinks(
        supabase,
        orderItems,
        resolvedOrderId,
        customerEmail
      );
    }

    // Send emails only when we just created new tokens
    if (downloadLinks.length > 0 && (!existingTokens || existingTokens.length === 0)) {
      await sendDigitalProductEmails(supabase, {
        customerEmail,
        customerName,
        orderId: resolvedOrderId,
        orderDate,
        total: orderData.total || 0,
        downloadLinks,
      });

      await supabase.functions.invoke("send-order-confirmation", {
        body: {
          orderId: resolvedOrderId,
          customerEmail,
          customerName,
          orderItems: orderItems.map((item) => ({
            name: item.name,
            quantity: item.quantity || 1,
            price: item.price,
          })),
          subtotal: orderData.subtotal || 0,
          shipping: orderData.shipping || 0,
          total: orderData.total || 0,
          shippingAddress: downloadLinks.length > 0 ? {} : {
            street: orderData.customer_address,
            postcode: orderData.customer_postal_code,
            city: orderData.customer_city,
            country: "Nederland",
          },
          orderDate,
          downloadLinks,
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        downloads: downloadLinks.map((dl) => ({
          productName: dl.productName,
          url: dl.url,
        })),
        customerEmail,
        customerName,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("[fulfill-digital-order]", e);
    return new Response(
      JSON.stringify({ error: e.message, downloads: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
