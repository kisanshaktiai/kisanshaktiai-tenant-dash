
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Settings, 
  LayoutGrid, 
  Maximize2, 
  Minimize2,
  Sparkles,
  TrendingUp,
  Users,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useDashboardQuery } from '@/hooks/data/useDashboardQuery';
import { EnhancedDashboardPresentation } from './presentation/EnhancedDashboardPresentation';
import { cn } from '@/lib/utils';

interface CustomizableDashboardProps {
  tenantId: string;
}

export const CustomizableDashboard: React.FC<CustomizableDashboardProps> = ({ tenantId }) => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [viewMode, setViewMode] = useState<'expanded' | 'compact'>('expanded');
  
  const { 
    data: dashboardStats, 
    isLoading, 
    error 
  } = useDashboardQuery();

  const handleCustomizeMode = useCallback(() => {
    setIsCustomizing(!isCustomizing);
  }, [isCustomizing]);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'expanded' ? 'compact' : 'expanded');
  }, []);

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="font-semibold text-lg text-destructive mb-2">
            Unable to Load Dashboard
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            We encountered an error while loading your dashboard data. Please refresh the page or contact support if the issue persists.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Error: {error.message || 'Unknown error occurred'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Transform dashboard stats to expected format for EnhancedDashboardPresentation
  const transformedData = dashboardStats ? {
    farmers: { 
      total: dashboardStats.totalFarmers || 0, 
      active: dashboardStats.active_farmers || Math.floor((dashboardStats.totalFarmers || 0) * 0.8), 
      new: dashboardStats.new_farmers_this_week || 0 
    },
    dealers: { 
      total: dashboardStats.total_dealers || 0, 
      active: dashboardStats.active_dealers || Math.floor((dashboardStats.total_dealers || 0) * 0.8), 
      performance: dashboardStats.average_dealer_performance || 92 
    },
    products: { 
      total: dashboardStats.totalProducts || 0, 
      categories: dashboardStats.product_categories || 12, 
      outOfStock: dashboardStats.out_of_stock_products || 0 
    },
    analytics: { 
      revenue: dashboardStats.total_revenue || 0, 
      growth: dashboardStats.growth_percentage || dashboardStats.growthRate || 0, 
      satisfaction: dashboardStats.customer_satisfaction || 94 
    }
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-primary/5">
      <div className="container mx-auto p-6 space-y-8">
        {/* Enhanced Control Panel */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-card via-card to-muted/10 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                  <LayoutGrid className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                    Dashboard Overview
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Real-time insights into your agricultural network
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Live Data
                </Badge>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleViewMode}
                  className="gap-2 hover:shadow-md transition-all duration-200"
                >
                  {viewMode === 'expanded' ? (
                    <>
                      <Minimize2 className="h-4 w-4" />
                      Compact
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-4 w-4" />
                      Expanded
                    </>
                  )}
                </Button>

                <Button
                  variant={isCustomizing ? "default" : "outline"}
                  size="sm"
                  onClick={handleCustomizeMode}
                  className="gap-2 hover:shadow-md transition-all duration-200"
                >
                  {isCustomizing ? (
                    <>
                      <Settings className="h-4 w-4" />
                      Done
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Customize
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Customization Notice */}
        {isCustomizing && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 shadow-lg backdrop-blur-sm">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary text-lg">Customization Mode</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Drag and drop widgets to customize your dashboard layout.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Dashboard Content */}
        <div className={cn(
          "transition-all duration-300",
          viewMode === 'compact' && "space-y-6",
          viewMode === 'expanded' && "space-y-8"
        )}>
          <EnhancedDashboardPresentation 
            data={transformedData}
            isLoading={isLoading}
          />
        </div>

        {/* Quick Actions Footer */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-muted/20 via-card to-muted/20 backdrop-blur-sm">
          <CardContent className="py-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <TrendingUp className="h-4 w-4" />
                Dashboard last updated: {new Date().toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted/50 transition-colors">
                  <Users className="h-4 w-4" />
                  View All Farmers
                </Button>
                <Button variant="ghost" size="sm" className="hover:bg-muted/50 transition-colors">
                  Export Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
