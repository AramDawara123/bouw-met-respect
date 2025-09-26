// Netlify Edge Function - Proxy for Mollie Webhook
export default async (request, context) => {
  console.log(`[NETLIFY PROXY] ${request.method} request to mollie-webhook`);
  
  // Only handle the specific webhook path
  if (!request.url.includes('/api/mollie-webhook')) {
    return new Response('Not found', { status: 404 });
  }

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    });
  }

  try {
    // Forward request to Supabase edge function
    const supabaseUrl = 'https://pkvayugxzgkoipclcpli.supabase.co/functions/v1/mollie-webhook';
    
    console.log(`[NETLIFY PROXY] Forwarding to: ${supabaseUrl}`);
    
    // Copy headers from original request
    const headers = new Headers();
    for (const [key, value] of request.headers.entries()) {
      headers.set(key, value);
    }
    
    // Forward the request
    const response = await fetch(supabaseUrl, {
      method: request.method,
      headers: headers,
      body: request.body
    });
    
    console.log(`[NETLIFY PROXY] Supabase response status: ${response.status}`);
    
    // Return the response from Supabase
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': response.headers.get('Content-Type') || 'application/json'
      }
    });
    
  } catch (error) {
    console.error('[NETLIFY PROXY] Error forwarding request:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Proxy error',
      message: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Configure which paths this function should handle
export const config = {
  path: "/api/mollie-webhook"
};