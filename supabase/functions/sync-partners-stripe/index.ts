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
    if (!stripeKey) throw new Error('Stripe API key not configured');

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { data: tiers, error: fetchError } = await supabaseService
      .from('partner_pricing_tiers')
      .select('*')
      .eq('is_quote', false)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (fetchError) throw new Error(`Database error: ${fetchError.message}`);
    if (!tiers || tiers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No partner tiers to sync', synced: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: any[] = [];

    for (const tier of tiers) {
      try {
        let stripeProductId = tier.stripe_product_id;
        let stripePriceId = tier.stripe_price_id;
        const tierName = `Bouw met Respect - Partner ${tier.employee_range}`;

        if (stripeProductId) {
          await stripe.products.update(stripeProductId, {
            name: tierName,
            description: `Partner lidmaatschap voor ${tier.employee_range}`,
            metadata: { supabase_id: tier.id, employee_range: tier.employee_range },
          });

          if (stripePriceId) {
            const existingPrice = await stripe.prices.retrieve(stripePriceId);
            if (existingPrice.unit_amount !== tier.price_cents) {
              await stripe.prices.update(stripePriceId, { active: false });
              const newPrice = await stripe.prices.create({
                product: stripeProductId,
                unit_amount: tier.price_cents,
                currency: 'eur',
                recurring: { interval: 'year' },
              });
              stripePriceId = newPrice.id;
            }
          } else {
            const newPrice = await stripe.prices.create({
              product: stripeProductId,
              unit_amount: tier.price_cents,
              currency: 'eur',
              recurring: { interval: 'year' },
            });
            stripePriceId = newPrice.id;
          }
        } else {
          const stripeProduct = await stripe.products.create({
            name: tierName,
            description: `Partner lidmaatschap voor ${tier.employee_range}`,
            metadata: { supabase_id: tier.id, employee_range: tier.employee_range },
          });

          stripeProductId = stripeProduct.id;

          const price = await stripe.prices.create({
            product: stripeProductId,
            unit_amount: tier.price_cents,
            currency: 'eur',
            recurring: { interval: 'year' },
          });

          stripePriceId = price.id;
        }

        await supabaseService
          .from('partner_pricing_tiers')
          .update({ stripe_product_id: stripeProductId, stripe_price_id: stripePriceId })
          .eq('id', tier.id);

        results.push({
          name: tier.employee_range,
          price: tier.price_display,
          status: 'synced',
          stripe_product_id: stripeProductId,
          stripe_price_id: stripePriceId,
        });
      } catch (err: any) {
        console.error(`Error syncing tier ${tier.employee_range}:`, err);
        results.push({ name: tier.employee_range, status: 'error', error: err.message });
      }
    }

    const synced = results.filter(r => r.status === 'synced').length;
    return new Response(
      JSON.stringify({ message: `Synced ${synced} partner tiers`, synced, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
