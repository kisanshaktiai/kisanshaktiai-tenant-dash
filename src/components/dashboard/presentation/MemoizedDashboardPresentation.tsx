
import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Package, AlertTriangle, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalFarmers: number;
  activeLands: number;
  totalProducts: number;
  pendingIssues: number;
  growthRate: number;
  total_farmers?: number;
  active_farmers?: number;
  new_farmers_this_week?: number;
  total_dealers?: number;
  active_dealers?: number;
  average_dealer_performance?: number;
  product_categories?: number;
  out_of_stock_products?: number;
  total_revenue?: number;
  growth_percentage?: number;
  customer_satisfaction?: number;
}

interface DashboardPresentationProps {
  stats?: DashboardStats;
  isLoading: boolean;
  error?: any;
}

const StatCard = memo<{
  title: string;
  value: number | string;
  description?: string;
  icon: React.ReactNode;
  trend?: number;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}>(({ title, value, description, icon, trend, variant = 'default' }) => (
  <Card className="transition-all duration-200 hover:shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-4 w-4 text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
      {trend !== undefined && (
        <div className="flex items-center mt-2">
          <TrendingUp className={`h-3 w-3 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          <span className={`text-xs ml-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        </div>
      )}
    </CardContent>
  </Card>
));

StatCard.displayName = 'StatCard';

const LoadingSkeleton = memo(() => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-[80px] mb-2" />
          <Skeleton className="h-3 w-[120px]" />
        </CardContent>
      </Card>
    ))}
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

export const MemoizedDashboardPresentation = memo<DashboardPresentationProps>(({
  stats,
  isLoading,
  error
}) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load dashboard statistics. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert>
        <AlertDescription>
          No dashboard data available.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Farmers"
          value={stats.totalFarmers}
          description="Registered farmers"
          icon={<Users />}
          trend={stats.growthRate}
        />
        <StatCard
          title="Active Lands"
          value={stats.activeLands}
          description="Active land parcels"
          icon={<MapPin />}
        />
        <StatCard
          title="Products"
          value={stats.totalProducts}
          description="Available products"
          icon={<Package />}
        />
        <StatCard
          title="Pending Issues"
          value={stats.pendingIssues}
          description="Requires attention"
          icon={<AlertTriangle />}
          variant={stats.pendingIssues > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Extended Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Farmers"
          value={stats.active_farmers || 0}
          description="Recently active"
          icon={<Users />}
        />
        <StatCard
          title="Total Dealers"
          value={stats.total_dealers || 0}
          description="Network dealers"
          icon={<Users />}
        />
        <StatCard
          title="Revenue"
          value={`₹${((stats.total_revenue || 0) / 100000).toFixed(1)}L`}
          description="Total revenue"
          icon={<TrendingUp />}
          trend={stats.growth_percentage}
        />
        <StatCard
          title="Satisfaction"
          value={`${stats.customer_satisfaction || 0}%`}
          description="Customer satisfaction"
          icon={<TrendingUp />}
        />
      </div>
    </div>
  );
});

MemoizedDashboardPresentation.displayName = 'MemoizedDashboardPresentation';
