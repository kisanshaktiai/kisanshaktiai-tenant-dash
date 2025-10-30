
import React from 'react';
import { useRealTimeDashboard } from '@/hooks/data/useRealTimeDashboard';
import { DashboardPresentation } from './presentation/DashboardPresentation';
import { EnhancedDashboardPresentation } from './presentation/EnhancedDashboardPresentation';

interface CustomizableDashboardProps {
  tenantId: string;
}

export const CustomizableDashboard: React.FC<CustomizableDashboardProps> = ({ 
  tenantId 
}) => {
  const { data: stats, isLoading, error } = useRealTimeDashboard();

  // Transform data for EnhancedDashboardPresentation if available
  const enhancedData = stats ? {
    farmers: {
      total: stats.farmers?.total || 0,
      active: stats.farmers?.active || 0,
      new: stats.farmers?.new_this_week || 0
    },
    dealers: {
      total: stats.dealers?.total || 0,
      active: stats.dealers?.active || 0,
      performance: 0 // Default to 0 since performance is not available in current data structure
    },
    products: {
      total: stats.products?.total || 0,
      categories: stats.products?.categories || 0,
      outOfStock: stats.products?.out_of_stock || 0
    },
    analytics: {
      revenue: 0, // Default values since analytics is not available in current data structure
      growth: 0,
      satisfaction: 0
    }
  } : null;

  return (
    <div className="space-y-6">
      {/* Use the enhanced presentation component */}
      <EnhancedDashboardPresentation 
        data={enhancedData}
        isLoading={isLoading}
      />
      
      {/* Also show the original dashboard for completeness */}
      <DashboardPresentation
        stats={stats}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};
