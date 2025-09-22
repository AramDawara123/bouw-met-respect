import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Sending test order confirmation email...");

    const testOrderData = {
      customerName: "Test Klant",
      customerEmail: "arram.dawara@gmail.com",
      customerAddress: "Teststraat 123, 1234 AB Amsterdam",
      items: [
        { name: "Test Product 1", quantity: 2, price: 25.00 },
        { name: "Test Product 2", quantity: 1, price: 15.50 }
      ],
      subtotal: 65.50,
      shipping: 5.95,
      total: 71.45,
      orderNumber: "TEST-" + Date.now()
    };

    const itemsHtml = testOrderData.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin: 0;">Bouw Met Respect</h1>
          <p style="color: #7f8c8d; margin: 5px 0 0 0;">Bedankt voor je bestelling!</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin: 0 0 10px 0;">Bestelbevestiging</h2>
          <p style="margin: 5px 0;"><strong>Bestelnummer:</strong> ${testOrderData.orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Naam:</strong> ${testOrderData.customerName}</p>
          <p style="margin: 5px 0;"><strong>E-mail:</strong> ${testOrderData.customerEmail}</p>
          <p style="margin: 5px 0;"><strong>Adres:</strong> ${testOrderData.customerAddress}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #2c3e50;">Bestelde items:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background: #ecf0f1;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #bdc3c7;">Product</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #bdc3c7;">Aantal</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #bdc3c7;">Prijs</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Subtotaal:</span>
            <span>€${testOrderData.subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Verzendkosten:</span>
            <span>€${testOrderData.shipping.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; border-top: 1px solid #bdc3c7; padding-top: 10px;">
            <span>Totaal:</span>
            <span>€${testOrderData.total.toFixed(2)}</span>
          </div>
        </div>

        <div style="text-align: center; color: #7f8c8d; font-size: 14px;">
          <p><strong>Dit is een TEST EMAIL</strong></p>
          <p>Bedankt voor je vertrouwen in Bouw Met Respect!</p>
          <p>Bij vragen kun je contact met ons opnemen via info@bouwmetrespect.nl</p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Bouw Met Respect <info@bouwmetrespect.nl>",
      to: [testOrderData.customerEmail],
      subject: `TEST - Bestelbevestiging ${testOrderData.orderNumber}`,
      html: emailHtml,
    });

    console.log("Test email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Test email verzonden naar arram.dawara@gmail.com",
      emailResponse 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error sending test email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);