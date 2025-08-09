
import React from 'react';
import { EnhancedDashboardPresentation } from '@/components/dashboard/presentation/EnhancedDashboardPresentation';
import { useDashboardQuery } from '@/hooks/data/useDashboardQuery';

const Dashboard = () => {
  const { data, isLoading, error } = useDashboardQuery();

  // Mock data for demonstration - replace with real data from the query
  const dashboardData = {
    farmers: {
      total: data?.totalFarmers || 1234,
      active: data?.active_farmers || 987,
      new: data?.new_farmers_this_week || 45
    },
    dealers: {
      total: data?.total_dealers || 89,
      active: data?.active_dealers || 76,
      performance: data?.average_dealer_performance || 92
    },
    products: {
      total: data?.totalProducts || 456,
      categories: data?.product_categories || 12,
      outOfStock: data?.out_of_stock_products || 3
    },
    analytics: {
      revenue: data?.total_revenue || 2540000,
      growth: data?.growth_percentage || 15.8,
      satisfaction: data?.customer_satisfaction || 94
    }
  };

  if (error) {
    console.error('Dashboard data error:', error);
  }

  return (
    <div className="space-y-6">
      <EnhancedDashboardPresentation 
        data={dashboardData} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default Dashboard;
