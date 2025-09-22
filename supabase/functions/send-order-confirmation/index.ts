import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">Bouw met Respect</h1>
          <h2 style="color: #1f2937; margin-top: 0;">Bedankt voor je bestelling!</h2>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0;"><strong>Beste ${orderData.customerName},</strong></p>
          <p style="margin: 0;">We hebben je bestelling succesvol ontvangen en verwerkt. Hieronder vind je een overzicht van je bestelling.</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Bestelgegevens</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Bestelnummer:</td>
              <td style="padding: 8px 0;">${orderData.orderId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Besteldatum:</td>
              <td style="padding: 8px 0;">${orderData.orderDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;">${orderData.customerEmail}</td>
            </tr>
          </table>
        </div>

        ${orderData.shippingAddress.street ? `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Verzendadres</h3>
          <p style="margin: 5px 0;">${orderData.customerName}</p>
          <p style="margin: 5px 0;">${orderData.shippingAddress.street} ${orderData.shippingAddress.houseNumber || ''}</p>
          <p style="margin: 5px 0;">${orderData.shippingAddress.postcode || ''} ${orderData.shippingAddress.city || ''}</p>
          <p style="margin: 5px 0;">${orderData.shippingAddress.country || 'Nederland'}</p>
        </div>
        ` : ''}

        <div style="margin-bottom: 30px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Bestelde producten</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
            <thead>
              <tr style="background-color: #f8fafc;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Product</th>
                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">Aantal</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">Prijs</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">Totaal</th>
              </tr>
            </thead>
            <tbody>
              ${orderData.orderItems.map(item => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">${item.name}</td>
                  <td style="padding: 12px; text-align: center; border-bottom: 1px solid #f3f4f6;">${item.quantity}</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f3f4f6;">€${(item.price / 100).toFixed(2)}</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f3f4f6;">€${((item.price * item.quantity) / 100).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px 0; text-align: right; font-weight: bold;">Subtotaal:</td>
              <td style="padding: 5px 0; text-align: right; width: 100px;">€${(orderData.subtotal / 100).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; text-align: right; font-weight: bold;">Verzendkosten:</td>
              <td style="padding: 5px 0; text-align: right;">€${(orderData.shipping / 100).toFixed(2)}</td>
            </tr>
            <tr style="border-top: 2px solid #e5e7eb;">
              <td style="padding: 10px 0 5px 0; text-align: right; font-weight: bold; font-size: 18px; color: #2563eb;">Totaal:</td>
              <td style="padding: 10px 0 5px 0; text-align: right; font-weight: bold; font-size: 18px; color: #2563eb;">€${(orderData.total / 100).toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e40af;">Wat gebeurt er nu?</p>
          <p style="margin: 0;">Je bestelling wordt zo snel mogelijk verwerkt en verzonden. Je ontvangt binnenkort een email met track & trace informatie.</p>
        </div>

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 10px 0;">Heb je vragen over je bestelling?</p>
          <p style="margin: 0;">Neem dan contact met ons op via <a href="mailto:info@bouwmetrespect.nl" style="color: #2563eb;">info@bouwmetrespect.nl</a></p>
          
          <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px;">
            Met vriendelijke groet,<br>
            <strong>Het Bouw met Respect team</strong>
          </p>
        </div>
        
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Bouw met Respect <noreply@bouwmetrespect.nl>",
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