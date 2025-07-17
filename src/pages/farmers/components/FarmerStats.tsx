import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, UserCheck, UserX, TrendingUp, 
  MapPin, Sprout, AlertTriangle, Clock
} from 'lucide-react';

export const FarmerStats = () => {
  // Sample stats - in real app this would come from API
  const stats = {
    totalFarmers: 2847,
    activeFarmers: 2134,
    newThisMonth: 156,
    churnRisk: 43,
    avgLandSize: 3.2,
    topCrops: ['Rice', 'Wheat', 'Cotton'],
    engagementRate: 78.5,
    responseRate: 62.3,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalFarmers.toLocaleString()}</div>
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
          <div className="text-2xl font-bold">{stats.activeFarmers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.activeFarmers / stats.totalFarmers) * 100).toFixed(1)}% of total
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.engagementRate}%</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-success">+5.2%</span> from last month
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">At Risk</CardTitle>
          <AlertTriangle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{stats.churnRisk}</div>
          <p className="text-xs text-muted-foreground">
            Require immediate attention
          </p>
        </CardContent>
      </Card>
    </div>
  );
};