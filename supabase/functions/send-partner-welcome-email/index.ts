import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { to, first_name, password, company_name } = await req.json()

    // Validate required fields
    if (!to || !first_name || !password || !company_name) {
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

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bouw met Respect <noreply@bouwmetrespect.nl>',
        to: [to],
        subject: 'Welkom bij Bouw met Respect - Je partner account is klaar!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welkom bij Bouw met Respect!</h2>
            <p>Beste ${first_name},</p>
            <p>Je partner account is succesvol aangemaakt en je kunt nu inloggen.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Je inloggegevens:</h3>
              <p><strong>Email:</strong> ${to}</p>
              <p><strong>Wachtwoord:</strong> ${password}</p>
              <p><strong>Bedrijf:</strong> ${company_name}</p>
            </div>
            
            <p>Je kunt nu inloggen op je <a href="https://bouwmetrespect.nl/partner-dashboard" style="color: #2563eb;">Partner Dashboard</a> om je bedrijfsprofiel te beheren.</p>
            
            <p>Voor vragen kun je altijd contact met ons opnemen.</p>
            
            <p>Met vriendelijke groet,<br>
            Het Bouw met Respect team</p>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to send email:', errorText)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Fout bij verzenden email' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const result = await response.json()
    console.log('Email sent successfully:', result)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email succesvol verzonden',
        email_id: result.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Onverwachte fout bij verzenden email' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
