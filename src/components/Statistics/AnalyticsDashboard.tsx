import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Eye, MousePointer, Clock, TrendingUp, Globe } from "lucide-react";

interface AnalyticsData {
  visitors: { total: number; daily: Array<{ date: string; value: number }> };
  pageviews: { total: number; daily: Array<{ date: string; value: number }> };
  pageviewsPerVisit: { average: number; daily: Array<{ date: string; value: number }> };
  sessionDuration: { average: number; daily: Array<{ date: string; value: number }> };
  bounceRate: { average: number; daily: Array<{ date: string; value: number }> };
  breakdown: {
    page: Array<{ name: string; count: number }>;
    source: Array<{ name: string; count: number }>;
    device: Array<{ name: string; count: number }>;
    country: Array<{ name: string; count: number }>;
  };
}

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Get last 7 days of data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const response = await fetch(
        `https://pkvayugxzgkoipclcpli.supabase.co/functions/v1/get-analytics?startdate=${startDate.toISOString().split('T')[0]}&enddate=${endDate.toISOString().split('T')[0]}&granularity=daily`
      );
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="flex items-center justify-center h-64">No analytics data available</div>;
  }

  const chartData = analytics.visitors.daily.map((item, index) => ({
    date: new Date(item.date).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' }),
    visitors: item.value,
    pageviews: analytics.pageviews.daily[index]?.value || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{analytics.visitors.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MousePointer className="w-4 h-4" />
              Pageviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{analytics.pageviews.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Views Per Visit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {analytics.pageviewsPerVisit.average.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Visit Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{analytics.sessionDuration.average}s</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Bounce Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{analytics.bounceRate.average}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Visitor Trends</CardTitle>
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
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
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
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Visitors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.breakdown.source.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead className="text-right">Visitors</TableHead>
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Visitors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.breakdown.country.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Devices */}
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead className="text-right">Visitors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.breakdown.device.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium capitalize">{item.name.replace('-', ' ')}</TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
