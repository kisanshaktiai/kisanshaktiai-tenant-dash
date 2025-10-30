import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { queryKeys } from '@/lib/queryClient';
import { useTenantRealtime } from './useTenantRealtime';

export interface AnalyticsStats {
  farmers: {
    total: number;
    active: number;
    new_this_week: number;
    new_this_month: number;
    verified: number;
    churn_rate: number;
  };
  products: {
    total: number;
    categories: number;
    out_of_stock: number;
    top_selling: Array<{ name: string; sales: number; revenue: number }>;
  };
  dealers: {
    total: number;
    active: number;
    performance_avg: number;
  };
  campaigns: {
    total: number;
    active: number;
    completed: number;
    success_rate: number;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    by_month: Array<{ month: string; amount: number }>;
  };
  engagement: {
    rate: number;
    avg_session_time: number;
    active_users: number;
    feature_adoption: number;
  };
}

export const useRealtimeAnalytics = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { isConnected, lastUpdate } = useTenantRealtime();

  const analyticsQuery = useQuery({
    queryKey: ['analytics', 'stats', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) {
        throw new Error('No tenant selected');
      }

      // Fetch farmers data
      const { data: farmers, error: farmersError } = await supabase
        .from('farmers')
        .select('*')
        .eq('tenant_id', currentTenant.id);

      if (farmersError) throw farmersError;

      // Calculate date ranges
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Farmer statistics
      const totalFarmers = farmers?.length || 0;
      const activeFarmers = farmers?.filter(f => 
        f.last_app_open && new Date(f.last_app_open) > thirtyDaysAgo
      ).length || 0;
      const newThisWeek = farmers?.filter(f => 
        new Date(f.created_at) > weekAgo
      ).length || 0;
      const newThisMonth = farmers?.filter(f => 
        new Date(f.created_at) > monthAgo
      ).length || 0;
      const verifiedFarmers = farmers?.filter(f => f.is_verified).length || 0;
      
      // Calculate churn rate
      const inactiveFarmers = farmers?.filter(f => 
        !f.last_app_open || new Date(f.last_app_open) < thirtyDaysAgo
      ).length || 0;
      const churnRate = totalFarmers > 0 ? (inactiveFarmers / totalFarmers) * 100 : 0;

      // Fetch products data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('tenant_id', currentTenant.id);

      if (productsError) throw productsError;

      const totalProducts = products?.length || 0;
      const uniqueCategories = new Set(products?.map(p => p.category_id).filter(Boolean)).size;
      const outOfStock = products?.filter(p => 
        p.stock_quantity === 0 || (p.stock_quantity && p.stock_quantity < (p.reorder_point || 0))
      ).length || 0;

      // Get top selling products (mock sales data for now)
      const topSelling = products?.slice(0, 5).map(p => ({
        name: p.name,
        sales: Math.floor(Math.random() * 1000),
        revenue: Math.floor(Math.random() * 100000) // Mock revenue for now
      })) || [];

      // Fetch dealers data
      const { data: dealers, error: dealersError } = await supabase
        .from('dealers')
        .select('*')
        .eq('tenant_id', currentTenant.id);

      if (dealersError) throw dealersError;

      const totalDealers = dealers?.length || 0;
      const activeDealers = dealers?.filter(d => d.is_active).length || 0;
      const performanceAvg = 75; // Mock performance average for now

      // Fetch campaigns data
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('tenant_id', currentTenant.id);

      if (campaignsError) throw campaignsError;

      const totalCampaigns = campaigns?.length || 0;
      const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
      const completedCampaigns = campaigns?.filter(c => c.status === 'completed').length || 0;
      const successRate = completedCampaigns > 0 
        ? (campaigns?.filter(c => c.status === 'completed' && (c.metadata as any)?.success).length || 0) / completedCampaigns * 100
        : 0;

      // Calculate engagement metrics
      const avgAppOpens = farmers?.reduce((acc, f) => acc + (f.total_app_opens || 0), 0) / (totalFarmers || 1);
      const avgSessionTime = avgAppOpens * 2.5; // Approximation in minutes
      const engagementRate = activeFarmers > 0 ? (activeFarmers / totalFarmers) * 100 : 0;
      const featureAdoption = farmers?.filter(f => (f.total_queries || 0) > 0).length / (totalFarmers || 1) * 100;

      // Calculate revenue (mock data for now - would come from orders/transactions table)
      const monthlyRevenue = 840000; // ₹8.4L as shown in UI
      const totalRevenue = monthlyRevenue * 12;
      const revenueGrowth = -2.3; // As shown in UI
      
      // Generate monthly revenue data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const revenueByMonth = months.map(month => ({
        month,
        amount: monthlyRevenue * (0.8 + Math.random() * 0.4)
      }));

      return {
        farmers: {
          total: totalFarmers,
          active: activeFarmers,
          new_this_week: newThisWeek,
          new_this_month: newThisMonth,
          verified: verifiedFarmers,
          churn_rate: churnRate
        },
        products: {
          total: totalProducts,
          categories: uniqueCategories,
          out_of_stock: outOfStock,
          top_selling: topSelling
        },
        dealers: {
          total: totalDealers,
          active: activeDealers,
          performance_avg: performanceAvg
        },
        campaigns: {
          total: totalCampaigns,
          active: activeCampaigns,
          completed: completedCampaigns,
          success_rate: successRate
        },
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue,
          growth: revenueGrowth,
          by_month: revenueByMonth
        },
        engagement: {
          rate: engagementRate,
          avg_session_time: avgSessionTime,
          active_users: activeFarmers,
          feature_adoption: featureAdoption
        }
      } as AnalyticsStats;
    },
    enabled: !!currentTenant?.id,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data: analyticsQuery.data,
    isLoading: analyticsQuery.isLoading,
    error: analyticsQuery.error,
    refetch: analyticsQuery.refetch,
    isLive: isConnected,
    lastUpdate
  };
};