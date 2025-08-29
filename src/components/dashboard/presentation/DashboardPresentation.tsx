
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Users, MapPin, Package, AlertCircle, 
  TrendingUp, Calendar, CheckCircle, Clock
} from 'lucide-react';

interface DashboardPresentationProps {
  stats?: any;
  isLoading: boolean;
  error?: any;
}

export const DashboardPresentation: React.FC<DashboardPresentationProps> = ({
  stats,
  isLoading,
  error,
}) => {
  if (error) {
    return (
      <div className="container mx-auto p-8">
        <Card className="text-center py-12 shadow-strong border-0 bg-gradient-to-br from-destructive/5 to-destructive/10">
          <CardContent className="space-y-4">
            <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-6" />
            <h3 className="text-xl font-bold text-destructive">Dashboard Error</h3>
            <p className="text-destructive/80">Failed to load dashboard data. Please try refreshing the page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground text-lg mt-2">Real-time insights for your agricultural network</p>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-medium border-0 bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm hover:shadow-strong transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-bold text-muted-foreground/80 uppercase tracking-wider">Total Farmers</CardTitle>
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/15 group-hover:to-primary/10 transition-all duration-300">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            {isLoading ? (
              <Skeleton className="h-10 w-24 mb-2" />
            ) : (
              <div className="text-3xl font-bold text-foreground mb-2">{stats?.totalFarmers.toLocaleString()}</div>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs px-2 py-1 bg-success/10 text-success border-success/20">
                +{stats?.growthRate || 0}%
              </Badge>
              <span className="text-xs text-muted-foreground">growth rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium border-0 bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm hover:shadow-strong transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-bold text-muted-foreground/80 uppercase tracking-wider">Active Lands</CardTitle>
            <div className="p-3 rounded-xl bg-gradient-to-br from-info/10 to-info/5 group-hover:from-info/15 group-hover:to-info/10 transition-all duration-300">
              <MapPin className="h-5 w-5 text-info" />
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            {isLoading ? (
              <Skeleton className="h-10 w-24 mb-2" />
            ) : (
              <div className="text-3xl font-bold text-foreground mb-2">{stats?.activeLands.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">Currently registered</p>
          </CardContent>
        </Card>

        <Card className="shadow-medium border-0 bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm hover:shadow-strong transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-bold text-muted-foreground/80 uppercase tracking-wider">Total Products</CardTitle>
            <div className="p-3 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 group-hover:from-accent/15 group-hover:to-accent/10 transition-all duration-300">
              <Package className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            {isLoading ? (
              <Skeleton className="h-10 w-24 mb-2" />
            ) : (
              <div className="text-3xl font-bold text-foreground mb-2">{stats?.totalProducts.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">Available in catalog</p>
          </CardContent>
        </Card>

        <Card className="shadow-medium border-0 bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm hover:shadow-strong transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-bold text-muted-foreground/80 uppercase tracking-wider">Pending Issues</CardTitle>
            <div className="p-3 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 group-hover:from-warning/15 group-hover:to-warning/10 transition-all duration-300">
              <AlertCircle className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            {isLoading ? (
              <Skeleton className="h-10 w-24 mb-2" />
            ) : (
              <div className="text-3xl font-bold text-warning mb-2">{stats?.pendingIssues}</div>
            )}
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Enhanced Recent Activity */}
        <Card className="shadow-medium border-0 bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 rounded-xl bg-muted/30">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              stats?.recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-muted/20 to-transparent hover:from-muted/40 hover:to-muted/10 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Enhanced Upcoming Tasks */}
        <Card className="shadow-medium border-0 bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 rounded-xl bg-gradient-to-br from-info/10 to-info/5">
                <Calendar className="h-5 w-5 text-info" />
              </div>
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-3 p-4 rounded-xl bg-muted/30">
                  <Skeleton className="h-4 w-4 mt-1" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              stats?.upcomingTasks.map((task: any) => (
                <div key={task.id} className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-muted/20 to-transparent hover:from-muted/40 hover:to-muted/10 transition-all duration-300">
                  <div className="mt-1">
                    {task.priority === 'high' ? (
                      <div className="p-1 rounded-lg bg-destructive/10">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      </div>
                    ) : task.priority === 'medium' ? (
                      <div className="p-1 rounded-lg bg-warning/10">
                        <Clock className="h-4 w-4 text-warning" />
                      </div>
                    ) : (
                      <div className="p-1 rounded-lg bg-success/10">
                        <CheckCircle className="h-4 w-4 text-success" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-foreground">{task.title}</p>
                      <Badge 
                        variant={
                          task.priority === 'high' ? 'destructive' :
                          task.priority === 'medium' ? 'default' : 'secondary'
                        }
                        className="text-xs px-2 py-1"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{task.description}</p>
                    <p className="text-xs text-muted-foreground font-medium">Due: {task.dueDate}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
