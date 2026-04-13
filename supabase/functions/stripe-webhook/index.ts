import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Generate random password
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function sendWelcomeEmail(email: string, firstName: string, password: string, companyName: string) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bouw met Respect <noreply@bouwmetrespect.nl>',
        to: [email],
        subject: 'Welkom bij Bouw met Respect - Je partner account is klaar!',
        html: `<h1>Welkom als Partner, ${firstName}!</h1>
        <p>Je partner account voor <strong>${companyName}</strong> is succesvol aangemaakt.</p>
        <p><strong>E-mailadres:</strong> ${email}</p>
        <p><strong>Tijdelijk Wachtwoord:</strong> ${password}</p>
        <p>Wijzig dit wachtwoord direct na je eerste login.</p>
        <p><a href="https://bouwmetrespect.nl/partner-auth">Start je Partner Journey</a></p>
        <p>Met vriendelijke groet,<br>Het Bouw met Respect Team</p>`,
      }),
    });
    if (!response.ok) {
      console.error('Failed to send welcome email:', await response.text());
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response('Missing Stripe API key', { headers: corsHeaders, status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // For webhook verification, we need the raw body and signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
      }
    } else {
      // Fallback: parse without verification (for testing)
      event = JSON.parse(body) as Stripe.Event;
      console.warn('Processing webhook without signature verification');
    }

    console.log(`[STRIPE WEBHOOK] Event type: ${event.type}`);

    if (event.type !== 'checkout.session.completed') {
      return new Response('OK', { headers: corsHeaders, status: 200 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};
    const sessionId = session.id;

    console.log(`[STRIPE WEBHOOK] Session ${sessionId}, type: ${metadata.type}`);

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    if (metadata.type === 'donation') {
      const { error } = await supabaseService
        .from('donations')
        .update({ payment_status: 'paid' })
        .eq('mollie_payment_id', sessionId);

      if (error) console.error('Donation update error:', error);
      else console.log('Donation marked as paid');

    } else if (metadata.type === 'membership') {
      const { error } = await supabaseService
        .from('memberships')
        .update({ payment_status: 'paid' })
        .eq('mollie_payment_id', sessionId);

      if (error) console.error('Membership update error:', error);
      else console.log('Membership marked as paid');

    } else if (metadata.type === 'partner_membership') {
      // Update partner membership status
      const { error } = await supabaseService
        .from('partner_memberships')
        .update({
          payment_status: 'paid',
          ...(metadata.discount_code ? { discount_code: metadata.discount_code } : {})
        })
        .eq('mollie_payment_id', sessionId);

      if (error) {
        console.error('Partner membership update error:', error);
      } else {
        // Update discount usage if applicable
        if (metadata.discount_code) {
          try {
            await supabaseService.rpc('increment_discount_usage', { code_to_increment: metadata.discount_code });
          } catch (e) { console.error('Discount increment error:', e); }
        }

        // Create user account and company profile
        try {
          const { data: partnerData, error: partnerError } = await supabaseService
            .from('partner_memberships')
            .select('*')
            .eq('mollie_payment_id', sessionId)
            .single();

          if (partnerError || !partnerData) {
            console.error('Error fetching partner data:', partnerError);
          } else {
            const password = generateRandomPassword();

            const { data: authData, error: authError } = await supabaseService.auth.admin.createUser({
              email: partnerData.email,
              password,
              email_confirm: true,
              user_metadata: {
                first_name: partnerData.first_name,
                last_name: partnerData.last_name,
                company_name: partnerData.company_name
              }
            });

            if (authError) {
              console.error('Error creating user:', authError);
            } else if (authData.user) {
              await supabaseService
                .from('partner_memberships')
                .update({ user_id: authData.user.id })
                .eq('id', partnerData.id);

              await supabaseService
                .from('company_profiles')
                .insert({
                  name: partnerData.company_name,
                  description: partnerData.description || `Welkom bij ${partnerData.company_name}`,
                  website: partnerData.website,
                  industry: partnerData.industry,
                  contact_email: partnerData.email,
                  contact_phone: partnerData.phone,
                  partner_membership_id: partnerData.id,
                  is_featured: false,
                  display_order: 999
                });

              await sendWelcomeEmail(partnerData.email, partnerData.first_name, password, partnerData.company_name);
            }
          }
        } catch (error) {
          console.error('Error in partner post-payment processing:', error);
        }
      }

    } else if (metadata.type === 'order') {
      // Update order status
      const { error } = await supabaseService
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('mollie_payment_id', sessionId);

      if (error) {
        console.error('Order update error:', error);
      } else {
        // Send order confirmation email
        try {
          const { data: orderData } = await supabaseService
            .from('orders')
            .select('*')
            .eq('mollie_payment_id', sessionId)
            .single();

          if (orderData) {
            await supabaseService.functions.invoke('send-order-confirmation', {
              body: {
                orderId: orderData.mollie_payment_id || orderData.id,
                customerEmail: orderData.customer_email,
                customerName: `${orderData.customer_first_name || ''} ${orderData.customer_last_name || ''}`.trim() || 'Klant',
                orderItems: Array.isArray(orderData.items) ? orderData.items : [],
                subtotal: orderData.subtotal || 0,
                shipping: orderData.shipping || 0,
                total: orderData.total || 0,
                shippingAddress: {
                  street: orderData.customer_address,
                  postcode: orderData.customer_postal_code,
                  city: orderData.customer_city,
                  country: 'Nederland'
                },
                orderDate: new Date(orderData.created_at).toLocaleDateString('nl-NL')
              }
            });
          }
        } catch (error) {
          console.error('Error sending order confirmation:', error);
        }
      }
    }

    return new Response('OK', { headers: corsHeaders, status: 200 });
  } catch (e: any) {
    console.error('[STRIPE WEBHOOK] Error:', e);
    return new Response(e?.message || 'Webhook error', { headers: corsHeaders, status: 500 });
  }
});
