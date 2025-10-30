import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { useRealTimeDashboard } from '@/hooks/data/useRealTimeDashboard';
import { 
  Users, 
  Building, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  MapPin,
  Zap,
  RefreshCw,
  Download,
  Filter,
  BarChart3,
  LineChart,
  PieChart,
  Sparkles,
  Target,
  DollarSign,
  ShoppingCart,
  Leaf,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { getChartColors } from '@/utils/chartColors';

// Get properly formatted chart colors
const CHART_COLORS = getChartColors();

const EnhancedDashboard = () => {
  const { data, isLoading, error, refetch, isLive, lastUpdate } = useRealTimeDashboard();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh every 30 seconds when enabled
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetch();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refetch]);

  // Mock data for charts (will be replaced with real data from API)
  const farmersGrowthData = [
    { month: 'Jan', farmers: 120, active: 90 },
    { month: 'Feb', farmers: 180, active: 140 },
    { month: 'Mar', farmers: 250, active: 200 },
    { month: 'Apr', farmers: 320, active: 280 },
    { month: 'May', farmers: 410, active: 360 },
    { month: 'Jun', farmers: 500, active: 450 },
  ];

  const productCategoryData = [
    { name: 'Seeds', value: 35, count: 120 },
    { name: 'Fertilizers', value: 28, count: 95 },
    { name: 'Pesticides', value: 22, count: 75 },
    { name: 'Equipment', value: 15, count: 50 },
  ];

  const revenueData = [
    { day: 'Mon', revenue: 12000, orders: 45 },
    { day: 'Tue', revenue: 15000, orders: 52 },
    { day: 'Wed', revenue: 18000, orders: 61 },
    { day: 'Thu', revenue: 14000, orders: 48 },
    { day: 'Fri', revenue: 22000, orders: 73 },
    { day: 'Sat', revenue: 25000, orders: 85 },
    { day: 'Sun', revenue: 20000, orders: 68 },
  ];

  const performanceMetrics = [
    { metric: 'Engagement', value: 85 },
    { metric: 'Conversion', value: 72 },
    { metric: 'Retention', value: 90 },
    { metric: 'Satisfaction', value: 88 },
    { metric: 'Efficiency', value: 78 },
  ];

  // Calculate dynamic metrics
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isUp: true };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change).toFixed(1), isUp: change >= 0 };
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Real-time activity feed
  const activityFeed = [
    { id: 1, action: 'New farmer registered', user: 'Rajesh Kumar', time: '2 min ago', type: 'success', icon: Users },
    { id: 2, action: 'Product order placed', user: 'Priya Sharma', time: '5 min ago', type: 'info', icon: ShoppingCart },
    { id: 3, action: 'Campaign launched', user: 'Admin', time: '10 min ago', type: 'success', icon: Zap },
    { id: 4, action: 'Low stock alert', product: 'NPK Fertilizer', time: '15 min ago', type: 'warning', icon: AlertTriangle },
    { id: 5, action: 'Dealer activated', user: 'AgroMart Delhi', time: '20 min ago', type: 'info', icon: Building },
  ];

  // KPI Cards with real data
  const kpiCards = [
    {
      title: 'Total Farmers',
      value: data?.farmers?.total || 0,
      previousValue: data?.farmers?.total ? data.farmers.total - (data.farmers.new_this_week || 0) : 0,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      subtitle: `${data?.farmers?.active || 0} active`,
      sparkData: [10, 20, 15, 30, 25, 40, 35]
    },
    {
      title: 'Active Dealers',
      value: data?.dealers?.active || 0,
      previousValue: data?.dealers?.total || 0,
      icon: Building,
      color: 'text-success',
      bgColor: 'bg-success/10',
      subtitle: `${data?.dealers?.total || 0} total`,
      sparkData: [5, 10, 8, 15, 12, 18, 20]
    },
    {
      title: 'Products',
      value: data?.products?.total || 0,
      previousValue: data?.products?.total || 0,
      icon: Package,
      color: 'text-info',
      bgColor: 'bg-info/10',
      subtitle: `${data?.products?.categories || 0} categories`,
      sparkData: [30, 35, 32, 38, 36, 40, 42]
    },
    {
      title: 'Active Campaigns',
      value: data?.campaigns?.active || 0,
      previousValue: data?.campaigns?.total || 0,
      icon: Zap,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      subtitle: `${data?.campaigns?.total || 0} total`,
      sparkData: [2, 4, 3, 5, 4, 6, 5]
    }
  ];

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Dashboard Error</CardTitle>
            <CardDescription>Unable to load dashboard data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error?.message || 'An error occurred'}</p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-background/50">
      {/* Header with AI Insights */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 border backdrop-blur-sm">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5))]" />
        <div className="relative p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10 backdrop-blur-sm">
                  <Cpu className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    AI-Powered Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-1 flex items-center gap-2">
                    Real-time insights for your agricultural network
                    {isLive && <LiveIndicator isConnected={isLive} />}
                  </p>
                </div>
              </div>
              
              {/* AI Insights Banner */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-background/80 backdrop-blur-sm border">
                <Sparkles className="h-5 w-5 text-warning animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm font-medium">AI Insight of the Day</p>
                  <p className="text-xs text-muted-foreground">
                    Farmer engagement is 23% higher on weekends. Consider scheduling campaigns accordingly.
                  </p>
                </div>
                <Button size="sm" variant="ghost">Learn More</Button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Today</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="icon"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="relative"
              >
                <RefreshCw className={cn("h-4 w-4", autoRefresh && "animate-spin")} />
              </Button>
              
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards with Sparklines */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card, index) => {
          const trend = calculateTrend(card.value, card.previousValue);
          return (
            <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-muted/50">
              <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -translate-y-16 translate-x-16", card.bgColor)} />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className={cn("p-2 rounded-lg", card.bgColor)}>
                    <card.icon className={cn("h-4 w-4", card.color)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold">
                      {isLoading ? <Skeleton className="h-8 w-20" /> : formatNumber(card.value)}
                    </span>
                    <div className={cn("flex items-center gap-1 text-xs font-medium", 
                      trend.isUp ? "text-success" : "text-destructive")}>
                      {trend.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {trend.value}%
                    </div>
                  </div>
                  
                  <div className="h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={card.sparkData.map((v, i) => ({ value: v, index: i }))}>
                        <defs>
                          <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={CHART_COLORS.primary}
                          strokeWidth={2}
                          fill={`url(#gradient-${index})`}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Area */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-fit">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts
            {data?.products?.out_of_stock && data.products.out_of_stock > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1">
                {data.products.out_of_stock}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Farmers Growth Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Farmer Growth Trend</CardTitle>
                    <CardDescription>Monthly registration and activity</CardDescription>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +24%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={farmersGrowthData}>
                    <defs>
                      <linearGradient id="farmersGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="farmers" 
                      stroke={CHART_COLORS.primary}
                      strokeWidth={2}
                      fill="url(#farmersGradient)"
                      name="Total Farmers"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="active" 
                      stroke={CHART_COLORS.success}
                      strokeWidth={2}
                      fill="url(#activeGradient)"
                      name="Active Farmers"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Product Distribution */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Product Categories</CardTitle>
                    <CardDescription>Distribution by category</CardDescription>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={productCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {productCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Analytics */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Revenue & Order Analytics</CardTitle>
                  <CardDescription>Weekly performance overview</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-sm">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-secondary" />
                    <span className="text-sm">Orders</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar yAxisId="left" dataKey="revenue" fill={CHART_COLORS.primary} radius={[8, 8, 0, 0]} />
                  <Bar yAxisId="right" dataKey="orders" fill={CHART_COLORS.secondary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Activity Feed */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Real-time Activity Feed
                  </CardTitle>
                  <Badge variant="outline" className="gap-1">
                    <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityFeed.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={cn(
                        "p-2 rounded-lg",
                        activity.type === 'success' && "bg-success/10",
                        activity.type === 'warning' && "bg-warning/10",
                        activity.type === 'info' && "bg-info/10"
                      )}>
                        <activity.icon className={cn(
                          "h-4 w-4",
                          activity.type === 'success' && "text-success",
                          activity.type === 'warning' && "text-warning",
                          activity.type === 'info' && "text-info"
                        )} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user || activity.product} • {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4">
                  View All Activity
                </Button>
              </CardContent>
            </Card>

            {/* Recent Farmers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Recent Farmers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.farmers?.recent?.slice(0, 5).map((farmer: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {farmer.name?.charAt(0) || 'F'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{farmer.name || 'New Farmer'}</p>
                        <p className="text-xs text-muted-foreground">{farmer.location || 'Location N/A'}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">New</Badge>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent farmers
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Performance Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceMetrics}>
                    <PolarGrid className="stroke-muted" />
                    <PolarAngleAxis dataKey="metric" className="text-xs" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Current" dataKey="value" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  System Health Monitor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    { name: 'API Performance', value: 99.9, status: 'operational' },
                    { name: 'Database Response', value: 98.5, status: 'operational' },
                    { name: 'Real-time Sync', value: 100, status: 'operational' },
                    { name: 'Edge Functions', value: 97.8, status: 'operational' },
                    { name: 'Storage Services', value: 99.2, status: 'operational' },
                  ].map((service, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{service.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{service.value}%</span>
                          <Badge variant="outline" className="gap-1">
                            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                            {service.status}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={service.value} className="h-2" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-muted-foreground">
                    Last checked: {lastUpdate ? format(new Date(lastUpdate), 'HH:mm:ss') : 'Never'}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            {/* AI Insights */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-warning" />
                  AI-Generated Insights
                </CardTitle>
                <CardDescription>Powered by advanced analytics and machine learning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      title: 'Optimal Campaign Timing',
                      insight: 'Launch campaigns between 6-8 PM for 35% higher engagement',
                      confidence: 92,
                      action: 'Schedule Campaign',
                      icon: Calendar,
                      color: 'text-primary'
                    },
                    {
                      title: 'Product Recommendation',
                      insight: 'Organic fertilizers showing 45% increased demand',
                      confidence: 88,
                      action: 'Update Inventory',
                      icon: Package,
                      color: 'text-success'
                    },
                    {
                      title: 'Farmer Retention Risk',
                      insight: '12 farmers showing decreased activity patterns',
                      confidence: 78,
                      action: 'Start Engagement',
                      icon: Users,
                      color: 'text-warning'
                    },
                    {
                      title: 'Revenue Opportunity',
                      insight: 'Bundle deals could increase revenue by ₹2.3L/month',
                      confidence: 85,
                      action: 'Create Bundle',
                      icon: DollarSign,
                      color: 'text-info'
                    }
                  ].map((insight, index) => (
                    <Card key={index} className="border-muted/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn("p-2 rounded-lg bg-muted")}>
                              <insight.icon className={cn("h-4 w-4", insight.color)} />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">{insight.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Progress value={insight.confidence} className="h-1 w-20" />
                                <span className="text-xs text-muted-foreground">{insight.confidence}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{insight.insight}</p>
                        <Button size="sm" variant="outline" className="w-full">
                          {insight.action}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                System Alerts & Notifications
              </CardTitle>
              <CardDescription>Important updates requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.products?.out_of_stock && data.products.out_of_stock > 0 && (
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-warning/20 bg-warning/5">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-warning">Low Stock Alert</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {data.products.out_of_stock} products are running low or out of stock
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Button size="sm" variant="outline">View Products</Button>
                        <Button size="sm">Reorder Now</Button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3 p-4 rounded-lg border border-info/20 bg-info/5">
                  <Activity className="h-5 w-5 text-info mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-info">Campaign Performance</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your latest campaign achieved 85% open rate, exceeding targets by 15%
                    </p>
                    <Button size="sm" variant="ghost" className="mt-3">View Details</Button>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 rounded-lg border border-success/20 bg-success/5">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-success">All Systems Operational</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      All services are running smoothly with 99.9% uptime this month
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedDashboard;