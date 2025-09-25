import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutoAccountRequest {
  email: string;
  company_name?: string;
  first_name?: string;
  last_name?: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const resend = new Resend(resendApiKey);

function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, company_name, first_name, last_name }: AutoAccountRequest = await req.json();

    if (!email) {
      throw new Error('Email is verplicht');
    }

    console.log('Creating auto account for:', email);

    // First check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });
    
    const userExists = existingUser?.users?.find(user => user.email === email);
    
    let userId: string;
    let password: string;
    let isNewUser = false;
    
    if (userExists) {
      console.log('User already exists:', userExists.id);
      userId = userExists.id;
      // For existing users, we'll send a reset password email instead
      password = 'Reset wachtwoord via email';
    } else {
      // Generate random password for new users
      password = generatePassword();
      
      // Create user account using admin client
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          auto_generated: true,
          created_by_admin: true
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Account aanmaken mislukt');
      }

      userId = authData.user.id;
      isNewUser = true;
      console.log('New user created:', userId);
    }

    // Create partner membership record
    const { error: membershipError } = await supabase
      .from('partner_memberships')
      .insert({
        user_id: userId,
        email: email,
        first_name: first_name || '',
        last_name: last_name || '',
        company_name: company_name || 'Niet opgegeven',
        payment_status: 'paid', // Auto-approve
        amount: 0, // Free account
        description: 'Automatisch aangemaakt account via admin systeem'
      });

    if (membershipError) {
      console.error('Membership error:', membershipError);
      // Don't throw here, account is already created
    }

    // Send email with login credentials
    const emailContent = isNewUser ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welkom bij Bouw met Respect</h2>
        
        <p>Hallo${first_name ? ` ${first_name}` : ''},</p>
        
        <p>Je partner account is aangemaakt! Hier zijn je inloggegevens:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Wachtwoord:</strong> ${password}</p>
          <p><strong>Login URL:</strong> <a href="https://bouwmetrespect.nl/partner-auth">https://bouwmetrespect.nl/partner-auth</a></p>
        </div>
        
        <p style="color: #dc2626; font-weight: bold;">⚠️ Belangrijk: Wijzig je wachtwoord na je eerste login voor veiligheid!</p>
        
        <p>Je kunt nu inloggen op het partner portaal om:</p>
        <ul>
          <li>Je bedrijfsprofiel beheren</li>
          <li>Toegang krijgen tot partner resources</li>
          <li>Contact opnemen met ons team</li>
        </ul>
        
        <p>Heb je vragen? Neem contact met ons op via info@bouwmetrespect.nl</p>
        
        <p>Met vriendelijke groet,<br>
        Het Bouw met Respect team</p>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Partner Account Update - Bouw met Respect</h2>
        
        <p>Hallo${first_name ? ` ${first_name}` : ''},</p>
        
        <p>Je bestaande account is gekoppeld aan ons partner systeem!</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Gebruik je bestaande wachtwoord</strong></p>
          <p><strong>Login URL:</strong> <a href="https://bouwmetrespect.nl/partner-auth">https://bouwmetrespect.nl/partner-auth</a></p>
        </div>
        
        <p>Je kunt nu inloggen op het partner portaal om:</p>
        <ul>
          <li>Je bedrijfsprofiel beheren</li>
          <li>Toegang krijgen tot partner resources</li>
          <li>Contact opnemen met ons team</li>
        </ul>
        
        <p>Heb je vragen? Neem contact met ons op via info@bouwmetrespect.nl</p>
        
        <p>Met vriendelijke groet,<br>
        Het Bouw met Respect team</p>
      </div>
    `;

    const { error: emailError } = await resend.emails.send({
      from: 'Bouw met Respect <noreply@bouwmetrespect.nl>',
      to: [email],
      subject: 'Je partner account is klaar - Inloggegevens',
      html: emailContent,
    });

    if (emailError) {
      console.error('Email error:', emailError);
      // Don't throw here, account is created but email failed
    }

    console.log('Auto account created successfully for:', email);

    return new Response(JSON.stringify({
      success: true,
      message: 'Account aangemaakt en email verzonden',
      user_id: userId,
      email: email,
      password: password, // Return for admin reference
      email_sent: !emailError
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in create-auto-account function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Er ging iets mis bij het aanmaken van het account' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);