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

    // Get all products from database
    const { data: products, error: fetchError } = await supabaseService
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) throw new Error(`Database error: ${fetchError.message}`);
    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No products to sync', synced: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: any[] = [];

    for (const product of products) {
      try {
        const priceInCents = Math.round(product.price * 100);
        let stripeProductId = product.stripe_product_id;
        let stripePriceId = product.stripe_price_id;

        if (stripeProductId) {
          // Update existing Stripe product
          await stripe.products.update(stripeProductId, {
            name: product.name,
            description: product.description || undefined,
            active: product.in_stock !== false,
            ...(product.image_url ? { images: [product.image_url] } : {}),
            metadata: {
              supabase_id: product.id,
              category: product.category || '',
            },
          });

          // Check if price changed - if so, create new price and archive old one
          if (stripePriceId) {
            const existingPrice = await stripe.prices.retrieve(stripePriceId);
            if (existingPrice.unit_amount !== priceInCents) {
              // Archive old price
              await stripe.prices.update(stripePriceId, { active: false });
              // Create new price
              const newPrice = await stripe.prices.create({
                product: stripeProductId,
                unit_amount: priceInCents,
                currency: 'eur',
              });
              stripePriceId = newPrice.id;
            }
          } else {
            // Create price for existing product
            const newPrice = await stripe.prices.create({
              product: stripeProductId,
              unit_amount: priceInCents,
              currency: 'eur',
            });
            stripePriceId = newPrice.id;
          }
        } else {
          // Create new Stripe product
          const stripeProduct = await stripe.products.create({
            name: product.name,
            description: product.description || undefined,
            active: product.in_stock !== false,
            ...(product.image_url ? { images: [product.image_url] } : {}),
            metadata: {
              supabase_id: product.id,
              category: product.category || '',
            },
            default_price_data: {
              currency: 'eur',
              unit_amount: priceInCents,
            },
          });

          stripeProductId = stripeProduct.id;
          stripePriceId = typeof stripeProduct.default_price === 'string'
            ? stripeProduct.default_price
            : stripeProduct.default_price?.id || null;
        }

        // Update database with Stripe IDs
        const { error: updateError } = await supabaseService
          .from('products')
          .update({
            stripe_product_id: stripeProductId,
            stripe_price_id: stripePriceId,
          })
          .eq('id', product.id);

        if (updateError) {
          console.error(`Failed to update product ${product.id}:`, updateError);
        }

        results.push({
          name: product.name,
          status: 'synced',
          stripe_product_id: stripeProductId,
          stripe_price_id: stripePriceId,
        });
      } catch (productError: any) {
        console.error(`Error syncing product ${product.name}:`, productError);
        results.push({
          name: product.name,
          status: 'error',
          error: productError.message,
        });
      }
    }

    const synced = results.filter(r => r.status === 'synced').length;
    const failed = results.filter(r => r.status === 'error').length;

    return new Response(
      JSON.stringify({ message: `Synced ${synced} products, ${failed} failed`, synced, failed, results }),
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
