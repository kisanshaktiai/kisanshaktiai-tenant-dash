
import { supabase } from '@/integrations/supabase/client';

class DashboardService {
  async getDashboardData(tenantId: string) {
    console.log('DashboardService: Fetching dashboard data for tenant:', tenantId);
    
    try {
      const [
        farmersResult,
        landsResult,
        productsResult,
        dealersResult
      ] = await Promise.allSettled([
        this.getFarmersCount(tenantId),
        this.getLandsCount(tenantId),
        this.getProductsCount(tenantId),
        this.getDealersCount(tenantId)
      ]);

      // Process results with graceful error handling
      const farmers = farmersResult.status === 'fulfilled' ? farmersResult.value : [];
      const lands = landsResult.status === 'fulfilled' ? landsResult.value : [];
      const products = productsResult.status === 'fulfilled' ? productsResult.value : [];
      const dealers = dealersResult.status === 'fulfilled' ? dealersResult.value : [];

      // Log any errors
      if (farmersResult.status === 'rejected') {
        console.error('DashboardService: Error fetching farmers:', farmersResult.reason);
      }
      if (landsResult.status === 'rejected') {
        console.error('DashboardService: Error fetching lands:', landsResult.reason);
      }
      if (productsResult.status === 'rejected') {
        console.error('DashboardService: Error fetching products:', productsResult.reason);
      }
      if (dealersResult.status === 'rejected') {
        console.error('DashboardService: Error fetching dealers:', dealersResult.reason);
      }

      // Calculate some recent farmers (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newFarmersThisWeek = farmers.filter(farmer => 
        farmer.created_at && new Date(farmer.created_at) >= oneWeekAgo
      ).length;

      const dashboardData = {
        farmers: {
          total: farmers.length,
          active: farmers.length, // Since we don't have is_active, assume all are active
          new_this_week: newFarmersThisWeek,
          recent: farmers.slice(0, 5).map(farmer => ({
            id: farmer.id,
            name: farmer.first_name && farmer.last_name 
              ? `${farmer.first_name} ${farmer.last_name}`.trim()
              : farmer.first_name || farmer.last_name || 'Unknown Farmer',
            created_at: farmer.created_at
          }))
        },
        lands: {
          total: lands.length,
          totalAcres: lands.reduce((sum, land) => sum + (land.area_acres || 0), 0)
        },
        products: {
          total: products.length,
          categories: [...new Set(products.map(p => p.name?.split(' ')[0]).filter(Boolean))].length,
          out_of_stock: 0 // We don't have stock info, so default to 0
        },
        dealers: {
          total: dealers.length,
          active: dealers.filter(d => d.is_active).length,
          performance: 92 // Mock performance score
        },
        analytics: {
          revenue: 0, // Mock data
          growth: 15.2, // Mock growth percentage
          satisfaction: 94 // Mock satisfaction score
        }
      };

      console.log('DashboardService: Dashboard data prepared:', dashboardData);
      return dashboardData;
    } catch (error) {
      console.error('DashboardService: Error in getDashboardData:', error);
      // Return empty data structure instead of throwing
      return {
        farmers: { total: 0, active: 0, new_this_week: 0, recent: [] },
        lands: { total: 0, totalAcres: 0 },
        products: { total: 0, categories: 0, out_of_stock: 0 },
        dealers: { total: 0, active: 0, performance: 0 },
        analytics: { revenue: 0, growth: 0, satisfaction: 0 }
      };
    }
  }

  private async getFarmersCount(tenantId: string) {
    const { data, error } = await supabase
      .from('farmers')
      .select('id, first_name, last_name, created_at')
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return data || [];
  }

  private async getLandsCount(tenantId: string) {
    const { data, error } = await supabase
      .from('lands')
      .select('id, area_acres')
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return data || [];
  }

  private async getProductsCount(tenantId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('id, name')
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return data || [];
  }

  private async getDealersCount(tenantId: string) {
    const { data, error } = await supabase
      .from('dealers')
      .select('id, is_active')
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return data || [];
  }
}

export const dashboardService = new DashboardService();
