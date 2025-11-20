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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // First, find the admin user
    const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (getUserError) {
      throw new Error(`Error fetching users: ${getUserError.message}`);
    }

    const adminUser = users.users.find(user => user.email === 'info@bouwmetrespect.nl');
    
    if (!adminUser) {
      // Create the admin user if it doesn't exist
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: 'info@bouwmetrespect.nl',
        password: 'BouwMetRespect2024!',
        email_confirm: true,
        user_metadata: {
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin'
        }
      });

      if (createError) {
        throw new Error(`Error creating admin user: ${createError.message}`);
      }

      console.log('Admin user created successfully:', newUser.user?.email);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Admin user created successfully',
        userId: newUser.user?.id
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } else {
      // Update the existing admin user's password
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        adminUser.id,
        {
          password: 'BouwMetRespect2024!',
          email_confirm: true
        }
      );

      if (updateError) {
        throw new Error(`Error updating admin user: ${updateError.message}`);
      }

      console.log('Admin password updated successfully for:', updatedUser.user?.email);

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Admin password updated successfully',
        userId: updatedUser.user?.id
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

  } catch (error: any) {
    console.error('Error in reset-admin-password function:', error);
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