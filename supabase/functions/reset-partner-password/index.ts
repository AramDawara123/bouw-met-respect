import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResetPasswordRequest {
  partnerId: string;
  newPassword?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // This function is designed to be called from an admin interface
    // We'll use the admin client directly for security

    const { partnerId, newPassword }: ResetPasswordRequest = await req.json();

    if (!partnerId) {
      throw new Error('Partner ID is required');
    }

    // Get partner details
    const { data: partner, error: partnerError } = await supabaseAdmin
      .from('partner_memberships')
      .select('user_id, email, first_name, last_name')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partner) {
      throw new Error('Partner not found');
    }

    if (!partner.user_id) {
      throw new Error('Partner has no associated user account');
    }

    // Generate a temporary password if none provided
    const tempPassword = newPassword || `temp${Math.random().toString(36).slice(2, 10)}`;

    // Reset the user's password
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      partner.user_id,
      {
        password: tempPassword,
        email_confirm: true
      }
    );

    if (updateError) {
      throw new Error(`Error updating user password: ${updateError.message}`);
    }

    console.log(`Password reset for partner: ${partner.email}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Wachtwoord gereset voor ${partner.first_name} ${partner.last_name}`,
      tempPassword: tempPassword,
      email: partner.email
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in reset-partner-password function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});