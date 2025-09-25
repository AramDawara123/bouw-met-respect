import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.1.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PartnerConfirmationData {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  membershipType: string;
  amount: number;
  discountCode?: string;
  discountAmount?: number;
}

serve(async (req) => {
  console.log('🚀 send-partner-confirmation function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      firstName, 
      lastName, 
      companyName, 
      membershipType, 
      amount,
      discountCode,
      discountAmount 
    }: PartnerConfirmationData = await req.json();

    console.log('Sending partner confirmation email to:', email);

    const finalAmount = amount;
    const originalAmount = discountAmount ? amount + discountAmount : amount;
    
    let discountInfo = '';
    if (discountCode && discountAmount && discountAmount > 0) {
      discountInfo = `
        <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h3 style="color: #0ea5e9; margin: 0 0 8px 0;">💰 Korting Toegepast</h3>
          <p style="margin: 0; color: #0369a1;">
            <strong>Kortingscode:</strong> ${discountCode}<br>
            <strong>Besparing:</strong> €${(discountAmount / 100).toFixed(2)}
          </p>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Bouw met Respect <noreply@bouwmetrespect.nl>",
      to: [email],
      subject: "Welkom als Partner van Bouw met Respect! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Welkom bij Bouw met Respect!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Je bent nu officieel partner!</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <h2 style="color: #1e40af; margin: 0 0 15px 0;">Hallo ${firstName} ${lastName}! 👋</h2>
            <p style="color: #64748b; line-height: 1.6; margin: 0;">
              Hartelijk dank voor je partnership met <strong>${companyName}</strong>! 
              Je betaling is succesvol verwerkt en je bent nu officieel onderdeel van onze community 
              van partners die samen bouwen aan een respectvolle en duurzame bouwsector.
            </p>
          </div>

          ${discountInfo}

          <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0;">📋 Partnership Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;"><strong>Bedrijf:</strong></td>
                <td style="padding: 8px 0; color: #1e293b; border-bottom: 1px solid #f1f5f9;">${companyName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;"><strong>Partnership Type:</strong></td>
                <td style="padding: 8px 0; color: #1e293b; border-bottom: 1px solid #f1f5f9;">${membershipType}</td>
              </tr>
              ${discountAmount && discountAmount > 0 ? `
              <tr>
                <td style="padding: 8px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;"><strong>Oorspronkelijk bedrag:</strong></td>
                <td style="padding: 8px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">€${(originalAmount / 100).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #16a34a; border-bottom: 1px solid #f1f5f9;"><strong>Korting:</strong></td>
                <td style="padding: 8px 0; color: #16a34a; border-bottom: 1px solid #f1f5f9;">-€${(discountAmount / 100).toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #1e40af;"><strong>Totaal betaald:</strong></td>
                <td style="padding: 8px 0; color: #1e40af; font-size: 18px; font-weight: bold;">€${(finalAmount / 100).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0;">🚀 Wat nu?</h3>
            <ul style="color: #64748b; line-height: 1.8; padding-left: 20px;">
              <li>Je bedrijfsprofiel wordt binnenkort zichtbaar op onze website</li>
              <li>Je ontvangt toegang tot het partnerportaal</li>
              <li>We nemen contact met je op voor de volgende stappen</li>
              <li>Je kunt nu profiteren van alle partnervoordelen</li>
            </ul>
          </div>

          <div style="text-align: center; padding: 25px; background-color: #f8fafc; border-radius: 12px;">
            <p style="color: #64748b; margin: 0 0 15px 0;">Heb je vragen? Neem gerust contact met ons op!</p>
            <a href="mailto:info@bouwmetrespect.nl" style="background-color: #1e40af; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold;">
              📧 Contact opnemen
            </a>
          </div>

          <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 14px; border-top: 1px solid #e2e8f0; margin-top: 30px;">
            <p style="margin: 0;">© 2024 Bouw met Respect. Samen bouwen aan een betere toekomst.</p>
          </div>
        </div>
      `,
    });

    console.log("Partner confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-partner-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});