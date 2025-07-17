import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';

interface DashboardStats {
  totalFarmers: number;
  activeLands: number;
  totalProducts: number;
  pendingIssues: number;
  growthRate: number;
  recentActivity: ActivityItem[];
  upcomingTasks: TaskItem[];
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  time: string;
  icon: string;
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalFarmers: 0,
    activeLands: 0,
    totalProducts: 0,
    pendingIssues: 0,
    growthRate: 0,
    recentActivity: [],
    upcomingTasks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTenant } = useAppSelector((state) => state.tenant);

  useEffect(() => {
    if (!currentTenant) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch farmers count
        const { count: farmersCount } = await supabase
          .from('farmers')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', currentTenant.id);

        // Fetch lands count
        const { count: landsCount } = await supabase
          .from('lands')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', currentTenant.id)
          .eq('is_active', true);

        // Fetch products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', currentTenant.id)
          .eq('is_active', true);

        // Fetch dealers for pending issues calculation
        const { count: dealersCount } = await supabase
          .from('dealers')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', currentTenant.id)
          .eq('verification_status', 'pending');

        // Calculate growth rate (last 30 days vs previous 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count: recentFarmers } = await supabase
          .from('farmers')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', currentTenant.id)
          .gte('created_at', thirtyDaysAgo.toISOString());

        const growthRate = farmersCount ? (recentFarmers || 0) / farmersCount * 100 : 0;

        // Fetch recent farmers for activity
        const { data: recentFarmersData } = await supabase
          .from('farmers')
          .select('id, created_at')
          .eq('tenant_id', currentTenant.id)
          .order('created_at', { ascending: false })
          .limit(5);

        // Create activity items
        const recentActivity: ActivityItem[] = (recentFarmersData || []).map((farmer, index) => ({
          id: farmer.id,
          type: 'farmer_registration',
          message: `New farmer registered`,
          time: getRelativeTime(farmer.created_at),
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

        setStats({
          totalFarmers: farmersCount || 0,
          activeLands: landsCount || 0,
          totalProducts: productsCount || 0,
          pendingIssues: dealersCount || 0,
          growthRate: Math.round(growthRate),
          recentActivity,
          upcomingTasks
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up real-time subscriptions for key metrics
    const farmersChannel = supabase
      .channel('farmers_dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farmers',
          filter: `tenant_id=eq.${currentTenant.id}`
        },
        () => fetchDashboardData()
      )
      .subscribe();

    const landsChannel = supabase
      .channel('lands_dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lands',
          filter: `tenant_id=eq.${currentTenant.id}`
        },
        () => fetchDashboardData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(farmersChannel);
      supabase.removeChannel(landsChannel);
    };
  }, [currentTenant]);

  return { stats, loading, error };
};

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}