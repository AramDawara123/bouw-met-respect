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
              <title>Je Partner Account is Klaar! - Bouw met Respect</title>
              <style>
                  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                  * { margin: 0; padding: 0; box-sizing: border-box; }
                  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
              </style>
          </head>
          <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Inter', sans-serif; line-height: 1.6;">
              <div style="max-width: 650px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                  
                  <!-- Modern Header with Geometric Pattern -->
                  <div style="position: relative; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 60px 40px; text-align: center; overflow: hidden;">
                      <!-- Geometric Background Pattern -->
                      <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background-image: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);"></div>
                      
                      <div style="position: relative; z-index: 2;">
                          <!-- Modern Icon -->
                          <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3);">
                              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                  <circle cx="9" cy="7" r="4"/>
                                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                              </svg>
                          </div>
                          
                          <h1 style="color: #ffffff; margin: 0 0 12px; font-size: 32px; font-weight: 700; letter-spacing: -0.025em;">
                              Welkom als Partner! 🎉
                          </h1>
                          <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 18px; font-weight: 500;">
                              Bouw met Respect
                          </p>
                      </div>
                  </div>
                  
                  <!-- Main Content with Modern Spacing -->
                  <div style="padding: 50px 40px;">
                      
                      <!-- Personal Greeting -->
                      <div style="text-align: center; margin-bottom: 40px;">
                          <h2 style="color: #1f2937; font-size: 24px; font-weight: 600; margin: 0 0 12px;">
                              Hallo ${firstName}! 👋
                          </h2>
                          <p style="color: #6b7280; font-size: 17px; line-height: 1.7; max-width: 480px; margin: 0 auto;">
                              Je partner account is succesvol aangemaakt! Voor je veiligheid hebben we een nieuw wachtwoord gegenereerd.
                          </p>
                      </div>
                      
                      <!-- Modern Credentials Card -->
                      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px solid #e2e8f0; border-radius: 20px; padding: 32px; margin: 40px 0; position: relative; overflow: hidden;">
                          <!-- Decorative Element -->
                          <div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 50%; opacity: 0.1;"></div>
                          
                          <div style="position: relative; z-index: 2;">
                              <div style="display: flex; align-items: center; margin-bottom: 24px;">
                                  <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                          <circle cx="12" cy="16" r="1"/>
                                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                      </svg>
                                  </div>
                                  <h3 style="color: #1e293b; margin: 0; font-size: 20px; font-weight: 600;">
                                      Je Inloggegevens
                                  </h3>
                              </div>
                              
                              <!-- Email Field -->
                              <div style="background: #ffffff; border-radius: 16px; padding: 24px; margin: 20px 0; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                  <label style="color: #6b7280; font-size: 14px; font-weight: 500; display: block; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">E-mailadres</label>
                                  <div style="color: #1f2937; font-size: 16px; font-weight: 600; padding: 12px 16px; background: #f9fafb; border-radius: 12px; border: 2px solid #e5e7eb; word-break: break-all;">${email}</div>
                              </div>
                              
                              <!-- Password Field -->
                              <div style="background: #ffffff; border-radius: 16px; padding: 24px; margin: 20px 0; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                  <label style="color: #6b7280; font-size: 14px; font-weight: 500; display: block; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Tijdelijk Wachtwoord</label>
                                  <div style="color: #1f2937; font-size: 18px; font-weight: 700; padding: 16px 20px; background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; border: 2px solid #f59e0b; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; text-align: center; letter-spacing: 2px;">${password}</div>
                              </div>
                          </div>
                      </div>
                      
                      <!-- Modern Security Alert -->
                      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 16px; padding: 24px; margin: 32px 0; position: relative; overflow: hidden;">
                          <div style="position: absolute; top: -10px; left: -10px; width: 40px; height: 40px; background: #f59e0b; border-radius: 50%; opacity: 0.2;"></div>
                          <div style="display: flex; align-items: flex-start; position: relative; z-index: 2;">
                              <div style="background: #f59e0b; color: #ffffff; border-radius: 12px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; margin-right: 16px; flex-shrink: 0;">⚠️</div>
                              <div>
                                  <h4 style="color: #92400e; margin: 0 0 8px; font-size: 16px; font-weight: 600;">
                                      Belangrijk voor je veiligheid
                                  </h4>
                                  <p style="color: #b45309; margin: 0; font-size: 14px; line-height: 1.5;">
                                      Wijzig dit wachtwoord direct na je eerste login voor optimale beveiliging van je account.
                                  </p>
                              </div>
                          </div>
                      </div>
                      
                      <!-- Features Section -->
                      <div style="margin: 40px 0;">
                          <h3 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 20px; text-align: center;">
                              Wat kun je nu doen? ✨
                          </h3>
                          <div style="display: grid; gap: 16px;">
                              <div style="display: flex; align-items: center; padding: 16px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #6366f1;">
                                  <span style="font-size: 24px; margin-right: 16px;">🏢</span>
                                  <span style="color: #374151; font-size: 15px; font-weight: 500;">Je bedrijfsprofiel volledig personaliseren</span>
                              </div>
                              <div style="display: flex; align-items: center; padding: 16px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #8b5cf6;">
                                  <span style="font-size: 24px; margin-right: 16px;">📚</span>
                                  <span style="color: #374151; font-size: 15px; font-weight: 500;">Exclusieve partner resources bekijken</span>
                              </div>
                              <div style="display: flex; align-items: center; padding: 16px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #a855f7;">
                                  <span style="font-size: 24px; margin-right: 16px;">💬</span>
                                  <span style="color: #374151; font-size: 15px; font-weight: 500;">Direct contact met ons partner team</span>
                              </div>
                          </div>
                      </div>
                      
                      <!-- Modern CTA Button -->
                      <div style="text-align: center; margin: 48px 0;">
                          <a href="https://bouwmetrespect.nl/partner-auth" 
                             style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); 
                                    color: #ffffff; 
                                    padding: 18px 36px; 
                                    text-decoration: none; 
                                    border-radius: 16px; 
                                    font-weight: 600; 
                                    font-size: 16px; 
                                    display: inline-block; 
                                    box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
                                    transition: all 0.3s ease;
                                    letter-spacing: 0.5px;">
                              🚀 Start je Partner Journey
                          </a>
                      </div>
                      
                      <!-- Modern Support Section -->
                      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0ea5e9; border-radius: 20px; padding: 28px; margin: 40px 0; text-align: center;">
                          <div style="margin-bottom: 16px;">
                              <span style="font-size: 32px;">🤝</span>
                          </div>
                          <h4 style="color: #0c4a6e; margin: 0 0 12px; font-size: 18px; font-weight: 600;">
                              Hulp nodig?
                          </h4>
                          <p style="color: #0369a1; margin: 0; font-size: 15px; line-height: 1.6;">
                              Ons partner team staat klaar om je te helpen! Neem gerust contact op via<br>
                              <a href="mailto:info@bouwmetrespect.nl" style="color: #0284c7; text-decoration: none; font-weight: 600;">info@bouwmetrespect.nl</a>
                          </p>
                      </div>
                      
                      <!-- Modern Signature -->
                      <div style="text-align: center; border-top: 2px solid #f3f4f6; padding-top: 32px; margin-top: 48px;">
                          <p style="color: #6b7280; font-size: 16px; line-height: 1.8; margin: 0;">
                              Met veel enthousiasme,<br>
                              <span style="font-weight: 700; color: #1f2937; font-size: 18px; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Het Bouw met Respect Team</span>
                          </p>
                      </div>
                  </div>
                  
                  <!-- Modern Footer -->
                  <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 32px; text-align: center; border-top: 2px solid #e5e7eb;">
                      <div style="margin-bottom: 16px;">
                          <span style="font-size: 24px;">🏗️</span>
                      </div>
                      <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0; max-width: 400px; margin: 0 auto;">
                          Deze email is automatisch verzonden omdat je partner account is geactiveerd.<br>
                          <span style="font-weight: 600; color: #6b7280;">© 2024 Bouw met Respect</span> - Samen bouwen aan respect
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
              orderId: orderData.mollie_payment_id || orderData.id,
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


