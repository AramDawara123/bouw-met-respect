import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.1.0";

const RESEND_API_KEY = Deno.env.get("RESEND_CONTACT_API_KEY");
const RESEND_TO_EMAIL = "info@bouwmetrespect.nl";

interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error('RESEND_CONTACT_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const contactData: ContactData = await req.json();
    console.log('Received contact data:', contactData);

    // Validate required fields
    if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create HTML email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          Nieuwe Contact Formulier Inzending
        </h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Contactgegevens</h3>
          <p><strong>Naam:</strong> ${contactData.name}</p>
          <p><strong>E-mail:</strong> ${contactData.email}</p>
          <p><strong>Onderwerp:</strong> ${contactData.subject}</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h3 style="color: #1e40af; margin-top: 0;">Bericht</h3>
          <p style="line-height: 1.6; white-space: pre-wrap;">${contactData.message}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
          <p>Dit bericht is verzonden via het contactformulier op de Bouw met Respect website.</p>
          <p>Datum: ${new Date().toLocaleString('nl-NL')}</p>
        </div>
      </div>
    `;

    const resend = new Resend(RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: RESEND_TO_EMAIL,
      reply_to: contactData.email, // Dit zorgt ervoor dat je kunt reageren op de email van de klant
      subject: `Contact Formulier: ${contactData.subject}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: error }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Email sent successfully:', data);
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        emailId: data?.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing contact form:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: (error as Error).message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
