import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users, Sprout, TrendingUp, AlertTriangle,
  Calendar, MapPin, Package, MessageSquare
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addNotification } from '@/store/slices/uiSlice';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { user } = useAppSelector((state) => state.auth);
  const { stats, loading, error } = useDashboardData();

  useEffect(() => {
    // Add a welcome notification for new users
    if (user) {
      dispatch(addNotification({
        type: 'success',
        title: 'Welcome to AgriTenant Hub!',
        message: `Hello ${user.user_metadata?.full_name || user.email}, your dashboard is ready.`,
      }));
    }
  }, [user, dispatch]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getIconForActivity = (iconName: string) => {
    switch (iconName) {
      case 'Users':
        return Users;
      case 'Sprout':
        return Sprout;
      case 'Calendar':
        return Calendar;
      default:
        return Users;
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.user_metadata?.full_name || 'there'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with {currentTenant?.name || 'your organization'} today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Campaign
          </Button>
          <Button>
            <Users className="mr-2 h-4 w-4" />
            Add Farmer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
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
              <span className="text-success">+{stats.growthRate}%</span> growth rate
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Lands</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.activeLands.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Currently being monitored
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Available in catalog
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-warning">{stats.pendingIssues}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your farmer network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => {
                const IconComponent = getIconForActivity(activity.icon);
                return (
                  <div key={activity.id} className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity to display
              </p>
            )}
            <Button variant="outline" className="w-full mt-4">
              View All Activity
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>
              Important tasks that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))
            ) : stats.upcomingTasks.length > 0 ? (
              stats.upcomingTasks.map((task) => (
                <div key={task.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{task.title}</h4>
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{task.description}</p>
                  <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming tasks
              </p>
            )}
            <Button variant="outline" className="w-full mt-4">
              <Calendar className="mr-2 h-4 w-4" />
              View Task Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to help you manage your operations efficiently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Add Farmers</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Package className="h-6 w-6" />
              <span className="text-sm">Manage Products</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Create Campaign</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              <span className="text-sm">Send Advisory</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;