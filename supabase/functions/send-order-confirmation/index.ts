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
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .card-shadow {
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
          .success-badge {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
          }
        </style>
      </head>
      <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); min-height: 100vh;">
        
        <!-- Header with Gradient -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 0; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; padding: 0 20px;">
            <h1 style="color: white; font-size: 32px; font-weight: 700; margin: 0 0 10px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Bouw met Respect</h1>
            <div class="success-badge" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block;">
              ✅ Bestelling Bevestigd
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div style="max-width: 600px; margin: -20px auto 0; padding: 0 20px; position: relative;">
          
          <!-- Welcome Card -->
          <div style="background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
            <h2 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 28px; font-weight: 700; margin: 0 0 16px 0;">Bedankt voor je bestelling!</h2>
            <p style="font-size: 16px; color: #6b7280; margin: 0 0 16px 0;">Beste <strong style="color: #1f2937;">${orderData.customerName}</strong>,</p>
            <p style="font-size: 16px; color: #6b7280; margin: 0;">We hebben je bestelling succesvol ontvangen en verwerkt. Hieronder vind je een gedetailleerd overzicht van je bestelling.</p>
          </div>

          <!-- Order Details Card -->
          <div style="background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
            <h3 style="color: #1f2937; font-size: 22px; font-weight: 600; margin: 0 0 24px 0; padding-bottom: 16px; border-bottom: 2px solid #f3f4f6;">📋 Bestelgegevens</h3>
            <div style="display: grid; gap: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                <span style="font-weight: 500; color: #374151;">Bestelnummer:</span>
                <span style="font-family: 'Monaco', 'Consolas', monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 6px; font-size: 14px; color: #1f2937;">#${orderData.orderId.slice(-8)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                <span style="font-weight: 500; color: #374151;">Besteldatum:</span>
                <span style="color: #1f2937;">${orderData.orderDate}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                <span style="font-weight: 500; color: #374151;">Email:</span>
                <span style="color: #1f2937;">${orderData.customerEmail}</span>
              </div>
            </div>
          </div>

          ${orderData.shippingAddress.street ? `
          <!-- Shipping Address Card -->
          <div style="background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
            <h3 style="color: #1f2937; font-size: 22px; font-weight: 600; margin: 0 0 24px 0; padding-bottom: 16px; border-bottom: 2px solid #f3f4f6;">🚚 Verzendadres</h3>
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 20px; border-radius: 12px; border-left: 4px solid #667eea;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #1f2937; font-size: 16px;">${orderData.customerName}</p>
              <p style="margin: 0 0 4px 0; color: #6b7280;">${orderData.shippingAddress.street} ${orderData.shippingAddress.houseNumber || ''}</p>
              <p style="margin: 0 0 4px 0; color: #6b7280;">${orderData.shippingAddress.postcode || ''} ${orderData.shippingAddress.city || ''}</p>
              <p style="margin: 0; color: #6b7280; font-weight: 500;">${orderData.shippingAddress.country || 'Nederland'}</p>
            </div>
          </div>
          ` : ''}

          <!-- Products Card -->
          <div style="background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
            <h3 style="color: #1f2937; font-size: 22px; font-weight: 600; margin: 0 0 24px 0; padding-bottom: 16px; border-bottom: 2px solid #f3f4f6;">🛒 Bestelde producten</h3>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);">
                    <th style="padding: 16px 12px; text-align: left; font-weight: 600; color: #374151; border-radius: 8px 0 0 8px;">Product</th>
                    <th style="padding: 16px 12px; text-align: center; font-weight: 600; color: #374151;">Aantal</th>
                    <th style="padding: 16px 12px; text-align: right; font-weight: 600; color: #374151;">Prijs</th>
                    <th style="padding: 16px 12px; text-align: right; font-weight: 600; color: #374151; border-radius: 0 8px 8px 0;">Totaal</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderData.orderItems.map((item, index) => `
                    <tr style="border-bottom: 1px solid #f3f4f6; ${index % 2 === 0 ? 'background: #fafafa;' : ''}">
                      <td style="padding: 16px 12px; color: #1f2937; font-weight: 500;">${item.name}</td>
                      <td style="padding: 16px 12px; text-align: center; color: #6b7280; font-weight: 600;">${item.quantity}</td>
                      <td style="padding: 16px 12px; text-align: right; color: #6b7280;">€${(item.price / 100).toFixed(2)}</td>
                      <td style="padding: 16px 12px; text-align: right; color: #1f2937; font-weight: 600;">€${((item.price * item.quantity) / 100).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Total Summary Card -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 32px; margin-bottom: 24px; color: white; box-shadow: 0 10px 25px -5px rgba(102, 126, 234, 0.3);">
            <h3 style="color: white; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">💰 Besteloverzicht</h3>
            <div style="space-y: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                <span style="font-weight: 500; opacity: 0.9;">Subtotaal:</span>
                <span style="font-weight: 600;">€${(orderData.subtotal / 100).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                <span style="font-weight: 500; opacity: 0.9;">Verzendkosten:</span>
                <span style="font-weight: 600;">€${(orderData.shipping / 100).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0 8px 0; border-top: 2px solid rgba(255,255,255,0.3); margin-top: 12px;">
                <span style="font-size: 20px; font-weight: 700;">Totaal:</span>
                <span style="font-size: 24px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">€${(orderData.total / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <!-- Status Update Card -->
          <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #a7f3d0;">
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                <span style="color: white; font-size: 24px;">🚀</span>
              </div>
              <h3 style="color: #065f46; font-size: 20px; font-weight: 600; margin: 0;">Wat gebeurt er nu?</h3>
            </div>
            <p style="color: #047857; margin: 0 0 12px 0; font-size: 16px; line-height: 1.6;">Je bestelling wordt binnen 24 uur verwerkt en zo snel mogelijk verzonden.</p>
            <p style="color: #047857; margin: 0; font-size: 16px; line-height: 1.6;">Je ontvangt binnenkort een email met track & trace informatie zodat je je bestelling kunt volgen.</p>
          </div>

          <!-- Footer -->
          <div style="background: white; border-radius: 16px; padding: 32px; margin-bottom: 40px; text-align: center; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
            <div style="margin-bottom: 24px;">
              <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">Vragen over je bestelling?</h3>
              <p style="color: #6b7280; margin: 0 0 16px 0;">We helpen je graag verder!</p>
              <a href="mailto:info@bouwmetrespect.nl" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; display: inline-block; transition: all 0.3s ease;">
                📧 info@bouwmetrespect.nl
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px 0;">
                Met vriendelijke groet,
              </p>
              <p style="color: #1f2937; font-weight: 700; font-size: 16px; margin: 0;">
                Het Bouw met Respect team
              </p>
            </div>
          </div>
        </div>
        
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