import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MembershipEmailRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  jobTitle: string;
  industryRole: string;
  experienceYears: string;
  specializations: string[];
  motivation: string;
  respectfulPractices: string;
  respectfulWorkplace: string;
  boundaryBehavior: string;
  membershipType: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const membershipData: MembershipEmailRequest = await req.json();
    
    if (!membershipData.email || !membershipData.firstName || !membershipData.lastName) {
      return new Response(
        JSON.stringify({ error: "Email, voornaam en achternaam zijn verplicht" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not found in environment variables");
      return new Response(
        JSON.stringify({ error: "Email service niet geconfigureerd" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create email content
    const emailContent = `
      <h2>Nieuwe Lidmaatschap Aanmelding</h2>
      
      <h3>Persoonlijke Gegevens:</h3>
      <p><strong>Naam:</strong> ${membershipData.firstName} ${membershipData.lastName}</p>
      <p><strong>Email:</strong> ${membershipData.email}</p>
      <p><strong>Telefoon:</strong> ${membershipData.phone}</p>
      ${membershipData.company ? `<p><strong>Bedrijf:</strong> ${membershipData.company}</p>` : ''}
      <p><strong>Functietitel:</strong> ${membershipData.jobTitle}</p>
      
      <h3>Beroepsinformatie:</h3>
      <p><strong>Rol in de bouwsector:</strong> ${membershipData.industryRole}</p>
      <p><strong>Ervaring:</strong> ${membershipData.experienceYears}</p>
      <p><strong>Specialisaties:</strong> ${membershipData.specializations.join(', ')}</p>
      
      <h3>Lidmaatschap:</h3>
      <p><strong>Type:</strong> ${membershipData.membershipType}</p>
      
      <h3>Motivatie:</h3>
      <p>${membershipData.motivation}</p>
      
      <h3>Respectvolle Praktijken:</h3>
      <p>${membershipData.respectfulPractices}</p>
      
      <h3>Respectvolle Werkplek:</h3>
      <p>${membershipData.respectfulWorkplace}</p>
      
      <h3>Grensoverschrijdend Gedrag:</h3>
      <p>${membershipData.boundaryBehavior}</p>
      
      <hr>
      <p><em>Dit bericht is automatisch verzonden via het Bouw met Respect website formulier.</em></p>
    `;

    // Send email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: ["info@bouwmetrespect.nl"],
        replyTo: membershipData.email, // Dit zorgt ervoor dat je kunt reageren op de email van de klant
        subject: `Nieuwe Lidmaatschap Aanmelding - ${membershipData.firstName} ${membershipData.lastName}`,
        html: emailContent,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error("Failed to send email:", error);
      return new Response(
        JSON.stringify({ error: "Email verzenden mislukt" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Lidmaatschap aanvraag succesvol verzonden!",
        emailId: emailResult.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-membership-email function:", error);
    return new Response(
      JSON.stringify({ error: "Er is een fout opgetreden. Probeer het opnieuw." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
