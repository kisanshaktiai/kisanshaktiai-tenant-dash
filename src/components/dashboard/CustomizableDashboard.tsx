
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
  Activity
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
    data, 
    isLoading, 
    error 
  } = useDashboardQuery(tenantId, {
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  const handleCustomizeMode = useCallback(() => {
    setIsCustomizing(!isCustomizing);
  }, [isCustomizing]);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'expanded' ? 'compact' : 'expanded');
  }, []);

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5 shadow-soft">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <Activity className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="font-semibold text-lg text-destructive mb-2">
            Unable to Load Dashboard
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            We encountered an error while loading your dashboard data. Please refresh the page or contact support if the issue persists.
          </p>
        </CardContent>
      </Card>
    );
  }

  const mockData = {
    farmers: { total: 2547, active: 1823, new: 127 },
    dealers: { total: 89, active: 76, performance: 94 },
    products: { total: 456, categories: 23, outOfStock: 12 },
    analytics: { revenue: 2340000, growth: 18.5, satisfaction: 96 }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Control Panel */}
      <Card className="border-0 shadow-soft bg-gradient-to-r from-card via-card to-muted/10">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <LayoutGrid className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Dashboard Overview</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Real-time insights into your agricultural network
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5">
                <Sparkles className="h-3 w-3" />
                Live Data
              </Badge>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleViewMode}
                className="gap-2"
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
                className="gap-2"
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
        <Card className="border-primary/20 bg-primary/5 shadow-soft">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-primary">Customization Mode</h4>
                <p className="text-sm text-muted-foreground">
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
        viewMode === 'compact' && "space-y-4",
        viewMode === 'expanded' && "space-y-6"
      )}>
        <EnhancedDashboardPresentation 
          data={mockData}
          isLoading={isLoading}
        />
      </div>

      {/* Quick Actions Footer */}
      <Card className="border-0 shadow-soft bg-gradient-to-r from-muted/20 to-card">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Dashboard last updated: {new Date().toLocaleTimeString()}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                View All Farmers
              </Button>
              <Button variant="ghost" size="sm">
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
