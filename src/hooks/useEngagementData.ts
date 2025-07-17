import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';

interface EngagementStats {
  activeUsers: number;
  avgSessionTime: string;
  featureAdoption: number;
  responseRate: number;
  churnRate: number;
  npsScore: number;
}

export const useEngagementData = () => {
  const [stats, setStats] = useState<EngagementStats>({
    activeUsers: 0,
    avgSessionTime: '0 min',
    featureAdoption: 0,
    responseRate: 0,
    churnRate: 0,
    npsScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTenant } = useAppSelector((state) => state.tenant);

  useEffect(() => {
    if (!currentTenant) return;

    const fetchEngagementData = async () => {
      try {
        setLoading(true);

        // Get all farmers for this tenant
        const { data: farmers, error: farmersError } = await supabase
          .from('farmers')
          .select('*')
          .eq('tenant_id', currentTenant.id);

        if (farmersError) throw farmersError;

        if (farmers && farmers.length > 0) {
          // Calculate active users (used app in last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const activeUsers = farmers.filter(f => 
            f.last_app_open && new Date(f.last_app_open) > thirtyDaysAgo
          ).length;

          // Calculate average session time (mock for now - would need session tracking)
          const avgAppOpens = farmers.reduce((acc, f) => acc + (f.total_app_opens || 0), 0) / farmers.length;
          const avgSessionTime = `${Math.round(avgAppOpens * 2.5)} min`;

          // Feature adoption (farmers who have used queries)
          const featureAdoption = (farmers.filter(f => (f.total_queries || 0) > 0).length / farmers.length) * 100;

          // Response rate (verified farmers)
          const responseRate = (farmers.filter(f => f.is_verified).length / farmers.length) * 100;

          // Churn rate (inactive for 30+ days)
          const churnRate = (farmers.filter(f => 
            !f.last_app_open || new Date(f.last_app_open) < thirtyDaysAgo
          ).length / farmers.length) * 100;

          // Mock NPS score based on engagement
          const npsScore = Math.max(6, Math.min(10, 6 + (featureAdoption / 20)));

          setStats({
            activeUsers,
            avgSessionTime,
            featureAdoption: Math.round(featureAdoption * 10) / 10,
            responseRate: Math.round(responseRate * 10) / 10,
            churnRate: Math.round(churnRate * 10) / 10,
            npsScore: Math.round(npsScore * 10) / 10
          });
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch engagement data');
      } finally {
        setLoading(false);
      }
    };

    fetchEngagementData();

    // Set up real-time subscription
    const channel = supabase
      .channel('farmers_engagement')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farmers',
          filter: `tenant_id=eq.${currentTenant.id}`
        },
        () => fetchEngagementData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant]);

  return { stats, loading, error };
};