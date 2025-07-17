import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Activity, AlertTriangle, CheckCircle, Clock, TrendingUp, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ApiMetrics {
  total_requests: number;
  success_rate: number;
  avg_response_time: number;
  rate_limit_hits: number;
  top_endpoints: Array<{ endpoint: string; count: number }>;
}

interface WebhookMetrics {
  total_deliveries: number;
  success_rate: number;
  avg_delivery_time: number;
  failed_deliveries: number;
  retry_attempts: number;
}

export function MonitoringDashboard() {
  const { data: apiMetrics, isLoading: apiLoading } = useQuery({
    queryKey: ['api-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_logs')
        .select('endpoint, status_code, response_time_ms, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      const totalRequests = data.length;
      const successfulRequests = data.filter(log => log.status_code >= 200 && log.status_code < 300).length;
      const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
      const avgResponseTime = data.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / totalRequests;
      
      const endpointCounts = data.reduce((acc, log) => {
        acc[log.endpoint] = (acc[log.endpoint] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topEndpoints = Object.entries(endpointCounts)
        .map(([endpoint, count]) => ({ endpoint, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        total_requests: totalRequests,
        success_rate: successRate,
        avg_response_time: avgResponseTime,
        rate_limit_hits: data.filter(log => log.status_code === 429).length,
        top_endpoints: topEndpoints
      } as ApiMetrics;
    }
  });

  const { data: webhookMetrics, isLoading: webhookLoading } = useQuery({
    queryKey: ['webhook-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('status_code, response_time_ms, attempt_number, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      const totalDeliveries = data.length;
      const successfulDeliveries = data.filter(log => log.status_code && log.status_code >= 200 && log.status_code < 300).length;
      const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;
      const avgDeliveryTime = data.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / totalDeliveries;
      const failedDeliveries = totalDeliveries - successfulDeliveries;
      const retryAttempts = data.filter(log => log.attempt_number > 1).length;

      return {
        total_deliveries: totalDeliveries,
        success_rate: successRate,
        avg_delivery_time: avgDeliveryTime,
        failed_deliveries: failedDeliveries,
        retry_attempts: retryAttempts
      } as WebhookMetrics;
    }
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const [apiLogs, webhookLogs] = await Promise.all([
        supabase
          .from('api_logs')
          .select('endpoint, status_code, created_at, error_message')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('webhook_logs')
          .select('event_type, status_code, created_at, error_message')
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      if (apiLogs.error || webhookLogs.error) {
        throw new Error('Failed to fetch activity logs');
      }

      const combinedLogs = [
        ...apiLogs.data.map(log => ({ ...log, type: 'api' })),
        ...webhookLogs.data.map(log => ({ ...log, type: 'webhook' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return combinedLogs.slice(0, 20);
    }
  });

  if (apiLoading || webhookLoading || activityLoading) {
    return <div>Loading monitoring dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Monitoring & Analytics</h2>
        <p className="text-muted-foreground">
          Track API usage, webhook deliveries, and system performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiMetrics?.total_requests || 0}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiMetrics?.success_rate.toFixed(1) || 0}%</div>
            <Progress value={apiMetrics?.success_rate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiMetrics?.avg_response_time.toFixed(0) || 0}ms</div>
            <p className="text-xs text-muted-foreground">API endpoints</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhook Deliveries</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhookMetrics?.total_deliveries || 0}</div>
            <p className="text-xs text-muted-foreground">
              {webhookMetrics?.success_rate.toFixed(1) || 0}% success
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top API Endpoints</CardTitle>
            <CardDescription>Most frequently accessed endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={apiMetrics?.top_endpoints || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="endpoint" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Performance metrics overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">API Availability</span>
                <span className="text-sm font-medium">{apiMetrics?.success_rate.toFixed(1) || 0}%</span>
              </div>
              <Progress value={apiMetrics?.success_rate || 0} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Webhook Success Rate</span>
                <span className="text-sm font-medium">{webhookMetrics?.success_rate.toFixed(1) || 0}%</span>
              </div>
              <Progress value={webhookMetrics?.success_rate || 0} />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{apiMetrics?.rate_limit_hits || 0}</div>
                <div className="text-xs text-muted-foreground">Rate Limits Hit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{webhookMetrics?.retry_attempts || 0}</div>
                <div className="text-xs text-muted-foreground">Retry Attempts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest API calls and webhook deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant={activity.type === 'api' ? 'default' : 'secondary'}>
                      {activity.type.toUpperCase()}
                    </Badge>
                    <Badge variant={
                      activity.status_code >= 200 && activity.status_code < 300 ? 'default' :
                      activity.status_code >= 400 ? 'destructive' : 'secondary'
                    }>
                      {activity.status_code || 'Pending'}
                    </Badge>
                  </div>
                  <div>
                    <div className="font-medium">
                      {activity.type === 'api' ? (activity as any).endpoint : (activity as any).event_type}
                    </div>
                    {activity.error_message && (
                      <div className="text-sm text-red-600">{activity.error_message}</div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}