import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email, password, first_name, last_name, company_name, partner_id } = await req.json()

    // Validate required fields
    if (!email || !password || !first_name || !last_name || !company_name || !partner_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Ontbrekende verplichte velden' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create user account
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: first_name,
        last_name: last_name,
        company_name: company_name
      }
    })

    if (authError) {
      console.error('Error creating user:', authError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Fout bij aanmaken gebruiker: ${authError.message}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (authData.user) {
      // Update partner membership with user_id
      const { error: updateError } = await supabaseAdmin
        .from('partner_memberships')
        .update({ user_id: authData.user.id })
        .eq('id', partner_id)

      if (updateError) {
        console.error('Error updating partner membership:', updateError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Fout bij bijwerken partner: ${updateError.message}` 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Create company profile
      const { error: profileError } = await supabaseAdmin
        .from('company_profiles')
        .insert({
          name: company_name,
          description: `Welkom bij ${company_name}`,
          industry: 'Bouw & Constructie',
          contact_email: email,
          contact_phone: '',
          partner_membership_id: partner_id,
          is_featured: false,
          display_order: 999
        })

      if (profileError) {
        console.error('Error creating company profile:', profileError)
        // Don't fail the entire operation for profile creation
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          user_id: authData.user.id,
          message: 'Account succesvol aangemaakt en gekoppeld' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Geen gebruiker aangemaakt' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Onverwachte fout bij account aanmaken' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
