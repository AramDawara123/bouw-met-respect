import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    const { email } = await req.json();
    console.log('Sending confirmation email to:', email);

    if (!email) {
      throw new Error('Email is required');
    }

    // Create Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First check if user exists and get their confirmation status
    const { data: users, error: getUserError } = await supabase.auth.admin.listUsers();
    
    if (getUserError) {
      console.error('Error fetching users:', getUserError);
      throw getUserError;
    }

    const existingUser = users.users.find(user => user.email === email);
    
    let confirmationUrl = '';
    
    if (existingUser && !existingUser.email_confirmed_at) {
      // User exists but not confirmed - generate recovery link to confirm
      console.log('User exists but not confirmed, generating recovery link');
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: 'https://bouwmetrespect.nl/partner-dashboard'
        }
      });

      if (error) {
        console.error('Error generating recovery link:', error);
        throw error;
      }

      confirmationUrl = data.properties?.action_link || '';
    } else if (!existingUser) {
      // User doesn't exist - this should not happen at this point
      throw new Error('User does not exist. Please register first.');
    } else {
      // User already confirmed
      throw new Error('User is already confirmed');
    }
    
    if (!confirmationUrl) {
      throw new Error('Failed to generate confirmation link');
    }

    console.log('Generated confirmation URL:', confirmationUrl);

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bouw met Respect <noreply@bouwmetrespect.nl>',
        to: [email],
        subject: 'Bevestig je partner account - Bouw met Respect',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welkom bij Bouw met Respect!</h2>
            <p>Beste partner,</p>
            <p>Bedankt voor je registratie als partner bij Bouw met Respect!</p>
            
            <p>Klik op de onderstaande link om je email adres te bevestigen en je account te activeren:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Bevestig je account
              </a>
            </div>
            
            <p>Of kopieer deze link naar je browser:</p>
            <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; font-size: 12px;">
              ${confirmationUrl}
            </p>
            
            <p><em>Deze link is 24 uur geldig.</em></p>
            
            <p>Na bevestiging ontvang je een aparte email met je inloggegevens voor het partner dashboard.</p>
            
            <p>Voor vragen kun je altijd contact met ons opnemen via info@bouwmetrespect.nl</p>
            
            <p>Met vriendelijke groet,<br>
            Het Bouw met Respect team</p>
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
    console.log('Confirmation email sent successfully:', emailResult);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Confirmation email sent successfully',
      email_id: emailResult.id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in send-confirmation-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});