
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, UserCheck, TrendingUp, AlertTriangle
} from 'lucide-react';
import { useRealTimeFarmersQuery } from '@/hooks/data/useRealTimeFarmersQuery';

export const FarmerStats = () => {
  const { data: farmersResponse, isLoading } = useRealTimeFarmersQuery();
  const farmers = farmersResponse?.data || [];

  // Calculate stats from real data
  const stats = {
    totalFarmers: farmers.length,
    activeFarmers: farmers.filter(f => f.is_verified).length,
    newThisMonth: farmers.filter(f => {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return new Date(f.created_at) > monthAgo;
    }).length,
    churnRisk: farmers.filter(f => {
      // Use total_app_opens as a proxy for activity since last_app_open doesn't exist
      return (f.total_app_opens || 0) === 0;
    }).length,
    engagementRate: farmers.length ? (farmers.filter(f => (f.total_app_opens || 0) > 0).length / farmers.length) * 100 : 0,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">{stats.totalFarmers.toLocaleString()}</div>
          )}
          <p className="text-xs text-muted-foreground">
            <span className="text-success">+{stats.newThisMonth}</span> this month
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Farmers</CardTitle>
          <UserCheck className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">{stats.activeFarmers.toLocaleString()}</div>
          )}
          <p className="text-xs text-muted-foreground">
            {stats.totalFarmers ? ((stats.activeFarmers / stats.totalFarmers) * 100).toFixed(1) : 0}% of total
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">{stats.engagementRate.toFixed(1)}%</div>
          )}
          <p className="text-xs text-muted-foreground">
            App usage rate
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">At Risk</CardTitle>
          <AlertTriangle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold text-warning">{stats.churnRisk}</div>
          )}
          <p className="text-xs text-muted-foreground">
            Never opened app
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
