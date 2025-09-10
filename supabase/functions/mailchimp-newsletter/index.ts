import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsletterRequest {
  email: string;
  firstName?: string;
  lastName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName }: NewsletterRequest = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const mailchimpApiKey = Deno.env.get("MAILCHIMP_API_KEY");
    if (!mailchimpApiKey) {
      console.error("MAILCHIMP_API_KEY not found");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Extract datacenter from API key (us7 from fc1e8bb2869d7867992a2327b2cdb86c-us7)
    const datacenter = mailchimpApiKey.split('-')[1];
    
    // First, get the audience/list ID
    const audienceResponse = await fetch(`https://${datacenter}.api.mailchimp.com/3.0/lists`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mailchimpApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!audienceResponse.ok) {
      const error = await audienceResponse.text();
      console.error("Failed to get audience:", error);
      return new Response(
        JSON.stringify({ error: "Failed to access newsletter list" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const audienceData = await audienceResponse.json();
    
    if (!audienceData.lists || audienceData.lists.length === 0) {
      console.error("No audience lists found");
      return new Response(
        JSON.stringify({ error: "No newsletter list configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const listId = audienceData.lists[0].id; // Use the first available list

    // Add member to the list
    const memberData = {
      email_address: email,
      status: "subscribed",
      merge_fields: {
        ...(firstName && { FNAME: firstName }),
        ...(lastName && { LNAME: lastName }),
      },
    };

    const addMemberResponse = await fetch(`https://${datacenter}.api.mailchimp.com/3.0/lists/${listId}/members`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mailchimpApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });

    if (!addMemberResponse.ok) {
      const error = await addMemberResponse.json();
      console.error("Failed to add member:", error);
      
      // Handle specific Mailchimp errors
      if (error.title === "Member Exists") {
        return new Response(
          JSON.stringify({ error: "Dit e-mailadres is al geregistreerd voor onze nieuwsbrief" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Aanmelding mislukt. Probeer het opnieuw." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const result = await addMemberResponse.json();
    console.log("Successfully added member:", result.email_address);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Succesvol aangemeld voor de nieuwsbrief!" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in mailchimp-newsletter function:", error);
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