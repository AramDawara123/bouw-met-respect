import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

  console.log("Newsletter function called");
  
  try {
    const { email, firstName, lastName }: NewsletterRequest = await req.json();
    console.log("Request data:", { email, firstName, lastName });
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client for fallback storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try Mailchimp first
    const mailchimpApiKey = Deno.env.get("MAILCHIMP_API_KEY");
    console.log("API Key found:", mailchimpApiKey ? "Yes" : "No");
    
    if (mailchimpApiKey) {
      try {
        console.log("Attempting Mailchimp signup");
        const datacenter = mailchimpApiKey.split("-")[1];
        console.log("Datacenter extracted:", datacenter);

        const basicAuth = "Basic " + btoa(`anystring:${mailchimpApiKey}`);
        const configuredListId = Deno.env.get("MAILCHIMP_LIST_ID");
        let listId = configuredListId || "";

        if (!listId) {
          const audienceResponse = await fetch(`https://${datacenter}.api.mailchimp.com/3.0/lists`, {
            method: "GET",
            headers: {
              "Authorization": basicAuth,
              "Content-Type": "application/json",
            },
          });

          if (audienceResponse.ok) {
            const audienceData = await audienceResponse.json();
            if (audienceData.lists && audienceData.lists.length > 0) {
              listId = audienceData.lists[0].id;
            }
          }
        }

        if (listId) {
          const memberData = {
            email_address: email,
            status: "subscribed",
            merge_fields: {
              ...(firstName && { FNAME: firstName }),
              ...(lastName && { LNAME: lastName }),
            },
          };

          const addMemberResponse = await fetch(`https://${datacenter}.api.mailchimp.com/3.0/lists/${listId}/members`, {
            method: "POST",
            headers: {
              "Authorization": basicAuth,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(memberData),
          });

          if (addMemberResponse.ok) {
            console.log("Successfully added to Mailchimp");
            
            // Also store in our database with mailchimp_synced = true
            await supabase.from('newsletter_signups').insert({
              email,
              first_name: firstName,
              last_name: lastName,
              mailchimp_synced: true
            });

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
          }
        }
      } catch (mailchimpError) {
        console.log("Mailchimp failed, using database fallback:", mailchimpError);
      }
    }

    // Fallback: Store in database
    console.log("Using database fallback for email:", email);
    
    const { error: dbError } = await supabase.from('newsletter_signups').insert({
      email,
      first_name: firstName,
      last_name: lastName,
      mailchimp_synced: false
    });

    if (dbError) {
      if (dbError.code === '23505') { // Unique constraint violation
        return new Response(
          JSON.stringify({ error: "Dit e-mailadres is al geregistreerd voor onze nieuwsbrief" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      throw dbError;
    }

    console.log("Successfully stored in database");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Succesvol aangemeld voor de nieuwsbrief! We nemen je op in onze lijst." 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in newsletter function:", error);
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