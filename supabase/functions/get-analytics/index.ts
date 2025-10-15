import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_PROJECT_ID = "ca63ba2d-75b2-41d2-8112-bddb35c48fec";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const url = new URL(req.url);
    const startdate = url.searchParams.get('startdate') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const enddate = url.searchParams.get('enddate') || new Date().toISOString().split('T')[0];
    const granularity = url.searchParams.get('granularity') || 'daily';

    // Note: This is a placeholder. In production, you would need to:
    // 1. Implement your own analytics tracking (e.g., using Supabase Edge Functions to log page views)
    // 2. Or integrate with a third-party analytics service (Google Analytics, Plausible, etc.)
    // 3. The Lovable analytics are internal and not directly accessible via API
    
    // For now, return mock data based on the structure
    const mockData = {
      visitors: {
        total: 30,
        daily: [
          { date: '2025-10-08', value: 4 },
          { date: '2025-10-09', value: 6 },
          { date: '2025-10-10', value: 3 },
          { date: '2025-10-11', value: 5 },
          { date: '2025-10-12', value: 3 },
          { date: '2025-10-13', value: 2 },
          { date: '2025-10-14', value: 3 },
          { date: '2025-10-15', value: 4 },
        ],
      },
      pageviews: {
        total: 65,
        daily: [
          { date: '2025-10-08', value: 10 },
          { date: '2025-10-09', value: 7 },
          { date: '2025-10-10', value: 3 },
          { date: '2025-10-11', value: 11 },
          { date: '2025-10-12', value: 3 },
          { date: '2025-10-13', value: 15 },
          { date: '2025-10-14', value: 7 },
          { date: '2025-10-15', value: 9 },
        ],
      },
      pageviewsPerVisit: {
        average: 2.17,
        daily: [
          { date: '2025-10-08', value: 2.5 },
          { date: '2025-10-09', value: 1.17 },
          { date: '2025-10-10', value: 1 },
          { date: '2025-10-11', value: 2.2 },
          { date: '2025-10-12', value: 1 },
          { date: '2025-10-13', value: 7.5 },
          { date: '2025-10-14', value: 2.33 },
          { date: '2025-10-15', value: 2.25 },
        ],
      },
      sessionDuration: {
        average: 25,
        daily: [
          { date: '2025-10-08', value: 25.5 },
          { date: '2025-10-09', value: 0.33 },
          { date: '2025-10-10', value: 0 },
          { date: '2025-10-11', value: 13.8 },
          { date: '2025-10-12', value: 0 },
          { date: '2025-10-13', value: 102 },
          { date: '2025-10-14', value: 35 },
          { date: '2025-10-15', value: 26 },
        ],
      },
      bounceRate: {
        average: 67,
        daily: [
          { date: '2025-10-08', value: 25 },
          { date: '2025-10-09', value: 83 },
          { date: '2025-10-10', value: 100 },
          { date: '2025-10-11', value: 60 },
          { date: '2025-10-12', value: 100 },
          { date: '2025-10-13', value: 50 },
          { date: '2025-10-14', value: 67 },
          { date: '2025-10-15', value: 50 },
        ],
      },
      breakdown: {
        page: [
          { name: '/', count: 29 },
          { name: '/onze-partners', count: 4 },
          { name: '/webshop', count: 2 },
          { name: '/dashboard', count: 1 },
        ],
        source: [
          { name: 'Direct', count: 12 },
          { name: 'com.linkedin.android', count: 6 },
          { name: 'linkedin.com', count: 5 },
          { name: 'google.com', count: 3 },
          { name: 'm.facebook.com', count: 2 },
          { name: 'l.instagram.com', count: 1 },
          { name: 'facebook.com', count: 1 },
        ],
        device: [
          { name: 'mobile-android', count: 14 },
          { name: 'mobile-ios', count: 9 },
          { name: 'desktop', count: 6 },
          { name: 'bot', count: 1 },
        ],
        country: [
          { name: 'NL', count: 24 },
          { name: 'US', count: 4 },
          { name: 'Unknown', count: 1 },
          { name: 'ES', count: 1 },
        ],
      },
    };

    return new Response(JSON.stringify(mockData), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error in get-analytics:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});
