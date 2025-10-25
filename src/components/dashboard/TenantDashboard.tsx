
import React, { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useTenantContext } from '@/contexts/TenantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Package, 
  Store, 
  BarChart3, 
  Bell, 
  Settings,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { LiveIndicator } from '@/components/ui/LiveIndicator';

interface DashboardWidget {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
}

interface TenantStats {
  totalFarmers: number;
  activeFarmers: number;
  totalProducts: number;
  totalDealers: number;
  monthlyGrowth: number;
  activeSubscription: string;
}

export const TenantDashboard: React.FC = () => {
  const { currentTenant } = useTenantContext();
  const { user } = useAppSelector((state) => state.auth);
  const [isLive] = useState(true);

  // Mock data - in real implementation, this would come from API
  const stats: TenantStats = {
    totalFarmers: 2845,
    activeFarmers: 2102,
    totalProducts: 156,
    totalDealers: 23,
    monthlyGrowth: 12.5,
    activeSubscription: currentTenant?.subscription_plan || 'kisan'
  };

  const widgets: DashboardWidget[] = [
    {
      id: 'farmers',
      title: 'Total Farmers',
      value: stats.totalFarmers.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      id: 'active-farmers',
      title: 'Active This Month',
      value: stats.activeFarmers.toLocaleString(),
      change: '+8.2%',
      trend: 'up',
      icon: Activity,
      color: 'text-green-600'
    },
    {
      id: 'products',
      title: 'Product Catalog',
      value: stats.totalProducts,
      change: '+5 new',
      trend: 'up',
      icon: Package,
      color: 'text-purple-600'
    },
    {
      id: 'dealers',
      title: 'Dealer Network',
      value: stats.totalDealers,
      change: '+2 this week',
      trend: 'up',
      icon: Store,
      color: 'text-orange-600'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'farmer_registered',
      message: 'New farmer Raj Kumar registered from Punjab',
      timestamp: '2 minutes ago',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'product_updated',
      message: 'Wheat Seeds product updated with new pricing',
      timestamp: '15 minutes ago',
      icon: Package,
      color: 'text-green-600'
    },
    {
      id: 3,
      type: 'dealer_activated',
      message: 'Dealer "AgroTech Solutions" activated in Maharashtra',
      timestamp: '1 hour ago',
      icon: Store,
      color: 'text-purple-600'
    }
  ];

  const getTenantPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'ai': return 'bg-gradient-to-r from-purple-600 to-blue-600 text-white';
      case 'shakti': return 'bg-gradient-to-r from-green-600 to-blue-600 text-white';
      case 'kisan': return 'bg-gradient-to-r from-orange-600 to-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  if (!currentTenant) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No tenant context available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Managing {currentTenant.name} dashboard
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={getTenantPlanBadgeColor(currentTenant.subscription_plan)}>
            {currentTenant.subscription_plan.toUpperCase()} Plan
          </Badge>
          <LiveIndicator isConnected={isLive} activeChannels={4} />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {widgets.map((widget) => {
          const IconComponent = widget.icon;
          return (
            <Card key={widget.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {widget.title}
                </CardTitle>
                <IconComponent className={`h-4 w-4 ${widget.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{widget.value}</div>
                {widget.change && (
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {widget.change} from last month
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const ActivityIcon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <ActivityIcon className={`h-4 w-4 mt-0.5 ${activity.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Activities
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Add New Farmer
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Manage Products
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Store className="h-4 w-4 mr-2" />
              Dealer Network
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Database: Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">API: Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Real-time: Connected</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
