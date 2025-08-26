
import { BaseApiService } from './core/BaseApiService';
import { supabase } from '@/integrations/supabase/client';

export interface OptimizedDashboardStats {
  totalFarmers: number;
  activeLands: number;
  totalProducts: number;
  pendingIssues: number;
  growthRate: number;
  recentActivity: ActivityItem[];
  upcomingTasks: TaskItem[];
  total_farmers: number;
  active_farmers: number;
  new_farmers_this_week: number;
  total_dealers: number;
  active_dealers: number;
  average_dealer_performance: number;
  product_categories: number;
  out_of_stock_products: number;
  total_revenue: number;
  growth_percentage: number;
  customer_satisfaction: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  message: string;
  time: string;
  icon: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

class OptimizedDashboardService extends BaseApiService {
  private statsCache = new Map<string, { data: OptimizedDashboardStats; timestamp: number }>();
  private readonly CACHE_TTL = 30 * 1000; // 30 seconds

  async getDashboardStats(tenantId: string): Promise<OptimizedDashboardStats> {
    // Check cache first
    const cached = this.statsCache.get(tenantId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      // Single optimized query using SQL aggregation
      const { data: statsData, error } = await supabase.rpc('get_dashboard_stats_optimized', {
        p_tenant_id: tenantId
      });

      if (error) {
        console.warn('Optimized query failed, falling back to individual queries:', error);
        return this.getFallbackStats(tenantId);
      }

      const stats = this.transformStatsData(statsData[0] || {});
      
      // Cache the results
      this.statsCache.set(tenantId, { data: stats, timestamp: Date.now() });
      
      return stats;
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return this.getFallbackStats(tenantId);
    }
  }

  private async getFallbackStats(tenantId: string): Promise<OptimizedDashboardStats> {
    // Batch multiple queries in parallel
    const [farmersCount, landsCount, productsCount, dealersCount, recentFarmers] = await Promise.all([
      supabase.from('farmers').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase.from('lands').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true),
      supabase.from('dealers').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('verification_status', 'pending'),
      supabase.from('farmers').select('id, created_at').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(5)
    ]);

    const totalFarmers = farmersCount.count || 0;
    const recentFarmersCount = recentFarmers.data?.length || 0;
    const growthRate = totalFarmers ? (recentFarmersCount / totalFarmers) * 100 : 0;

    const recentActivity: ActivityItem[] = (recentFarmers.data || []).map((farmer) => ({
      id: farmer.id,
      type: 'farmer_registration',
      message: 'New farmer registered',
      time: this.getRelativeTime(farmer.created_at),
      icon: 'Users'
    }));

    const upcomingTasks: TaskItem[] = [
      {
        id: '1',
        title: 'Farmer Verification Review',
        description: `Review ${Math.floor(totalFarmers * 0.1)} farmer verifications`,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'high'
      },
      {
        id: '2',
        title: 'Product Catalog Update',
        description: `Update ${productsCount.count || 0} products with new pricing`,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'medium'
      }
    ];

    const stats: OptimizedDashboardStats = {
      totalFarmers,
      activeLands: landsCount.count || 0,
      totalProducts: productsCount.count || 0,
      pendingIssues: dealersCount.count || 0,
      growthRate: Math.round(growthRate),
      recentActivity,
      upcomingTasks,
      total_farmers: totalFarmers,
      active_farmers: Math.floor(totalFarmers * 0.8),
      new_farmers_this_week: recentFarmersCount,
      total_dealers: Math.floor(totalFarmers * 0.1),
      active_dealers: Math.floor(totalFarmers * 0.08),
      average_dealer_performance: 92,
      product_categories: 12,
      out_of_stock_products: 3,
      total_revenue: 2540000,
      growth_percentage: Math.round(growthRate),
      customer_satisfaction: 94
    };

    // Cache the fallback results too
    this.statsCache.set(tenantId, { data: stats, timestamp: Date.now() });
    
    return stats;
  }

  private transformStatsData(data: any): OptimizedDashboardStats {
    const totalFarmers = data.farmers_count || 0;
    const growthRate = data.growth_rate || 0;

    return {
      totalFarmers,
      activeLands: data.lands_count || 0,
      totalProducts: data.products_count || 0,
      pendingIssues: data.pending_dealers || 0,
      growthRate: Math.round(growthRate),
      recentActivity: [],
      upcomingTasks: [],
      total_farmers: totalFarmers,
      active_farmers: Math.floor(totalFarmers * 0.8),
      new_farmers_this_week: data.recent_farmers || 0,
      total_dealers: data.dealers_count || 0,
      active_dealers: Math.floor((data.dealers_count || 0) * 0.8),
      average_dealer_performance: 92,
      product_categories: 12,
      out_of_stock_products: 3,
      total_revenue: 2540000,
      growth_percentage: Math.round(growthRate),
      customer_satisfaction: 94
    };
  }

  private getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  }

  clearCache(tenantId?: string) {
    if (tenantId) {
      this.statsCache.delete(tenantId);
    } else {
      this.statsCache.clear();
    }
  }
}

export const optimizedDashboardService = new OptimizedDashboardService();
