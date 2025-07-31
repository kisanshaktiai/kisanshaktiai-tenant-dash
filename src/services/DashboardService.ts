
import { BaseApiService } from './core/BaseApiService';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalFarmers: number;
  activeLands: number;
  totalProducts: number;
  pendingIssues: number;
  growthRate: number;
  recentActivity: ActivityItem[];
  upcomingTasks: TaskItem[];
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

class DashboardService extends BaseApiService {
  async getDashboardStats(tenantId: string): Promise<DashboardStats> {
    try {
      // Fetch farmers count
      const { count: farmersCount } = await supabase
        .from('farmers')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      // Fetch lands count
      const { count: landsCount } = await supabase
        .from('lands')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      // Fetch dealers for pending issues calculation
      const { count: dealersCount } = await supabase
        .from('dealers')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('verification_status', 'pending');

      // Calculate growth rate (last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: recentFarmers } = await supabase
        .from('farmers')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', thirtyDaysAgo.toISOString());

      const growthRate = farmersCount ? (recentFarmers || 0) / farmersCount * 100 : 0;

      // Fetch recent farmers for activity
      const { data: recentFarmersData } = await supabase
        .from('farmers')
        .select('id, created_at')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Create activity items
      const recentActivity: ActivityItem[] = (recentFarmersData || []).map((farmer) => ({
        id: farmer.id,
        type: 'farmer_registration',
        message: `New farmer registered`,
        time: this.getRelativeTime(farmer.created_at),
        icon: 'Users'
      }));

      // Create sample upcoming tasks based on data
      const upcomingTasks: TaskItem[] = [
        {
          id: '1',
          title: 'Farmer Verification Review',
          description: `Review ${farmersCount ? Math.floor(farmersCount * 0.1) : 0} farmer verifications`,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'high'
        },
        {
          id: '2',
          title: 'Product Catalog Update',
          description: `Update ${productsCount || 0} products with new pricing`,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'medium'
        },
        {
          id: '3',
          title: 'Dealer Onboarding',
          description: `Complete onboarding for ${dealersCount || 0} pending dealers`,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'low'
        }
      ];

      return {
        totalFarmers: farmersCount || 0,
        activeLands: landsCount || 0,
        totalProducts: productsCount || 0,
        pendingIssues: dealersCount || 0,
        growthRate: Math.round(growthRate),
        recentActivity,
        upcomingTasks
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
}

export const dashboardService = new DashboardService();
