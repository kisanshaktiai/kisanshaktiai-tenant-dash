
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

class DashboardService {
  async getDashboardStats(tenantId: string): Promise<DashboardStats> {
    try {
      console.log('Fetching dashboard stats for tenant:', tenantId);

      const [farmers, products, dealers, campaigns] = await Promise.all([
        this.getFarmersCount(tenantId),
        this.getProductsCount(tenantId),
        this.getDealersCount(tenantId),
        this.getCampaignsCount(tenantId)
      ]);

      // Calculate new farmers this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newFarmersThisWeek = farmers.filter(f => 
        f.created_at && new Date(f.created_at) >= oneWeekAgo
      ).length;

      const dashboardData = {
        farmers: {
          total: farmers.length,
          active: farmers.length, // Since we don't have a verified field, assume all are active
          new_this_week: newFarmersThisWeek,
          recent: farmers.slice(0, 5).map(farmer => ({
            id: farmer.id,
            name: farmer.farmer_code || 'Unknown Farmer',
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
          out_of_stock: 0 // Default to 0 since we don't have stock tracking
        },
        dealers: {
          total: dealers.length,
          active: dealers.length // Assume all are active
        }
      };

      console.log('Dashboard stats calculated:', dashboardData);
      return dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      
      // Return default stats in case of error
      return {
        farmers: { total: 0, active: 0, new_this_week: 0, recent: [] },
        campaigns: { active: 0, total: 0 },
        products: { total: 0, categories: 0, out_of_stock: 0 },
        dealers: { total: 0, active: 0 }
      };
    }
  }

  private async getFarmersCount(tenantId: string) {
    const { data, error } = await supabase
      .from('farmers')
      .select('id, farmer_code, created_at')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('Error fetching farmers:', error);
      return [];
    }

    return data || [];
  }

  private async getCampaignsCount(tenantId: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('id, status')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }

    return data || [];
  }

  private async getProductsCount(tenantId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('id, name')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data || [];
  }

  private async getDealersCount(tenantId: string) {
    const { data, error } = await supabase
      .from('dealers')
      .select('id')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('Error fetching dealers:', error);
      return [];
    }

    return data || [];
  }
}

export const dashboardService = new DashboardService();
