import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, Sprout, TrendingUp, AlertTriangle,
  Calendar, MapPin, Package, MessageSquare
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addNotification } from '@/store/slices/uiSlice';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { user } = useAppSelector((state) => state.auth);

  // Sample dashboard data - in real app this would come from API
  const dashboardStats = {
    totalFarmers: 2847,
    activeLands: 1532,
    totalCrops: 45,
    pendingIssues: 23,
    recentActivity: [
      {
        id: 1,
        type: 'farmer_registration',
        message: 'New farmer registered: Ramesh Kumar',
        time: '2 hours ago',
        icon: Users,
      },
      {
        id: 2,
        type: 'crop_update',
        message: 'Crop monitoring data updated for 15 lands',
        time: '4 hours ago',
        icon: Sprout,
      },
      {
        id: 3,
        type: 'campaign_started',
        message: 'New fertilizer campaign launched',
        time: '6 hours ago',
        icon: Calendar,
      },
    ],
    upcomingTasks: [
      {
        id: 1,
        title: 'Soil Testing Campaign',
        description: 'Schedule soil testing for 50 farmers in Karnataka',
        dueDate: '2024-01-20',
        priority: 'high',
      },
      {
        id: 2,
        title: 'Crop Advisory Review',
        description: 'Review and approve weekly crop advisory content',
        dueDate: '2024-01-18',
        priority: 'medium',
      },
      {
        id: 3,
        title: 'Dealer Onboarding',
        description: 'Complete onboarding for 3 new seed dealers',
        dueDate: '2024-01-22',
        priority: 'low',
      },
    ],
  };

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
            <div className="text-2xl font-bold">{dashboardStats.totalFarmers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Lands</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeLands.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crop Varieties</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalCrops}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+3</span> new varieties added
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{dashboardStats.pendingIssues}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
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
            {dashboardStats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <activity.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
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
            {dashboardStats.upcomingTasks.map((task) => (
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
            ))}
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