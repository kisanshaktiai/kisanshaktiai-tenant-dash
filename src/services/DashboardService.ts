
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

      const dashboardData = {
        farmers: {
          total: farmers.length,
          active: farmers.length, // Since we don't have is_active, assume all are active
          recent: farmers.slice(0, 5).map(farmer => ({
            id: farmer.id,
            name: farmer.full_name || 'Unknown',
            created_at: farmer.created_at
          }))
        },
        lands: {
          total: lands.length,
          totalAcres: lands.reduce((sum, land) => sum + (land.area_acres || 0), 0)
        },
        products: {
          total: products.length,
          categories: [...new Set(products.map(p => p.name?.split(' ')[0]).filter(Boolean))] // Use first word of name as category
        },
        dealers: {
          total: dealers.length,
          active: dealers.filter(d => d.is_active).length
        }
      };

      console.log('DashboardService: Dashboard data prepared:', dashboardData);
      return dashboardData;
    } catch (error) {
      console.error('DashboardService: Error in getDashboardData:', error);
      // Return empty data structure instead of throwing
      return {
        farmers: { total: 0, active: 0, recent: [] },
        lands: { total: 0, totalAcres: 0 },
        products: { total: 0, categories: [] },
        dealers: { total: 0, active: 0 }
      };
    }
  }

  private async getFarmersCount(tenantId: string) {
    const { data, error } = await supabase
      .from('farmers')
      .select('id, full_name, created_at')
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
