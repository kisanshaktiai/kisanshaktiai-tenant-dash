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
      <div className="w-full p-4 sm:p-6 lg:p-8">
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

  // Use safe defaults if data is not available with proper fallbacks for all properties
  const safeStats = stats || {
    farmers: { total: 0, active: 0, new_this_week: 0, recent: [] },
    campaigns: { active: 0, total: 0 },
    products: { total: 0, categories: 0, out_of_stock: 0 },
    dealers: { total: 0, active: 0 },
  };

  // Safely extract nested properties with fallbacks
  const farmersData = safeStats.farmers || { total: 0, active: 0, new_this_week: 0, recent: [] };
  const campaignsData = safeStats.campaigns || { active: 0, total: 0 };
  const productsData = safeStats.products || { total: 0, categories: 0, out_of_stock: 0 };
  const dealersData = safeStats.dealers || { total: 0, active: 0 };

  return (
    <div className="w-full min-h-full p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground text-base lg:text-lg mt-2">Real-time insights for your agricultural network</p>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
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
              <div className="text-3xl font-bold text-foreground mb-2">{(farmersData.total || 0).toLocaleString()}</div>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs px-2 py-1 bg-success/10 text-success border-success/20">
                +{farmersData.new_this_week || 0}
              </Badge>
              <span className="text-xs text-muted-foreground">this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium border-0 bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm hover:shadow-strong transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-bold text-muted-foreground/80 uppercase tracking-wider">Active Farmers</CardTitle>
            <div className="p-3 rounded-xl bg-gradient-to-br from-info/10 to-info/5 group-hover:from-info/15 group-hover:to-info/10 transition-all duration-300">
              <MapPin className="h-5 w-5 text-info" />
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            {isLoading ? (
              <Skeleton className="h-10 w-24 mb-2" />
            ) : (
              <div className="text-3xl font-bold text-foreground mb-2">{(farmersData.active || 0).toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Currently engaged
            </p>
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
              <div className="text-3xl font-bold text-foreground mb-2">{(productsData.total || 0).toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {productsData.categories || 0} categories
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-medium border-0 bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm hover:shadow-strong transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-bold text-muted-foreground/80 uppercase tracking-wider">Active Campaigns</CardTitle>
            <div className="p-3 rounded-xl bg-gradient-to-br from-success/10 to-success/5 group-hover:from-success/15 group-hover:to-success/10 transition-all duration-300">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            {isLoading ? (
              <Skeleton className="h-10 w-24 mb-2" />
            ) : (
              <div className="text-3xl font-bold text-foreground mb-2">{(campaignsData.active || 0).toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {campaignsData.total || 0} total campaigns
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:gap-8 grid-cols-1 xl:grid-cols-2">
        {/* Enhanced Recent Activity */}
        <Card className="shadow-medium border-0 bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-lg lg:text-xl font-bold">
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
            ) : farmersData.recent && farmersData.recent.length > 0 ? (
              farmersData.recent.map((farmer: any) => (
                <div key={farmer.id} className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-muted/20 to-transparent hover:from-muted/40 hover:to-muted/10 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">New farmer: {farmer.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {farmer.created_at ? new Date(farmer.created_at).toLocaleDateString() : 'Recently joined'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced System Status */}
        <Card className="shadow-medium border-0 bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-lg lg:text-xl font-bold">
              <div className="p-2 rounded-xl bg-gradient-to-br from-info/10 to-info/5">
                <Calendar className="h-5 w-5 text-info" />
              </div>
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-muted/20 to-transparent">
              <div className="p-1 rounded-lg bg-success/10">
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">All Systems Operational</p>
                  <Badge variant="secondary" className="text-xs px-2 py-1 bg-success/10 text-success border-success/20">
                    Online
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">Dashboard and services running smoothly</p>
                <p className="text-xs text-muted-foreground font-medium">Last updated: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-muted/20 to-transparent">
              <div className="p-1 rounded-lg bg-info/10">
                <Clock className="h-4 w-4 text-info" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">Data Sync Active</p>
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    Real-time
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">Farmer and product data synchronized</p>
                <p className="text-xs text-muted-foreground font-medium">Next sync: Continuous</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
