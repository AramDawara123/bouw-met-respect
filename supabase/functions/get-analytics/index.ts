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

    // Generate dynamic data based on date range
    const start = new Date(startdate);
    const end = new Date(enddate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generate daily data points
    const dailyData = [];
    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      dailyData.push({
        date: currentDate.toISOString().split('T')[0],
        visitors: Math.floor(Math.random() * 8) + 2, // 2-10 visitors per day
        pageviews: Math.floor(Math.random() * 12) + 3, // 3-15 pageviews per day
        pageviewsPerVisit: Math.random() * 5 + 1, // 1-6 views per visit
        sessionDuration: Math.floor(Math.random() * 80) + 10, // 10-90 seconds
        bounceRate: Math.floor(Math.random() * 60) + 30, // 30-90%
      });
    }

    const totalVisitors = dailyData.reduce((sum, day) => sum + day.visitors, 0);
    const totalPageviews = dailyData.reduce((sum, day) => sum + day.pageviews, 0);
    const avgPageviewsPerVisit = totalPageviews / totalVisitors;
    const avgSessionDuration = Math.floor(dailyData.reduce((sum, day) => sum + day.sessionDuration, 0) / dailyData.length);
    const avgBounceRate = Math.floor(dailyData.reduce((sum, day) => sum + day.bounceRate, 0) / dailyData.length);
    
    const mockData = {
      visitors: {
        total: totalVisitors,
        daily: dailyData.map(d => ({ date: d.date, value: d.visitors })),
      },
      pageviews: {
        total: totalPageviews,
        daily: dailyData.map(d => ({ date: d.date, value: d.pageviews })),
      },
      pageviewsPerVisit: {
        average: Number(avgPageviewsPerVisit.toFixed(2)),
        daily: dailyData.map(d => ({ date: d.date, value: Number(d.pageviewsPerVisit.toFixed(2)) })),
      },
      sessionDuration: {
        average: avgSessionDuration,
        daily: dailyData.map(d => ({ date: d.date, value: d.sessionDuration })),
      },
      bounceRate: {
        average: avgBounceRate,
        daily: dailyData.map(d => ({ date: d.date, value: d.bounceRate })),
      },
      breakdown: {
        page: [
          { name: '/', count: Math.floor(totalVisitors * 0.45) },
          { name: '/onze-partners', count: Math.floor(totalVisitors * 0.2) },
          { name: '/webshop', count: Math.floor(totalVisitors * 0.15) },
          { name: '/dashboard', count: Math.floor(totalVisitors * 0.1) },
          { name: '/contact', count: Math.floor(totalVisitors * 0.1) },
        ],
        source: [
          { name: 'Direct', count: Math.floor(totalVisitors * 0.35) },
          { name: 'com.linkedin.android', count: Math.floor(totalVisitors * 0.2) },
          { name: 'linkedin.com', count: Math.floor(totalVisitors * 0.15) },
          { name: 'google.com', count: Math.floor(totalVisitors * 0.15) },
          { name: 'm.facebook.com', count: Math.floor(totalVisitors * 0.1) },
          { name: 'facebook.com', count: Math.floor(totalVisitors * 0.05) },
        ],
        device: [
          { name: 'mobile-android', count: Math.floor(totalVisitors * 0.4) },
          { name: 'desktop', count: Math.floor(totalVisitors * 0.35) },
          { name: 'mobile-ios', count: Math.floor(totalVisitors * 0.25) },
        ],
        country: [
          { name: 'NL', count: Math.floor(totalVisitors * 0.75) },
          { name: 'BE', count: Math.floor(totalVisitors * 0.1) },
          { name: 'DE', count: Math.floor(totalVisitors * 0.08) },
          { name: 'US', count: Math.floor(totalVisitors * 0.05) },
          { name: 'Unknown', count: Math.floor(totalVisitors * 0.02) },
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
