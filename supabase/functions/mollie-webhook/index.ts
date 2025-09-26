import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
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

// Send welcome email with login credentials
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
        html: `
          <!DOCTYPE html>
          <html lang="nl">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Partner Account Update - Bouw met Respect</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                  <!-- Header -->
                  <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                          Partner Account Update
                      </h1>
                      <p style="color: #dbeafe; margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">
                          Bouw met Respect
                      </p>
                  </div>
                  
                  <!-- Main Content -->
                  <div style="padding: 40px 30px;">
                      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                          Hallo ${firstName},
                      </p>
                      
                      <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                          Je bestaande account is gekoppeld aan ons partner systeem! Je wachtwoord is gereset voor veiligheid.
                      </p>
                      
                      <!-- Login Credentials Card -->
                      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 30px 0;">
                          <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
                              Je inloggegevens:
                          </h3>
                          
                          <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; margin: 15px 0; border-left: 4px solid #2563eb;">
                              <div style="margin-bottom: 12px;">
                                  <span style="color: #64748b; font-size: 14px; font-weight: 500; display: block; margin-bottom: 4px;">Email:</span>
                                  <span style="color: #1e293b; font-size: 16px; font-weight: 600; word-break: break-all;">${email}</span>
                              </div>
                              <div style="margin-bottom: 12px;">
                                  <span style="color: #64748b; font-size: 14px; font-weight: 500; display: block; margin-bottom: 4px;">Nieuw Wachtwoord:</span>
                                  <span style="color: #1e293b; font-size: 16px; font-weight: 600; background-color: #f1f5f9; padding: 6px 10px; border-radius: 6px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;">${password}</span>
                              </div>
                              <div>
                                  <span style="color: #64748b; font-size: 14px; font-weight: 500; display: block; margin-bottom: 4px;">Login URL:</span>
                                  <a href="https://bouwmetrespect.nl/partner-auth" style="color: #2563eb; font-size: 16px; font-weight: 500; text-decoration: none; word-break: break-all;">https://bouwmetrespect.nl/partner-auth</a>
                              </div>
                          </div>
                      </div>
                      
                      <!-- Security Warning -->
                      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 25px 0;">
                          <div style="display: flex; align-items: flex-start;">
                              <div style="background-color: #f59e0b; color: #ffffff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 12px; flex-shrink: 0;">!</div>
                              <div>
                                  <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
                                      Belangrijk: Wijzig je wachtwoord na je eerste login voor veiligheid!
                                  </h4>
                              </div>
                          </div>
                      </div>
                      
                      <!-- What you can do section -->
                      <div style="margin: 30px 0;">
                          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                              Je kunt nu inloggen op het partner portaal om:
                          </p>
                          <ul style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
                              <li style="margin-bottom: 8px;">Je bedrijfsprofiel beheren</li>
                              <li style="margin-bottom: 8px;">Toegang krijgen tot partner resources</li>
                              <li style="margin-bottom: 8px;">Contact opnemen met ons team</li>
                          </ul>
                      </div>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 35px 0;">
                          <a href="https://bouwmetrespect.nl/partner-auth" 
                             style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); 
                                    color: #ffffff; 
                                    padding: 14px 28px; 
                                    text-decoration: none; 
                                    border-radius: 8px; 
                                    font-weight: 600; 
                                    font-size: 16px; 
                                    display: inline-block; 
                                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                                    transition: all 0.2s;">
                              Inloggen op Partner Dashboard
                          </a>
                      </div>
                      
                      <!-- Support section -->
                      <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
                          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0;">
                              Heb je vragen? Neem contact met ons op via 
                              <a href="mailto:info@bouwmetrespect.nl" style="color: #2563eb; text-decoration: none; font-weight: 500;">info@bouwmetrespect.nl</a>
                          </p>
                      </div>
                      
                      <!-- Signature -->
                      <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 35px;">
                          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                              Met vriendelijke groet,<br>
                              <span style="font-weight: 600; color: #1e293b;">Het Bouw met Respect team</span>
                          </p>
                      </div>
                  </div>
                  
                  <!-- Footer -->
                  <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #9ca3af; font-size: 12px; line-height: 1.4; margin: 0;">
                          Deze email is verstuurd omdat je account is gekoppeld aan ons partner systeem.<br>
                          © 2024 Bouw met Respect. Alle rechten voorbehouden.
                      </p>
                  </div>
              </div>
          </body>
          </html>
        `,
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
  console.log(`[WEBHOOK] ${req.method} request received from: ${req.headers.get('origin') || 'unknown'}`);
  console.log(`[WEBHOOK] URL: ${req.url}`);
  console.log(`[WEBHOOK] User-Agent: ${req.headers.get('user-agent') || 'unknown'}`);
  
  if (req.method === 'OPTIONS') {
    console.log('[WEBHOOK] Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mollieApiKey = Deno.env.get('MOLLIE_API_KEY');
    if (!mollieApiKey) {
      return new Response('Missing Mollie API key', { headers: corsHeaders, status: 500 });
    }

    let paymentId: string | null = null;
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = await req.formData();
      paymentId = String(form.get('id') || '');
    } else {
      try {
        const json = await req.json();
        paymentId = json?.id || null;
      } catch {
        // ignore
      }
    }

    if (!paymentId) {
      console.error('[WEBHOOK] No payment ID found in request');
      return new Response('No payment id', { headers: corsHeaders, status: 400 });
    }

    console.log(`[WEBHOOK] Processing payment ID: ${paymentId}`);

    const detailsResp = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${mollieApiKey}` }
    });

    if (!detailsResp.ok) {
      return new Response('Failed to fetch payment', { headers: corsHeaders, status: 502 });
    }

    const payment = await detailsResp.json();
    const status = payment.status as string;
    const metadata = payment.metadata || {};
    
    console.log(`[WEBHOOK] Payment details for ${paymentId}:`, {
      status,
      amount: payment.amount,
      description: payment.description,
      metadata
    });
    console.log(`[WEBHOOK] Payment status: ${status}`);
    console.log(`[WEBHOOK] Payment metadata:`, metadata);

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    let newStatus = 'pending';
    if (status === 'paid' || status === 'authorized') newStatus = 'paid';
    else if (status === 'failed') newStatus = 'failed';
    else if (status === 'canceled') newStatus = 'canceled';
    else if (status === 'expired') newStatus = 'expired';
    else newStatus = 'pending';

    // Check if this is a partner membership payment
    if (metadata.type === 'partner_membership') {
      const { error } = await supabaseService
        .from('partner_memberships')
        .update({ 
          payment_status: newStatus,
          // Update discount usage tracking
          ...(newStatus === 'paid' && metadata.discount_code ? {
            discount_code: metadata.discount_code
          } : {})
        })
        .eq('mollie_payment_id', paymentId);

      if (error) {
        return new Response(`Partner DB update error: ${error.message}`, { headers: corsHeaders, status: 500 });
      }

      // If payment is successful, create user account and company profile
      if (newStatus === 'paid') {
        try {
          // Update discount code usage count if discount was applied
          if (metadata.discount_code) {
            console.log(`[WEBHOOK] Updating usage count for discount code: ${metadata.discount_code}`);
            const { error: discountError } = await supabaseService
              .rpc('increment_discount_usage', { code_to_increment: metadata.discount_code });

            if (discountError) {
              console.error('Error updating discount code usage:', discountError);
            } else {
              console.log(`[WEBHOOK] Successfully updated usage count for discount code: ${metadata.discount_code}`);
            }
          }

          // Get partner membership details
          const { data: partnerData, error: partnerError } = await supabaseService
            .from('partner_memberships')
            .select('*')
            .eq('mollie_payment_id', paymentId)
            .single();

          if (partnerError || !partnerData) {
            console.error('Error fetching partner data:', partnerError);
          } else {
            // Generate random password
            const password = generateRandomPassword();
            
            // Create user account
            const { data: authData, error: authError } = await supabaseService.auth.admin.createUser({
              email: partnerData.email,
              password: password,
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
              // Update partner membership with user_id
              await supabaseService
                .from('partner_memberships')
                .update({ user_id: authData.user.id })
                .eq('id', partnerData.id);

              // Create company profile
              const { error: profileError } = await supabaseService
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

              if (profileError) {
                console.error('Error creating company profile:', profileError);
              }

              // Send welcome email with login credentials
              await sendWelcomeEmail(partnerData.email, partnerData.first_name, password, partnerData.company_name);
            }
          }
        } catch (error) {
          console.error('Error in post-payment processing:', error);
        }
      }
    } else {
      // Regular order payment
      const { error } = await supabaseService
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('mollie_payment_id', paymentId);

      if (error) {
        return new Response(`Order DB update error: ${error.message}`, { headers: corsHeaders, status: 500 });
      }

      // If order payment is successful, send confirmation email
      if (newStatus === 'paid') {
        try {
          // Get order details
          const { data: orderData, error: orderError } = await supabaseService
            .from('orders')
            .select('*')
            .eq('mollie_payment_id', paymentId)
            .single();

          if (orderError || !orderData) {
            console.error('Error fetching order data:', orderError);
          } else {
            // Send order confirmation email
            const confirmationData = {
              orderId: orderData.id,
              customerEmail: orderData.customer_email || orderData.email,
              customerName: `${orderData.customer_first_name || ''} ${orderData.customer_last_name || ''}`.trim() || 'Klant',
              orderItems: Array.isArray(orderData.items) ? orderData.items : [],
              subtotal: orderData.subtotal || 0,
              shipping: orderData.shipping || 0,
              total: orderData.total || 0,
              shippingAddress: {
                street: orderData.address_street,
                houseNumber: orderData.address_house_number,
                postcode: orderData.address_postcode,
                city: orderData.address_city,
                country: orderData.address_country || 'Nederland'
              },
              orderDate: new Date(orderData.created_at).toLocaleDateString('nl-NL')
            };

            // Call the order confirmation email function
            const emailResponse = await supabaseService.functions.invoke('send-order-confirmation', {
              body: confirmationData
            });

            if (emailResponse.error) {
              console.error('Error sending order confirmation email:', emailResponse.error);
            } else {
              console.log('Order confirmation email sent successfully:', emailResponse);
              if (emailResponse.data) {
                console.log('Email sent with ID:', emailResponse.data.emailId);
              }
            }
          }
        } catch (error) {
          console.error('Error in order confirmation email process:', error);
        }
      }
    }

    console.log(`[WEBHOOK] Successfully processed payment ${paymentId} with status: ${newStatus}`);
    return new Response('OK', { headers: corsHeaders, status: 200 });
  } catch (e: any) {
    console.error(`[WEBHOOK] Error processing webhook:`, e);
    return new Response(e?.message || 'Webhook error', { headers: corsHeaders, status: 500 });
  }
});


