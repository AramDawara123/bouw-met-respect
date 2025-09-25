import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PartnerConfirmationRequest {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Partner confirmation email function called");
    
    const { user_id, email, first_name, last_name }: PartnerConfirmationRequest = await req.json();
    
    console.log(`Sending partner confirmation email to: ${email}`);

    const displayName = first_name && last_name 
      ? `${first_name} ${last_name}` 
      : first_name || email;

    // Send email via Resend API directly
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bouw met Respect <info@bouwmetrespect.nl>',
        to: [email],
        subject: 'Welkom als partner bij Bouw met Respect!',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h1 style="color: #2563eb; text-align: center;">Welkom bij Bouw met Respect!</h1>
            
            <p>Beste ${displayName},</p>
            
            <p>Hartelijk welkom als partner bij Bouw met Respect! Je account is succesvol bevestigd en je kunt nu inloggen op het partner dashboard.</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Wat kun je nu doen?</h3>
              <ul style="color: #6b7280;">
                <li>Login op het partner dashboard</li>
                <li>Je bedrijfsprofiel aanpassen</li>
                <li>Je zichtbaarheid verhogen in ons partnernetwerk</li>
                <li>Deelnemen aan onze community van respectvolle bouwprofessionals</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://bouwmetrespect.nl/partner-dashboard" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Ga naar Partner Dashboard
              </a>
            </div>
            
            <p>Als je vragen hebt, neem dan gerust contact met ons op via <a href="mailto:info@bouwmetrespect.nl">info@bouwmetrespect.nl</a>.</p>
            
            <p>Met vriendelijke groet,<br>
            Het team van Bouw met Respect</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Deze email is verstuurd omdat je je hebt aangemeld als partner bij Bouw met Respect.
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Failed to send email via Resend:', errorText);
      throw new Error(`Email sending failed: ${emailResponse.status} ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    console.log("Partner confirmation email sent successfully:", emailResult);

    return new Response(JSON.stringify({
      success: true,
      message: 'Partner confirmation email sent successfully',
      email_id: emailResult.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in partner-confirmation-email function:", error);
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