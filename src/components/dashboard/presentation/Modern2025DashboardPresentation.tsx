import React from 'react';
import { StatCard2025 } from '../modern/StatCard2025';
import { ActivityFeed2025 } from '../modern/ActivityFeed2025';
import { PerformanceChart2025 } from '../modern/PerformanceChart2025';
import { AIInsightsCard2025 } from '../modern/AIInsightsCard2025';
import { AlertsPanel2025 } from '../modern/AlertsPanel2025';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Users, Package, Building, MapPin, RefreshCw, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { EnhancedDashboardStats } from '@/services/EnhancedDashboardService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface Modern2025DashboardPresentationProps {
  data: EnhancedDashboardStats | null | undefined;
  isLoading: boolean;
  error: any;
  isLive?: boolean;
  lastUpdate?: Date | null;
}

export const Modern2025DashboardPresentation: React.FC<Modern2025DashboardPresentationProps> = ({
  data,
  isLoading,
  error,
  isLive,
  lastUpdate,
}) => {
  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state
  if (isLoading || !data) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32 mb-3" />
                <Skeleton className="h-5 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time insights for your agricultural network
          </p>
        </div>
        {isLive && lastUpdate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-success font-medium">Live</span>
            </div>
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard2025
          title="Total Farmers"
          value={data.farmers.total}
          subtitle={`${data.farmers.active} active`}
          icon={Users}
          trend={{
            value: data.farmers.growth_rate,
            label: 'from last week',
          }}
          isLive={isLive}
        />

        <StatCard2025
          title="Products"
          value={data.products.total}
          subtitle={`${data.products.categories} categories`}
          icon={Package}
          trend={{
            value: data.products.out_of_stock > 0 ? -5 : 8,
            label: 'inventory status',
          }}
          isLive={isLive}
        />

        <StatCard2025
          title="Dealers"
          value={data.dealers.total}
          subtitle={`${data.dealers.active} active`}
          icon={Building}
          trend={{
            value: data.dealers.performance_avg,
            label: 'avg performance',
          }}
          isLive={isLive}
        />

        <StatCard2025
          title="Total Lands"
          value={data.lands.total_count}
          subtitle={`${data.lands.total_area_acres.toLocaleString()} acres total`}
          icon={MapPin}
          trend={{
            value: data.lands.avg_area > 0 ? 10 : 0,
            label: 'from last month',
          }}
          isLive={isLive}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceChart2025 title="Growth Trends (Last 3 Months)" />
            <AIInsightsCard2025 insights={data.insights} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  User Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {data.analytics.engagement_rate}%
                </div>
                <Progress value={data.analytics.engagement_rate} className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  Active users vs total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Growth Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {data.analytics.growth_percentage}%
                </div>
                <Progress value={Math.abs(data.analytics.growth_percentage)} className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  Week over week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Performance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {data.analytics.revenue_trend}%
                </div>
                <Progress value={data.analytics.revenue_trend} className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  Overall system health
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceChart2025 title="Farmer Acquisition" />
            <PerformanceChart2025 title="Product Distribution" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Campaigns</p>
                <p className="text-2xl font-bold">{data.campaigns.active}</p>
                <p className="text-xs text-muted-foreground mt-1">Active campaigns</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                <p className="text-2xl font-bold">{data.campaigns.success_rate}%</p>
                <p className="text-xs text-muted-foreground mt-1">Campaign performance</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Avg Land Size</p>
                <p className="text-2xl font-bold">{data.lands.avg_area}</p>
                <p className="text-xs text-muted-foreground mt-1">Acres per farmer</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Stock Issues</p>
                <p className="text-2xl font-bold">{data.products.out_of_stock + data.products.low_stock}</p>
                <p className="text-xs text-muted-foreground mt-1">Products need attention</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ActivityFeed2025 activities={data.activities} isLive={isLive} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Database</span>
                    <span className="text-sm font-medium text-success">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">API Services</span>
                    <span className="text-sm font-medium text-success">98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Real-time Sync</span>
                    <span className="text-sm font-medium text-success">
                      {isLive ? '100%' : '0%'}
                    </span>
                  </div>
                  <Progress value={isLive ? 100 : 0} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Storage</span>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Top Performing Regions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Punjab', 'Maharashtra', 'Karnataka'].map((region, index) => (
                    <div key={region} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{region}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={90 - index * 10} className="w-24 h-2" />
                        <span className="text-sm text-muted-foreground">
                          {90 - index * 10}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">Farmer Retention</span>
                  <span className="text-lg font-bold text-success">94.2%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">Product Turnover</span>
                  <span className="text-lg font-bold text-primary">8.5 days</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">Dealer Satisfaction</span>
                  <span className="text-lg font-bold text-success">4.7/5</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Alerts Panel */}
      {data.alerts && data.alerts.length > 0 && (
        <AlertsPanel2025 alerts={data.alerts} />
      )}
    </div>
  );
};
