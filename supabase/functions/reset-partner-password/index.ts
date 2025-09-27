import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResetPasswordRequest {
  email?: string;
  partnerId?: string;
  newPassword?: string;
}

const generateRandomPassword = (length: number = 12): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  let password = '';
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

const sendPasswordResetEmail = async (email: string, firstName: string, newPassword: string) => {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    console.log("RESEND_API_KEY not found - skipping email");
    return { id: "skipped", message: "Email service not configured, but password was reset successfully" };
  }

  const emailData = {
    from: "Bouw met Respect <noreply@bouwmetrespect.nl>",
    to: [email],
    subject: "Nieuw wachtwoord voor je partner account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">Bouw met Respect</h1>
          <h2 style="color: #374151; margin-top: 0;">Nieuw Wachtwoord</h2>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 15px 0; color: #374151;">Hallo ${firstName},</p>
          <p style="margin: 0 0 15px 0; color: #374151;">
            Je hebt een nieuw wachtwoord aangevraagd voor je partner account. Hieronder vind je je nieuwe inloggegevens:
          </p>
          
          <div style="background-color: white; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #1f2937;">Inloggegevens:</p>
            <p style="margin: 0 0 5px 0; color: #374151;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0; color: #374151;"><strong>Nieuw wachtwoord:</strong> <code style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${newPassword}</code></p>
          </div>
          
          <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px;">
            <strong>Belangrijk:</strong> Bewaar dit wachtwoord op een veilige plaats. Je kunt het later wijzigen in je account instellingen.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://bouwmetrespect.nl/partner-auth" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
            Inloggen op Partner Portal
          </a>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Deze email is automatisch gegenereerd. Voor vragen kun je contact opnemen via info@bouwmetrespect.nl
          </p>
        </div>
      </div>
    `,
  };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Failed to send email:", errorData);
      throw new Error(`Failed to send email: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};

serve(async (req: Request) => {
  console.log('🚀 reset-partner-password function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const requestBody: ResetPasswordRequest = await req.json();
    console.log('Request body:', { ...requestBody, newPassword: requestBody.newPassword ? '[REDACTED]' : undefined });
    
    const { email, partnerId, newPassword } = requestBody;

    let partner;

    // Handle both email-based reset (from partner-auth) and admin-based reset
    if (email) {
      console.log('Password reset requested by email:', email);

      // Find partner by email
      const { data: partnerData, error: partnerError } = await supabaseAdmin
        .from('partner_memberships')
        .select('user_id, email, first_name, last_name')
        .eq('email', email)
        .eq('payment_status', 'paid')
        .maybeSingle();

      if (partnerError) {
        console.error('Database error:', partnerError);
        throw new Error(`Database error: ${partnerError.message}`);
      }

      if (!partnerData) {
        console.log('Partner not found for email:', email);
        return new Response(
          JSON.stringify({ 
            error: 'Partner account niet gevonden of niet actief. Controleer je email adres.',
            success: false 
          }),
          { 
            status: 404, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      partner = partnerData;
    } else if (partnerId) {
      console.log('Password reset requested by partnerId:', partnerId);

      // Find partner by ID (admin function)
      const { data: partnerData, error: partnerError } = await supabaseAdmin
        .from('partner_memberships')
        .select('user_id, email, first_name, last_name')
        .eq('id', partnerId)
        .maybeSingle();

      if (partnerError) {
        console.error('Database error:', partnerError);
        throw new Error(`Database error: ${partnerError.message}`);
      }

      if (!partnerData) {
        throw new Error('Partner niet gevonden');
      }

      partner = partnerData;
    } else {
      return new Response(
        JSON.stringify({ 
          error: 'Email of partner ID is verplicht',
          success: false 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    if (!partner.user_id) {
      console.log('Partner has no associated user account:', partner.email);
      return new Response(
        JSON.stringify({ 
          error: 'Partner heeft geen gekoppeld gebruikersaccount. Neem contact op met de administrator.',
          success: false 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Generate a new secure password if none provided
    const tempPassword = newPassword || generateRandomPassword();
    console.log('Generated new password for user:', partner.user_id);

    // Reset the user's password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      partner.user_id,
      {
        password: tempPassword,
        email_confirm: true
      }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      throw new Error(`Kon wachtwoord niet bijwerken: ${updateError.message}`);
    }

    console.log(`Password reset successful for partner: ${partner.email}`);

    // Send email with new password if this was initiated by email (not admin)
    let emailSent = false;
    if (email) {
      try {
        const emailResult = await sendPasswordResetEmail(partner.email, partner.first_name, tempPassword);
        console.log('Password reset email result:', emailResult);
        emailSent = emailResult.id !== 'skipped';
      } catch (emailError) {
        console.error('Failed to send email, but password was reset:', emailError);
        // Don't fail the whole request if email fails - password is already reset
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: email 
        ? (emailSent 
            ? `Nieuw wachtwoord gegenereerd en verzonden naar ${partner.email}` 
            : `Nieuw wachtwoord gegenereerd voor ${partner.email}. Email service niet beschikbaar - het wachtwoord is: ${tempPassword}`)
        : `Wachtwoord gereset voor ${partner.first_name} ${partner.last_name}`,
      tempPassword: email && !emailSent ? tempPassword : (email ? undefined : tempPassword), 
      email: partner.email,
      emailSent: emailSent
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in reset-partner-password function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Er ging iets mis bij het resetten van het wachtwoord',
        success: false 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});