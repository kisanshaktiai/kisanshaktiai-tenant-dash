import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert'; // Alert component for notifications
import { 
  Activity, 
  Database, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Zap,
  HardDrive,
  Globe
} from 'lucide-react';
import { useNDVIApiMonitoring } from '@/hooks/data/useNDVIApiMonitoring';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = {
  success: '#10b981',
  failed: '#ef4444',
  pending: '#f59e0b',
  processing: '#3b82f6'
};

export const NDVIApiMonitoring: React.FC = () => {
  const {
    healthData,
    healthLoading,
    globalStats,
    statsLoading,
    isHealthy
  } = useNDVIApiMonitoring();

  const healthStatus = healthLoading ? 'checking' : (isHealthy ? 'healthy' : 'unhealthy');

  const getStatusColor = () => {
    switch (healthStatus) {
      case 'healthy': return 'text-green-500';
      case 'unhealthy': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getStatusIcon = () => {
    switch (healthStatus) {
      case 'healthy': return <CheckCircle2 className="w-5 h-5" />;
      case 'unhealthy': return <XCircle className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5 animate-pulse" />;
    }
  };

  const requestDistribution = globalStats ? [
    { name: 'Completed', value: globalStats.completed, color: COLORS.success },
    { name: 'Failed', value: globalStats.failed, color: COLORS.failed },
    { name: 'Queued', value: globalStats.queued, color: COLORS.pending },
    { name: 'Processing', value: globalStats.processing, color: COLORS.processing },
  ] : [];

  if (statsLoading || healthLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Service Status Banner */}
      <Card className="p-6 border-l-4" style={{ borderLeftColor: healthStatus === 'healthy' ? COLORS.success : COLORS.failed }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={getStatusColor()}>
              {getStatusIcon()}
            </div>
            <div>
              <h3 className="text-lg font-semibold">NDVI Land Processor API</h3>
              <p className="text-sm text-muted-foreground">
                https://ndvi-land-api.onrender.com • API v3.6
              </p>
            </div>
          </div>
          <Badge variant={healthStatus === 'healthy' ? 'default' : 'destructive'} className="text-base px-4 py-2">
            {healthStatus === 'healthy' ? '● Online' : '○ Offline'}
          </Badge>
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 hover-scale transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-3xl font-bold mt-2">{globalStats?.total_requests || 0}</p>
            </div>
            <Activity className="w-10 h-10 text-primary opacity-20" />
          </div>
        </Card>

        <Card className="p-6 hover-scale transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-3xl font-bold mt-2 text-green-500">
                {globalStats?.completed && globalStats?.total_requests ? 
                  `${((globalStats.completed / globalStats.total_requests) * 100).toFixed(1)}%` : '0%'}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 hover-scale transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Queue Status</p>
              <p className="text-3xl font-bold mt-2">{(globalStats?.queued || 0) + (globalStats?.processing || 0)}</p>
            </div>
            <Clock className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 hover-scale transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Failed Jobs</p>
              <p className="text-3xl font-bold mt-2">{globalStats?.failed || 0}</p>
            </div>
            <Database className="w-10 h-10 text-purple-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Request Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={requestDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {requestDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Request Status Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Request Status
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={requestDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {requestDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Current Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Jobs</span>
                <span className="text-2xl font-bold">{(globalStats?.queued || 0) + (globalStats?.processing || 0)}</span>
              </div>
              <Progress value={((((globalStats?.queued || 0) + (globalStats?.processing || 0)) / Math.max(globalStats?.total_requests || 1, 1)) * 100)} />
              <p className="text-sm text-muted-foreground">
                {((((globalStats?.queued || 0) + (globalStats?.processing || 0)) / Math.max(globalStats?.total_requests || 1, 1) * 100)).toFixed(1)}% of total requests
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Processing Efficiency</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Completed</span>
                  <Badge variant="default" className="bg-green-500">{globalStats?.completed || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Failed</span>
                  <Badge variant="destructive">{globalStats?.failed || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Queued</span>
                  <Badge variant="secondary">{globalStats?.queued || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Processing</span>
                  <Badge variant="outline">{globalStats?.processing || 0}</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Success Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className="text-sm font-medium">
                      {globalStats?.completed && globalStats?.total_requests ? 
                        `${((globalStats.completed / globalStats.total_requests) * 100).toFixed(1)}%` : '0%'}
                    </span>
                  </div>
                  <Progress value={globalStats?.completed && globalStats?.total_requests ? 
                    (globalStats.completed / globalStats.total_requests) * 100 : 0} />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary" />
              API v3.6 Storage
            </h3>
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Storage metrics are managed by the backend API. NDVI data is stored in Backblaze B2 cloud storage.
                </AlertDescription>
              </Alert>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* API Endpoints */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Available API Endpoints
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { method: 'GET', path: '/api/v1/health', desc: 'Health check - verify API status' },
            { method: 'POST', path: '/api/v1/ndvi/requests', desc: 'Create NDVI processing request' },
            { method: 'GET', path: '/api/v1/ndvi/requests', desc: 'Get all NDVI requests list' },
            { method: 'GET', path: '/api/v1/ndvi/requests/{id}', desc: 'Get specific request status' },
            { method: 'GET', path: '/api/v1/ndvi/data', desc: 'Get NDVI data summary' },
            { method: 'GET', path: '/api/v1/ndvi/data/{land_id}', desc: 'Get land NDVI history' },
            { method: 'GET', path: '/api/v1/ndvi/thumbnail/{land_id}', desc: 'Get NDVI thumbnail image' },
            { method: 'GET', path: '/api/v1/ndvi/stats/global', desc: 'Get global statistics' },
            { method: 'GET', path: '/api/v1/ndvi/queue/status', desc: 'Check queue status' },
            { method: 'POST', path: '/api/v1/ndvi/queue/retry/{id}', desc: 'Retry failed request' },
          ].map((endpoint, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'} className="min-w-[60px] justify-center">
                {endpoint.method}
              </Badge>
              <div className="flex-1">
                <code className="text-sm font-mono text-foreground">{endpoint.path}</code>
                <p className="text-xs text-muted-foreground mt-1">{endpoint.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};