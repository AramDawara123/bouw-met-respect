import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const startdate = url.searchParams.get('startdate') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const enddate = url.searchParams.get('enddate') || new Date().toISOString().split('T')[0];

    console.log(`Fetching analytics from ${startdate} to ${enddate}`);

    // Fetch analytics events from database, excluding lovable.dev referrers
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', `${startdate}T00:00:00.000Z`)
      .lte('created_at', `${enddate}T23:59:59.999Z`)
      .not('referrer', 'like', '%lovable.dev%')
      .not('referrer', 'like', '%lovableproject.com%');

    if (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }

    console.log(`Found ${events?.length || 0} analytics events`);

    // Process events to generate analytics
    const pageviews = events?.filter(e => e.event_type === 'pageview') || [];
    const uniqueSessions = new Set(pageviews.map(e => e.session_id));
    const totalVisitors = uniqueSessions.size;
    const totalPageviews = pageviews.length;

    // Group by date
    const dailyStats = new Map();
    const start = new Date(startdate);
    const end = new Date(enddate);
    
    // Initialize all dates in range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyStats.set(dateStr, {
        visitors: new Set(),
        pageviews: 0,
        sessions: new Map(),
      });
    }

    // Aggregate events by date
    pageviews.forEach(event => {
      const date = event.created_at.split('T')[0];
      if (dailyStats.has(date)) {
        const stats = dailyStats.get(date);
        stats.visitors.add(event.session_id);
        stats.pageviews++;
        
        if (!stats.sessions.has(event.session_id)) {
          stats.sessions.set(event.session_id, []);
        }
        stats.sessions.get(event.session_id).push(event);
      }
    });

    // Calculate daily metrics
    const dailyData = Array.from(dailyStats.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, stats]) => {
        const visitors = stats.visitors.size;
        const pageviewsCount = stats.pageviews;
        const pageviewsPerVisit = visitors > 0 ? pageviewsCount / visitors : 0;
        
        return {
          date,
          visitors,
          pageviews: pageviewsCount,
          pageviewsPerVisit: Number(pageviewsPerVisit.toFixed(2)),
        };
      });

    // Calculate averages
    const avgPageviewsPerVisit = totalVisitors > 0 ? totalPageviews / totalVisitors : 0;

    // Group by page
    const pageBreakdown = pageviews.reduce((acc, event) => {
      const page = event.page_path || '/';
      acc[page] = (acc[page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by referrer (source)
    const sourceBreakdown = pageviews.reduce((acc, event) => {
      const source = event.referrer || 'Direct';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by device
    const deviceBreakdown = pageviews.reduce((acc, event) => {
      const device = event.device_type || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by country
    const countryBreakdown = pageviews.reduce((acc, event) => {
      const country = event.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const analyticsData = {
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
        daily: dailyData.map(d => ({ date: d.date, value: d.pageviewsPerVisit })),
      },
      sessionDuration: {
        average: 0,
        daily: dailyData.map(d => ({ date: d.date, value: 0 })),
      },
      bounceRate: {
        average: 0,
        daily: dailyData.map(d => ({ date: d.date, value: 0 })),
      },
      breakdown: {
        page: Object.entries(pageBreakdown)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([name, count]) => ({ name, count })),
        source: Object.entries(sourceBreakdown)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([name, count]) => ({ name, count })),
        device: Object.entries(deviceBreakdown)
          .sort(([, a], [, b]) => b - a)
          .map(([name, count]) => ({ name, count })),
        country: Object.entries(countryBreakdown)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([name, count]) => ({ name, count })),
      },
    };

    return new Response(JSON.stringify(analyticsData), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in get-analytics:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});
