import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Eye, MousePointer, Clock, TrendingUp, Globe, RefreshCw, Monitor, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DailyData {
  date: string;
  visitors: number;
  pageviews: number;
  pageviewsPerVisit: number;
  bounceRate: number;
  sessionDuration: number;
}

interface BreakdownItem {
  name: string;
  count: number;
}

interface AnalyticsData {
  totals: {
    visitors: number;
    pageviews: number;
    pageviewsPerVisit: number;
    bounceRate: number;
    sessionDuration: number;
  };
  daily: DailyData[];
  breakdown: {
    page: BreakdownItem[];
    source: BreakdownItem[];
    device: BreakdownItem[];
    country: BreakdownItem[];
  };
}

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [timePeriod, setTimePeriod] = useState("7");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();

    // Set up real-time visitor tracking
    let sessionId = sessionStorage.getItem('visitor_session_id');
    if (!sessionId) {
      sessionId = `visitor_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem('visitor_session_id', sessionId);
    }

    const channel = supabase.channel('analytics-visitors', {
      config: {
        presence: {
          key: sessionId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setLiveVisitors(Object.keys(state).length);
      })
      .on('presence', { event: 'join' }, () => {
        const state = channel.presenceState();
        setLiveVisitors(Object.keys(state).length);
      })
      .on('presence', { event: 'leave' }, () => {
        const state = channel.presenceState();
        setLiveVisitors(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            session_id: sessionId,
            online_at: new Date().toISOString(),
            page: window.location.pathname,
          });
        }
      });

    const handleVisibilityChange = () => {
      if (document.hidden) {
        channel.untrack();
      } else {
        channel.track({
          session_id: sessionId,
          online_at: new Date().toISOString(),
          page: window.location.pathname,
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      channel.untrack();
      channel.unsubscribe();
    };
  }, []);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timePeriod));

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kyjgydjsxwqfglocodpi.supabase.co';
      const response = await fetch(
        `${supabaseUrl}/functions/v1/get-analytics?startdate=${startDate.toISOString().split('T')[0]}&enddate=${endDate.toISOString().split('T')[0]}&granularity=daily`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Transform to our format
        const daily: DailyData[] = data.visitors.daily.map((item: any, index: number) => ({
          date: item.date,
          visitors: item.value,
          pageviews: data.pageviews.daily[index]?.value || 0,
          pageviewsPerVisit: data.pageviewsPerVisit.daily[index]?.value || 0,
          bounceRate: data.bounceRate.daily[index]?.value || 0,
          sessionDuration: data.sessionDuration.daily[index]?.value || 0,
        }));

        setAnalytics({
          totals: {
            visitors: data.visitors.total,
            pageviews: data.pageviews.total,
            pageviewsPerVisit: data.pageviewsPerVisit.average,
            bounceRate: data.bounceRate.average,
            sessionDuration: data.sessionDuration.average,
          },
          daily,
          breakdown: {
            page: data.breakdown.page,
            source: data.breakdown.source,
            device: data.breakdown.device,
            country: data.breakdown.country,
          },
        });
      } else {
        console.error("Analytics fetch failed:", response.status);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const handleTimePeriodChange = (value: string) => {
    setTimePeriod(value);
  };

  useEffect(() => {
    if (!loading) {
      fetchAnalytics();
    }
  }, [timePeriod]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          <span className="text-muted-foreground">Analytics laden...</span>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-muted-foreground">Geen analytics data beschikbaar</span>
      </div>
    );
  }

  const chartData = analytics.daily.map((item) => ({
    date: new Date(item.date).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' }),
    Bezoekers: item.visitors,
    Paginaweergaven: item.pageviews,
  }));

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatSource = (source: string) => {
    if (source === 'Direct') return 'Direct';
    try {
      const url = new URL(source);
      return url.hostname.replace('www.', '');
    } catch {
      // Handle android-app:// and other non-standard URLs
      return source.replace('android-app://', '').replace('com.', '').replace(/\/$/, '');
    }
  };

  const getCountryFlag = (code: string) => {
    if (code === 'Unknown') return '🌍';
    try {
      return code.toUpperCase().replace(/./g, char => 
        String.fromCodePoint(127397 + char.charCodeAt(0))
      );
    } catch {
      return '🌍';
    }
  };

  const getCountryName = (code: string) => {
    const countries: Record<string, string> = {
      'NL': 'Nederland', 'US': 'Verenigde Staten', 'DE': 'Duitsland',
      'BE': 'België', 'GB': 'Verenigd Koninkrijk', 'FR': 'Frankrijk',
      'AT': 'Oostenrijk', 'ES': 'Spanje', 'IT': 'Italië',
      'LV': 'Letland', 'CR': 'Costa Rica', 'Unknown': 'Onbekend',
    };
    return countries[code] || code;
  };

  return (
    <div className="space-y-6">
      {/* Header with Live Visitors and Controls */}
      <div className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping opacity-75" />
          </div>
          <span className="text-sm font-medium text-foreground">
            {liveVisitors} live bezoeker{liveVisitors !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Selecteer periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Laatste 24 uur</SelectItem>
              <SelectItem value="7">Laatste 7 dagen</SelectItem>
              <SelectItem value="30">Laatste 30 dagen</SelectItem>
              <SelectItem value="90">Laatste 90 dagen</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Bezoekers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analytics.totals.visitors.toLocaleString('nl-NL')}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5" />
              Paginaweergaven
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analytics.totals.pageviews.toLocaleString('nl-NL')}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Weergaven/bezoek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {analytics.totals.pageviewsPerVisit.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Gem. bezoekduur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatDuration(analytics.totals.sessionDuration)}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Bounce Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analytics.totals.bounceRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bezoekers & Paginaweergaven</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Bezoekers"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="Paginaweergaven"
                  stroke="hsl(var(--accent-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "hsl(var(--accent-foreground))", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Verkeersbronnen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bron</TableHead>
                  <TableHead className="text-right">Bezoekers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.breakdown.source.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{formatSource(item.name)}</TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              Populaire Pagina's
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pagina</TableHead>
                  <TableHead className="text-right">Weergaven</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.breakdown.page.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Countries */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Landen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Land</TableHead>
                  <TableHead className="text-right">Bezoekers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.breakdown.country.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <span className="mr-2">{getCountryFlag(item.name)}</span>
                      {getCountryName(item.name)}
                    </TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Devices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="w-4 h-4 text-primary" />
              Apparaten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.breakdown.device.map((item, index) => {
                const total = analytics.breakdown.device.reduce((sum, d) => sum + d.count, 0);
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                const isDesktop = item.name.toLowerCase().includes('desktop');
                const DeviceIcon = isDesktop ? Monitor : Smartphone;

                return (
                  <div key={index} className="flex items-center gap-3">
                    <DeviceIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium capitalize">
                          {item.name.replace('-', ' ').replace('mobile ios', 'iOS').replace('mobile android', 'Android')}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};