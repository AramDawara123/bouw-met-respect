import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
async function sendWelcomeEmail(email: string, password: string) {
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
        subject: 'Welkom bij Bouw met Respect - Je partner account is geactiveerd!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welkom bij Bouw met Respect!</h2>
            <p>Je partner account is succesvol geactiveerd!</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Je inloggegevens:</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Nieuw Wachtwoord:</strong> ${password}</p>
            </div>
            
            <p>Je kunt nu inloggen op je <a href="https://bouwmetrespect.nl/partner-dashboard" style="color: #2563eb;">Partner Dashboard</a> met je nieuwe wachtwoord.</p>
            
            <p><em>Tip: We raden aan om je wachtwoord te wijzigen na je eerste inlog.</em></p>
            
            <p>Voor vragen kun je altijd contact met ons opnemen.</p>
            
            <p>Met vriendelijke groet,<br>
            Het Bouw met Respect team</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Welcome email sent successfully:', data);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the webhook payload
    const payload = await req.json();
    console.log('Received webhook payload:', payload);

    // Check for user signup confirmation events
    if (payload.type === 'user.updated' && payload.data?.email_confirmed_at) {
      const user = payload.data;
      console.log('Processing newly confirmed user:', user.email);

      // Generate a new password
      const newPassword = generateRandomPassword();

      // Update the user's password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
      );

      if (updateError) {
        console.error('Error updating user password:', updateError);
        throw updateError;
      }

      // Send welcome email with credentials
      await sendWelcomeEmail(user.email, newPassword);

      console.log('Successfully processed user confirmation and sent welcome email');
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in auth webhook handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});