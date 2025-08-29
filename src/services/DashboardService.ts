
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  farmers: {
    total: number;
    active: number;
    new_this_week: number;
    recent: Array<{
      id: string;
      name: string;
      created_at: string;
    }>;
  };
  campaigns: {
    active: number;
    total: number;
  };
  products: {
    total: number;
    categories: number;
    out_of_stock: number;
  };
  dealers: {
    total: number;
    active: number;
  };
}

// Default empty stats to prevent undefined errors
const getDefaultStats = (): DashboardStats => ({
  farmers: { total: 0, active: 0, new_this_week: 0, recent: [] },
  campaigns: { active: 0, total: 0 },
  products: { total: 0, categories: 0, out_of_stock: 0 },
  dealers: { total: 0, active: 0 }
});

class DashboardService {
  async getDashboardStats(tenantId: string): Promise<DashboardStats> {
    if (!tenantId) {
      console.warn('DashboardService: No tenantId provided, returning default stats');
      return getDefaultStats();
    }

    try {
      console.log('DashboardService: Fetching dashboard stats for tenant:', tenantId);

      // Use Promise.allSettled to handle partial failures gracefully
      const results = await Promise.allSettled([
        this.getFarmersCount(tenantId),
        this.getProductsCount(tenantId),
        this.getDealersCount(tenantId),
        this.getCampaignsCount(tenantId)
      ]);

      // Extract results with fallbacks
      const farmers = results[0].status === 'fulfilled' ? results[0].value : [];
      const products = results[1].status === 'fulfilled' ? results[1].value : [];
      const dealers = results[2].status === 'fulfilled' ? results[2].value : [];
      const campaigns = results[3].status === 'fulfilled' ? results[3].value : [];

      // Log any failures
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const names = ['farmers', 'products', 'dealers', 'campaigns'];
          console.error(`DashboardService: Failed to fetch ${names[index]}:`, result.reason);
        }
      });

      // Calculate metrics safely
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const newFarmersThisWeek = farmers.filter(f => 
        f.created_at && new Date(f.created_at) >= oneWeekAgo
      ).length;

      const dashboardData: DashboardStats = {
        farmers: {
          total: farmers.length,
          active: farmers.length,
          new_this_week: newFarmersThisWeek,
          recent: farmers.slice(0, 5).map(farmer => ({
            id: farmer.id,
            name: farmer.farmer_code || farmer.name || 'Unknown Farmer',
            created_at: farmer.created_at
          }))
        },
        campaigns: {
          active: campaigns.filter(c => c.status === 'active').length,
          total: campaigns.length
        },
        products: {
          total: products.length,
          categories: [...new Set(products.map(p => p.name?.split(' ')[0]).filter(Boolean))].length,
          out_of_stock: 0
        },
        dealers: {
          total: dealers.length,
          active: dealers.length
        }
      };

      console.log('DashboardService: Successfully calculated stats:', dashboardData);
      return dashboardData;
    } catch (error) {
      console.error('DashboardService: Critical error fetching dashboard stats:', error);
      return getDefaultStats();
    }
  }

  private async getFarmersCount(tenantId: string) {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('id, farmer_code, name, created_at')
        .eq('tenant_id', tenantId);

      if (error) {
        console.error('DashboardService: Error fetching farmers:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('DashboardService: Failed to fetch farmers:', error);
      return [];
    }
  }

  private async getCampaignsCount(tenantId: string) {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, status')
        .eq('tenant_id', tenantId);

      if (error) {
        console.error('DashboardService: Error fetching campaigns:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('DashboardService: Failed to fetch campaigns:', error);
      return [];
    }
  }

  private async getProductsCount(tenantId: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .eq('tenant_id', tenantId);

      if (error) {
        console.error('DashboardService: Error fetching products:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('DashboardService: Failed to fetch products:', error);
      return [];
    }
  }

  private async getDealersCount(tenantId: string) {
    try {
      const { data, error } = await supabase
        .from('dealers')
        .select('id, name')
        .eq('tenant_id', tenantId);

      if (error) {
        console.error('DashboardService: Error fetching dealers:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('DashboardService: Failed to fetch dealers:', error);
      return [];
    }
  }
}

export const dashboardService = new DashboardService();
