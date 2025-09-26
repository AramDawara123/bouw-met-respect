import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    street?: string;
    houseNumber?: string;
    postcode?: string;
    city?: string;
    country?: string;
  };
  orderDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderConfirmationRequest = await req.json();

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Bestelbevestiging - Bouw met Respect</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
        
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              
              <!-- Main Container -->
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: #1f2937; font-size: 32px; font-weight: 700; margin: 0 0 10px 0; text-shadow: none; background-color: rgba(255,255,255,0.9); padding: 8px 16px; border-radius: 8px; display: inline-block;">Bouw met Respect</h1>
                    <div style="background-color: #10b981; color: #ffffff; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block;">
                      ✅ Bestelling Bevestigd
                    </div>
                  </td>
                </tr>
                
                <!-- Welcome Section -->
                <tr>
                  <td style="padding: 30px;">
                    <h2 style="color: #1f2937; font-size: 28px; font-weight: 700; margin: 0 0 16px 0;">Bedankt voor je bestelling!</h2>
                    <p style="font-size: 16px; color: #6b7280; margin: 0 0 16px 0; line-height: 1.6;">Beste <strong style="color: #1f2937;">${orderData.customerName}</strong>,</p>
                    <p style="font-size: 16px; color: #6b7280; margin: 0; line-height: 1.6;">We hebben je bestelling succesvol ontvangen en verwerkt. Hieronder vind je een gedetailleerd overzicht van je bestelling.</p>
                  </td>
                </tr>
                
                <!-- Order Details -->
                <tr>
                  <td style="padding: 0 30px 20px 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb;">
                      <tr>
                        <td style="padding: 20px;">
                          <h3 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px 0;">📋 Bestelgegevens</h3>
                          
                          <table width="100%" cellpadding="8" cellspacing="0" border="0">
                            <tr>
                              <td style="font-weight: 600; color: #374151; padding: 8px 0;">Bestelnummer:</td>
                              <td style="color: #1f2937; font-family: 'Courier New', monospace; background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; text-align: right;">#${orderData.orderId.slice(-8)}</td>
                            </tr>
                            <tr style="border-top: 1px solid #e5e7eb;">
                              <td style="font-weight: 600; color: #374151; padding: 8px 0;">Besteldatum:</td>
                              <td style="color: #1f2937; text-align: right; padding: 8px 0;">${orderData.orderDate}</td>
                            </tr>
                            <tr style="border-top: 1px solid #e5e7eb;">
                              <td style="font-weight: 600; color: #374151; padding: 8px 0;">Email:</td>
                              <td style="color: #1f2937; text-align: right; padding: 8px 0;">${orderData.customerEmail}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                ${orderData.shippingAddress.street ? `
                <!-- Shipping Address -->
                <tr>
                  <td style="padding: 0 30px 20px 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ecfdf5; border-radius: 8px; border: 1px solid #a7f3d0;">
                      <tr>
                        <td style="padding: 20px;">
                          <h3 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px 0;">🚚 Verzendadres</h3>
                          <p style="margin: 0 0 8px 0; font-weight: 600; color: #1f2937; font-size: 16px;">${orderData.customerName}</p>
                          <p style="margin: 0 0 4px 0; color: #047857;">${orderData.shippingAddress.street} ${orderData.shippingAddress.houseNumber || ''}</p>
                          <p style="margin: 0 0 4px 0; color: #047857;">${orderData.shippingAddress.postcode || ''} ${orderData.shippingAddress.city || ''}</p>
                          <p style="margin: 0; color: #047857; font-weight: 500;">${orderData.shippingAddress.country || 'Nederland'}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ''}

                <!-- Products Table -->
                <tr>
                  <td style="padding: 0 30px 20px 30px;">
                    <h3 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px 0;">🛒 Bestelde producten</h3>
                    
                    <table width="100%" cellpadding="12" cellspacing="0" border="0" style="border: 1px solid #e5e7eb; border-radius: 8px;">
                      <tr style="background-color: #f8fafc;">
                        <th style="text-align: left; font-weight: 600; color: #374151; padding: 16px 12px; border-bottom: 1px solid #e5e7eb;">Product</th>
                        <th style="text-align: center; font-weight: 600; color: #374151; padding: 16px 12px; border-bottom: 1px solid #e5e7eb;">Aantal</th>
                        <th style="text-align: right; font-weight: 600; color: #374151; padding: 16px 12px; border-bottom: 1px solid #e5e7eb;">Prijs</th>
                        <th style="text-align: right; font-weight: 600; color: #374151; padding: 16px 12px; border-bottom: 1px solid #e5e7eb;">Totaal</th>
                      </tr>
                      ${orderData.orderItems.map((item, index) => `
                        <tr style="${index % 2 === 0 ? 'background-color: #fafafa;' : ''} border-bottom: 1px solid #f3f4f6;">
                          <td style="padding: 16px 12px; color: #1f2937; font-weight: 500;">${item.name}</td>
                          <td style="padding: 16px 12px; text-align: center; color: #6b7280; font-weight: 600;">${item.quantity}</td>
                          <td style="padding: 16px 12px; text-align: right; color: #6b7280;">€${(item.price / 100).toFixed(2)}</td>
                          <td style="padding: 16px 12px; text-align: right; color: #1f2937; font-weight: 600;">€${((item.price * item.quantity) / 100).toFixed(2)}</td>
                        </tr>
                      `).join('')}
                    </table>
                  </td>
                </tr>

                <!-- Total Summary -->
                <tr>
                  <td style="padding: 0 30px 20px 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
                      <tr>
                        <td style="padding: 24px;">
                          <h3 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px 0; background-color: rgba(255,255,255,0.9); padding: 8px 12px; border-radius: 6px; display: inline-block;">💰 Besteloverzicht</h3>
                          
                          <table width="100%" cellpadding="8" cellspacing="0" border="0" style="background-color: rgba(255,255,255,0.95); border-radius: 6px;">
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                              <td style="font-weight: 500; color: #374151; padding: 12px;">Subtotaal:</td>
                              <td style="font-weight: 600; text-align: right; color: #1f2937; padding: 12px;">€${(orderData.subtotal / 100).toFixed(2)}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                              <td style="font-weight: 500; color: #374151; padding: 12px;">Verzendkosten:</td>
                              <td style="font-weight: 600; text-align: right; color: #1f2937; padding: 12px;">€${(orderData.shipping / 100).toFixed(2)}</td>
                            </tr>
                            <tr style="border-top: 2px solid #667eea;">
                              <td style="font-size: 20px; font-weight: 700; color: #1f2937; padding: 16px 12px 12px 12px;">Totaal:</td>
                              <td style="font-size: 24px; font-weight: 700; text-align: right; color: #667eea; padding: 16px 12px 12px 12px;">€${(orderData.total / 100).toFixed(2)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Status Update -->
                <tr>
                  <td style="padding: 0 30px 20px 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ecfdf5; border-radius: 8px; border: 1px solid #a7f3d0;">
                      <tr>
                        <td style="padding: 24px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="60" style="vertical-align: top;">
                                <div style="width: 48px; height: 48px; background-color: #10b981; border-radius: 50%; text-align: center; line-height: 48px; font-size: 24px;">🚀</div>
                              </td>
                              <td style="vertical-align: top; padding-left: 16px;">
                                <h3 style="color: #065f46; font-size: 20px; font-weight: 600; margin: 0 0 12px 0;">Wat gebeurt er nu?</h3>
                                <p style="color: #047857; margin: 0 0 12px 0; font-size: 16px; line-height: 1.6;">Je bestelling wordt binnen 24 uur verwerkt en zo snel mogelijk verzonden.</p>
                                <p style="color: #047857; margin: 0; font-size: 16px; line-height: 1.6;">Je ontvangt binnenkort een email met track & trace informatie zodat je je bestelling kunt volgen.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">Vragen over je bestelling?</h3>
                    <p style="color: #6b7280; margin: 0 0 16px 0;">We helpen je graag verder!</p>
                    
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
                          <a href="mailto:info@bouwmetrespect.nl" style="color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: 600; display: block;">
                            📧 info@bouwmetrespect.nl
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #9ca3af; font-size: 14px; margin: 24px 0 8px 0;">
                      Met vriendelijke groet,
                    </p>
                    <p style="color: #1f2937; font-weight: 700; font-size: 16px; margin: 0;">
                      Het Bouw met Respect team
                    </p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
        </table>
        
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Bouw met Respect <info@bouwmetrespect.nl>",
      to: [orderData.customerEmail],
      subject: `Bestelbevestiging #${orderData.orderId.slice(-8)} - Bouw met Respect`,
      html: emailHtml,
    });

    console.log("Order confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending order confirmation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);