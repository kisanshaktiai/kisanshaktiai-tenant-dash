
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Users, UserCheck, TrendingUp, AlertTriangle
} from 'lucide-react';
import { useRealTimeFarmersQuery } from '@/hooks/data/useRealTimeFarmersQuery';

export const FarmerStats = React.memo(() => {
  const { data: farmersResponse, isLoading } = useRealTimeFarmersQuery();
  const farmers = farmersResponse?.data || [];

  // Memoize expensive stats calculations
  const stats = useMemo(() => {
    if (!farmers.length) {
      return {
        totalFarmers: 0,
        activeFarmers: 0,
        newThisMonth: 0,
        churnRisk: 0,
        engagementRate: 0,
      };
    }

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const activeFarmers = farmers.filter(f => f.is_verified).length;
    const newThisMonth = farmers.filter(f => 
      new Date(f.created_at) > monthAgo
    ).length;
    const churnRisk = farmers.filter(f => 
      (f.total_app_opens || 0) === 0
    ).length;
    const engagementRate = farmers.length ? 
      (farmers.filter(f => (f.total_app_opens || 0) > 0).length / farmers.length) * 100 : 0;

    return {
      totalFarmers: farmers.length,
      activeFarmers,
      newThisMonth,
      churnRisk,
      engagementRate,
    };
  }, [farmers]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-medium border-0 bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm hover:shadow-strong transition-all duration-300 group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-bold text-muted-foreground/80 uppercase tracking-wider">Total Farmers</CardTitle>
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/15 group-hover:to-primary/10 transition-all duration-300">
            <Users className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          {isLoading ? (
            <Skeleton className="h-10 w-24 mb-2" />
          ) : (
            <div className="text-3xl font-bold text-foreground mb-2">{stats.totalFarmers.toLocaleString()}</div>
          )}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs px-2 py-1 bg-success/10 text-success border-success/20">
              +{stats.newThisMonth}
            </Badge>
            <p className="text-xs text-muted-foreground">this month</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-medium border-0 bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm hover:shadow-strong transition-all duration-300 group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-bold text-muted-foreground/80 uppercase tracking-wider">Active Farmers</CardTitle>
          <div className="p-2 rounded-xl bg-gradient-to-br from-success/10 to-success/5 group-hover:from-success/15 group-hover:to-success/10 transition-all duration-300">
            <UserCheck className="h-5 w-5 text-success" />
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          {isLoading ? (
            <Skeleton className="h-10 w-24 mb-2" />
          ) : (
            <div className="text-3xl font-bold text-foreground mb-2">{stats.activeFarmers.toLocaleString()}</div>
          )}
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-success">
              {stats.totalFarmers ? ((stats.activeFarmers / stats.totalFarmers) * 100).toFixed(1) : 0}%
            </span> of total
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-medium border-0 bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm hover:shadow-strong transition-all duration-300 group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-bold text-muted-foreground/80 uppercase tracking-wider">Engagement Rate</CardTitle>
          <div className="p-2 rounded-xl bg-gradient-to-br from-info/10 to-info/5 group-hover:from-info/15 group-hover:to-info/10 transition-all duration-300">
            <TrendingUp className="h-5 w-5 text-info" />
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          {isLoading ? (
            <Skeleton className="h-10 w-24 mb-2" />
          ) : (
            <div className="text-3xl font-bold text-foreground mb-2">{stats.engagementRate.toFixed(1)}%</div>
          )}
          <p className="text-xs text-muted-foreground">
            App usage rate
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-medium border-0 bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm hover:shadow-strong transition-all duration-300 group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-bold text-muted-foreground/80 uppercase tracking-wider">At Risk</CardTitle>
          <div className="p-2 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 group-hover:from-warning/15 group-hover:to-warning/10 transition-all duration-300">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          {isLoading ? (
            <Skeleton className="h-10 w-24 mb-2" />
          ) : (
            <div className="text-3xl font-bold text-warning mb-2">{stats.churnRisk}</div>
          )}
          <p className="text-xs text-muted-foreground">
            Never opened app
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

FarmerStats.displayName = 'FarmerStats';
