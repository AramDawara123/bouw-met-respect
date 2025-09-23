import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Auth email hook triggered');
    
    const payload = await req.json();
    console.log('Received payload:', JSON.stringify(payload, null, 2));

    const { user, email_data } = payload;
    const { token, token_hash, redirect_to, email_action_type } = email_data;

    // Generate confirmation URL
    const confirmationUrl = `https://pkvayugxzgkoipclcpli.supabase.co/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to)}`;

    let subject = '';
    let htmlContent = '';

    // Customize email based on action type
    switch (email_action_type) {
      case 'signup':
        subject = 'Bevestig je partner account - Bouw met Respect';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welkom bij Bouw met Respect!</h2>
            <p>Beste partner,</p>
            <p>Bedankt voor je registratie als partner bij Bouw met Respect!</p>
            
            <p>Klik op de onderstaande link om je email adres te bevestigen:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Bevestig je account
              </a>
            </div>
            
            <p>Of kopieer deze link naar je browser:</p>
            <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">
              ${confirmationUrl}
            </p>
            
            <p><em>Deze link is 24 uur geldig.</em></p>
            
            <p>Voor vragen kun je altijd contact met ons opnemen via info@bouwmetrespect.nl</p>
            
            <p>Met vriendelijke groet,<br>
            Het Bouw met Respect team</p>
          </div>
        `;
        break;
      
      case 'recovery':
        subject = 'Wachtwoord reset - Bouw met Respect';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Wachtwoord Reset</h2>
            <p>Beste partner,</p>
            <p>Je hebt een wachtwoord reset aangevraagd voor je Bouw met Respect account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Wachtwoord
              </a>
            </div>
            
            <p>Als je geen wachtwoord reset hebt aangevraagd, kun je deze email negeren.</p>
            
            <p>Met vriendelijke groet,<br>
            Het Bouw met Respect team</p>
          </div>
        `;
        break;
      
      default:
        subject = 'Bouw met Respect - Account actie vereist';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Account Actie Vereist</h2>
            <p>Klik op de onderstaande link om door te gaan:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Doorgaan
              </a>
            </div>
          </div>
        `;
    }

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bouw met Respect <noreply@bouwmetrespect.nl>',
        to: [user.email],
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Failed to send email via Resend:', errorText);
      throw new Error(`Email sending failed: ${emailResponse.status} ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    console.log('Email sent successfully via Resend:', emailResult);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email sent via Resend',
      email_id: emailResult.id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in send-auth-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});