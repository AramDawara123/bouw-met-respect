import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderConfirmationRequest {
  email: string;
  firstName: string;
  lastName: string;
  orderId: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, orderId, items }: OrderConfirmationRequest = await req.json();

    console.log('Order confirmation request:', { email, firstName, lastName, orderId });

    if (!email || !firstName || !lastName) {
      throw new Error('Email, firstName, and lastName are required');
    }

    const MAILCHIMP_API_KEY = Deno.env.get("MAILCHIMP_API_KEY");
    if (!MAILCHIMP_API_KEY) {
      throw new Error('MAILCHIMP_API_KEY not configured');
    }

    // Extract datacenter from API key (e.g., "us7" from "key-us7")
    const datacenter = MAILCHIMP_API_KEY.split('-').pop();
    if (!datacenter) {
      throw new Error('Invalid Mailchimp API key format');
    }

    // For now, we'll use a default audience ID - user should replace this with their actual audience ID
    const AUDIENCE_ID = Deno.env.get("MAILCHIMP_AUDIENCE_ID") || "YOUR_AUDIENCE_ID";
    
    if (AUDIENCE_ID === "YOUR_AUDIENCE_ID") {
      console.warn('⚠️  MAILCHIMP_AUDIENCE_ID not set, using placeholder');
    }

    // Prepare order items summary for merge fields
    const orderSummary = items.map(item => 
      `${item.name} (${item.quantity}x €${item.price.toFixed(2)})`
    ).join(', ');

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Add/update subscriber in Mailchimp audience
    const mailchimpResponse = await fetch(
      `https://${datacenter}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`,
      {
        method: "POST",
        headers: {
          "Authorization": `apikey ${MAILCHIMP_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email_address: email,
          status: "subscribed",
          merge_fields: {
            FNAME: firstName,
            LNAME: lastName,
            ORDERID: orderId,
            ORDERSUM: orderSummary,
            ORDERTOTAL: `€${totalAmount.toFixed(2)}`
          },
          tags: ["webshop-customer", "order-confirmed"]
        })
      }
    );

    const mailchimpData = await mailchimpResponse.json();

    if (!mailchimpResponse.ok) {
      // If member already exists, try to update instead
      if (mailchimpData.title === "Member Exists") {
        console.log('Member exists, updating instead...');
        
        // Create subscriber hash for existing member
        const crypto = await import("https://deno.land/std@0.190.0/crypto/mod.ts");
        const encoder = new TextEncoder();
        const data = encoder.encode(email.toLowerCase());
        const hashBuffer = await crypto.subtle.digest("MD5", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const subscriberHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const updateResponse = await fetch(
          `https://${datacenter}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members/${subscriberHash}`,
          {
            method: "PATCH",
            headers: {
              "Authorization": `apikey ${MAILCHIMP_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              merge_fields: {
                FNAME: firstName,
                LNAME: lastName,
                ORDERID: orderId,
                ORDERSUM: orderSummary,
                ORDERTOTAL: `€${totalAmount.toFixed(2)}`
              }
            })
          }
        );

        if (!updateResponse.ok) {
          const updateError = await updateResponse.json();
          console.error('Mailchimp update failed:', updateError);
          throw new Error(`Failed to update Mailchimp subscriber: ${updateError.detail || updateError.message || 'Unknown error'}`);
        }

        console.log('✅ Successfully updated existing Mailchimp subscriber');
      } else {
        console.error('Mailchimp API error:', mailchimpData);
        throw new Error(`Mailchimp API error: ${mailchimpData.detail || mailchimpData.message || 'Unknown error'}`);
      }
    } else {
      console.log('✅ Successfully added new Mailchimp subscriber');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order confirmation sent to Mailchimp',
        mailchimp_data: mailchimpData 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in order-confirmation function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);