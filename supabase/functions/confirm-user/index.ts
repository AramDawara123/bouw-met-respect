import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      throw new Error('Email is verplicht');
    }

    console.log('Confirming user:', email);

    // Find the user
    const { data: users } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });
    
    const user = users?.users?.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Gebruiker niet gevonden');
    }

    // Confirm the user's email
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { 
        email_confirm: true 
      }
    );

    if (updateError) {
      console.error('Error confirming user:', updateError);
      throw updateError;
    }

    console.log('User confirmed successfully:', email);

    return new Response(JSON.stringify({
      success: true,
      message: 'Gebruiker bevestigd',
      user_id: user.id,
      email: email
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in confirm-user function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Er ging iets mis bij het bevestigen van de gebruiker' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);