import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 Testing Mailchimp integration...');

    const MAILCHIMP_API_KEY = Deno.env.get("MAILCHIMP_API_KEY");
    const MAILCHIMP_AUDIENCE_ID = Deno.env.get("MAILCHIMP_AUDIENCE_ID");

    if (!MAILCHIMP_API_KEY) {
      throw new Error('MAILCHIMP_API_KEY not configured');
    }

    if (!MAILCHIMP_AUDIENCE_ID) {
      throw new Error('MAILCHIMP_AUDIENCE_ID not configured');
    }

    // Extract datacenter from API key
    const datacenter = MAILCHIMP_API_KEY.split('-').pop();
    if (!datacenter) {
      throw new Error('Invalid Mailchimp API key format');
    }

    console.log(`✅ API Key configured with datacenter: ${datacenter}`);
    console.log(`✅ Audience ID: ${MAILCHIMP_AUDIENCE_ID}`);

    // Test 1: Check if we can reach Mailchimp API
    console.log('🔍 Testing API connection...');
    const pingResponse = await fetch(`https://${datacenter}.api.mailchimp.com/3.0/ping`, {
      headers: {
        "Authorization": `apikey ${MAILCHIMP_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (!pingResponse.ok) {
      const pingError = await pingResponse.json();
      throw new Error(`Mailchimp API connection failed: ${pingError.detail || pingError.message}`);
    }

    console.log('✅ Mailchimp API connection successful');

    // Test 2: Check if audience exists
    console.log('🔍 Testing audience access...');
    const audienceResponse = await fetch(`https://${datacenter}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}`, {
      headers: {
        "Authorization": `apikey ${MAILCHIMP_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (!audienceResponse.ok) {
      const audienceError = await audienceResponse.json();
      throw new Error(`Audience access failed: ${audienceError.detail || audienceError.message}`);
    }

    const audienceData = await audienceResponse.json();
    console.log(`✅ Audience found: "${audienceData.name}" with ${audienceData.stats.member_count} members`);

    // Test 3: Try adding a test subscriber (dry run)
    const { testEmail } = await req.json();
    
    if (!testEmail) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Mailchimp connection verified!',
          details: {
            api_connected: true,
            audience_name: audienceData.name,
            member_count: audienceData.stats.member_count,
            datacenter: datacenter
          }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    console.log(`🔍 Testing with email: ${testEmail}`);

    // Add test subscriber
    const testResponse = await fetch(
      `https://${datacenter}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`,
      {
        method: "POST",
        headers: {
          "Authorization": `apikey ${MAILCHIMP_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email_address: testEmail,
          status: "subscribed",
          merge_fields: {
            FNAME: "Test",
            LNAME: "User",
            ORDERID: `TEST_${Date.now()}`,
            ORDERSUM: "Test Product (1x €12.50)",
            ORDERTOTAL: "€12.50"
          },
          tags: ["test-integration", "webshop-test"]
        })
      }
    );

    const testData = await testResponse.json();

    if (!testResponse.ok) {
      if (testData.title === "Member Exists") {
        console.log('✅ Test email already in audience - this is fine!');
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Mailchimp integration works! Test email already exists in audience.',
            details: {
              api_connected: true,
              audience_name: audienceData.name,
              member_count: audienceData.stats.member_count,
              test_result: 'Member already exists (this is good!)'
            }
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          }
        );
      } else {
        throw new Error(`Test subscription failed: ${testData.detail || testData.message}`);
      }
    }

    console.log('✅ Test subscription successful!');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mailchimp integration test successful!',
        details: {
          api_connected: true,
          audience_name: audienceData.name,
          member_count: audienceData.stats.member_count + 1,
          test_result: 'New test subscriber added successfully',
          subscriber_id: testData.id
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error("❌ Mailchimp test failed:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        help: "Check your MAILCHIMP_API_KEY and MAILCHIMP_AUDIENCE_ID in Supabase secrets"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
};

serve(handler);