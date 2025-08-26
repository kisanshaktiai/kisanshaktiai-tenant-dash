
import React, { lazy, Suspense } from 'react';
import { DashboardSkeleton } from '@/components/dashboard/presentation/DashboardSkeleton';
import { useConsolidatedRealtime } from '@/hooks/realtime/useConsolidatedRealtime';
import { LiveIndicator } from '@/components/ui/LiveIndicator';

// Lazy load heavy dashboard components
const OptimizedDashboardContainer = lazy(() => 
  import('@/components/dashboard/containers/OptimizedDashboardContainer').then(module => ({
    default: module.OptimizedDashboardContainer
  }))
);

const LazyDashboard = () => {
  const { isConnected, activeChannels } = useConsolidatedRealtime();

  return (
    <div className="space-y-6">
      {/* Live Indicator */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <LiveIndicator isConnected={isConnected} activeChannels={activeChannels} />
      </div>
      
      <Suspense fallback={<DashboardSkeleton />}>
        <OptimizedDashboardContainer />
      </Suspense>
    </div>
  );
};

export default LazyDashboard;
