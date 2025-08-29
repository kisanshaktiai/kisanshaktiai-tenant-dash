
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  ArrowUpRight,
  Activity,
  Calendar,
  MapPin,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardData {
  farmers: { total: number; active: number; new: number };
  dealers: { total: number; active: number; performance: number };
  products: { total: number; categories: number; outOfStock: number };
  analytics: { revenue: number; growth: number; satisfaction: number };
}

interface EnhancedDashboardPresentationProps {
  data: DashboardData | null | undefined;
  isLoading: boolean;
}

export const EnhancedDashboardPresentation: React.FC<EnhancedDashboardPresentationProps> = ({
  data,
  isLoading
}) => {
  // Handle null/undefined data
  const safeData = data || {
    farmers: { total: 0, active: 0, new: 0 },
    dealers: { total: 0, active: 0, performance: 0 },
    products: { total: 0, categories: 0, outOfStock: 0 },
    analytics: { revenue: 0, growth: 0, satisfaction: 0 }
  };

  const kpiCards = [
    {
      title: 'Total Farmers',
      value: safeData.farmers.total,
      change: `+${safeData.farmers.new} this week`,
      icon: Users,
      trend: 'up',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Active Dealers',
      value: safeData.dealers.active,
      change: `${safeData.dealers.performance}% performance`,
      icon: Building,
      trend: 'up',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Products',
      value: safeData.products.total,
      change: `${safeData.products.outOfStock} out of stock`,
      icon: Package,
      trend: safeData.products.outOfStock > 0 ? 'down' : 'up',
      color: safeData.products.outOfStock > 0 ? 'text-warning' : 'text-info',
      bgColor: safeData.products.outOfStock > 0 ? 'bg-warning/10' : 'bg-info/10'
    },
    {
      title: 'Revenue Growth',
      value: `${safeData.analytics.growth}%`,
      change: `₹${safeData.analytics.revenue.toLocaleString()}`,
      icon: TrendingUp,
      trend: 'up',
      color: 'text-success',
      bgColor: 'bg-success/10'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Welcome back! 🚀
            </h1>
            <p className="text-muted-foreground mt-2">
              Here's what's happening with your agricultural network today
            </p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Activity className="mr-2 h-4 w-4" />
            View Live Activity
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, index) => (
          <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className={cn("absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-10 translate-x-10", card.bgColor)} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={cn("h-5 w-5 relative z-10", card.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className={cn(
                  "h-3 w-3 mr-1",
                  card.trend === 'up' ? 'text-success' : 'text-destructive'
                )} />
                {card.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-fit">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="farmers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Farmers
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest updates from your network</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { action: 'New farmer registered', time: '2 minutes ago', type: 'success' },
                  { action: 'Product order completed', time: '5 minutes ago', type: 'info' },
                  { action: 'Dealer performance alert', time: '10 minutes ago', type: 'warning' },
                  { action: 'Monthly report generated', time: '1 hour ago', type: 'success' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      activity.type === 'success' && 'bg-success',
                      activity.type === 'info' && 'bg-info',
                      activity.type === 'warning' && 'bg-warning'
                    )} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>API Performance</span>
                    <span className="text-success">99.9%</span>
                  </div>
                  <Progress value={99.9} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Data Sync</span>
                    <span className="text-success">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Real-time Updates</span>
                    <span className="text-success">Active</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="farmers" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Farmer Distribution</CardTitle>
                <CardDescription>Geographic spread of your farmer network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4" />
                  <p>Interactive map coming soon</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Farmer activity and engagement levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Users</span>
                  <Badge variant="secondary">{safeData.farmers.active}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">New Registrations</span>
                  <Badge variant="outline">{safeData.farmers.new}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Satisfaction Score</span>
                  <Badge variant="default">{safeData.analytics.satisfaction}%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Detailed performance metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                <p>Advanced analytics dashboard coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                System Alerts
              </CardTitle>
              <CardDescription>Important notifications and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {safeData.products.outOfStock > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-warning/20 bg-warning/5">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <div>
                      <p className="font-medium text-warning">Stock Alert</p>
                      <p className="text-sm text-muted-foreground">
                        {safeData.products.outOfStock} products are out of stock
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 rounded-lg border border-success/20 bg-success/5">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <div>
                    <p className="font-medium text-success">All Systems Operational</p>
                    <p className="text-sm text-muted-foreground">
                      All services running smoothly
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
