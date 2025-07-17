import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, UserCheck, UserX, TrendingUp, 
  MapPin, Sprout, AlertTriangle, Clock
} from 'lucide-react';
import { useRealTimeFarmers } from '@/hooks/useRealTimeData';

export const FarmerStats = () => {
  const { data: farmers, loading } = useRealTimeFarmers();

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
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return f.last_app_open && new Date(f.last_app_open) < weekAgo;
    }).length,
    avgLandSize: farmers.reduce((acc, f) => acc + (f.total_land_acres || 0), 0) / farmers.length || 0,
    topCrops: [...new Set(farmers.flatMap(f => f.primary_crops || []))].slice(0, 3),
    engagementRate: farmers.length ? (farmers.filter(f => f.total_app_opens > 0).length / farmers.length) * 100 : 0,
    responseRate: farmers.length ? (farmers.filter(f => f.total_queries > 0).length / farmers.length) * 100 : 0,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
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
          {loading ? (
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
          {loading ? (
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
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold text-warning">{stats.churnRisk}</div>
          )}
          <p className="text-xs text-muted-foreground">
            Inactive for 7+ days
          </p>
        </CardContent>
      </Card>
    </div>
  );
};