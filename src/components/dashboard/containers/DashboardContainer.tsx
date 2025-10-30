
import React, { Suspense, lazy } from 'react';
import { useDashboardQuery } from '@/hooks/data/useDashboardQuery';
import { DashboardSkeleton } from '../presentation/DashboardSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useTenantRealtime } from '@/hooks/data/useTenantRealtime';
import { Badge } from '@/components/ui/badge';

// Lazy load the heavy DashboardPresentation component
const DashboardPresentation = lazy(() => 
  import('../presentation/DashboardPresentation').then(module => ({
    default: module.DashboardPresentation
  }))
);

export const DashboardContainer: React.FC = () => {
  const { data: stats, isLoading, error } = useDashboardQuery();
  const { isConnected, lastUpdate } = useTenantRealtime();

  // Enhanced error handling
  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please try refreshing the page.
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-2">
                <summary>Error Details</summary>
                <pre className="text-xs mt-1">{error.message}</pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Real-time connection indicator */}
      {isConnected && (
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="outline" className="text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            Live Data
          </Badge>
        </div>
      )}
      
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardPresentation
          stats={stats}
          isLoading={isLoading}
          error={error}
        />
      </Suspense>
    </div>
  );
};
