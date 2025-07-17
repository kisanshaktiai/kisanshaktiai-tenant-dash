import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';

export const useRealTimeData = (
  tableName: string,
  filter?: { column: string; value: any }
) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTenant } = useAppSelector((state) => state.tenant);

  useEffect(() => {
    if (!currentTenant) return;

    const fetchInitialData = async () => {
      try {
        let query = supabase.from(tableName as any).select('*');
        
        // Add tenant filter if table has tenant_id
        if (tableName !== 'tenants' && tableName !== 'user_tenants') {
          query = query.eq('tenant_id', currentTenant.id);
        }
        
        // Add additional filter if provided
        if (filter) {
          query = query.eq(filter.column, filter.value);
        }

        const { data: initialData, error } = await query;
        
        if (error) throw error;
        setData(initialData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Set up real-time subscription
    const channel = supabase
      .channel(`${tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: currentTenant ? `tenant_id=eq.${currentTenant.id}` : undefined,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setData((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? payload.new : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setData((prev) =>
              prev.filter((item) => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, currentTenant, filter]);

  return { data, loading, error, refetch: () => setLoading(true) };
};

export const useRealTimeFarmers = () => {
  return useRealTimeData('farmers');
};

export const useRealTimeProducts = () => {
  return useRealTimeData('products');
};

export const useRealTimeDealers = () => {
  return useRealTimeData('dealers');
};

export const useRealTimeAnalytics = () => {
  return useRealTimeData('analytics_reports');
};

export const useRealTimeIntegrations = () => {
  return useRealTimeData('integrations');
};