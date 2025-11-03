import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Package, 
  Store, 
  TrendingUp,
  Activity,
  Shield,
  Zap
} from 'lucide-react';
import { useOrganizationProfile } from '@/hooks/organization/useOrganizationProfile';
import { useOrganizationMetrics } from '@/hooks/organization/useOrganizationMetrics';
import { useOrganizationSubscription } from '@/hooks/organization/useOrganizationSubscription';
import { Skeleton } from '@/components/ui/skeleton';
import ActivityTimeline from './ActivityTimeline';

const OverviewTab = () => {
  const { profile, isLoading: profileLoading } = useOrganizationProfile();
  const { metrics, isLoading: metricsLoading } = useOrganizationMetrics();
  const { subscription, isLoading: subscriptionLoading } = useOrganizationSubscription();

  if (profileLoading || metricsLoading || subscriptionLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Farmers',
      value: metrics?.total_farmers || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Dealers',
      value: metrics?.total_dealers || 0,
      icon: Store,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Products',
      value: metrics?.total_products || 0,
      icon: Package,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Engagement Rate',
      value: `${metrics?.engagement_rate || 0}%`,
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  const healthMetrics = [
    { label: 'System Health', score: 95, color: 'bg-green-500' },
    { label: 'Compliance', score: 88, color: 'bg-blue-500' },
    { label: 'Security', score: 92, color: 'bg-purple-500' },
    { label: 'Performance', score: 85, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="border-none bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <CardContent className="p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {profile?.name && (
                  <h2 className="text-3xl font-bold">{profile.name}</h2>
                )}
                <Badge variant="secondary" className="text-sm">
                  {subscription?.plan?.name || 'Free Plan'}
                </Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                {profile?.description || 'No description available'}
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span>Active since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span className="capitalize">{profile?.status || 'Active'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Organization Health Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {healthMetrics.map((metric) => (
            <div key={metric.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{metric.label}</span>
                <span className="text-muted-foreground">{metric.score}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${metric.color} rounded-full transition-all duration-500`}
                  style={{ width: `${metric.score}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Two Column Layout for AI Insights and Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Insights */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 hover-scale cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-blue-500/20 animate-pulse">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Growth Opportunity</p>
                  <p className="text-sm text-muted-foreground">
                    Your farmer engagement is 23% higher than average. Consider expanding your product catalog.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 hover-scale cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-orange-500/20 animate-pulse">
                  <Shield className="h-4 w-4 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Security Recommendation</p>
                  <p className="text-sm text-muted-foreground">
                    Enable two-factor authentication for all admin users to improve security posture.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 hover-scale cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-green-500/20 animate-pulse">
                  <Package className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Inventory Optimization</p>
                  <p className="text-sm text-muted-foreground">
                    3 products are low in stock. Consider restocking to maintain availability.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <ActivityTimeline />
      </div>
    </div>
  );
};

export default OverviewTab;
