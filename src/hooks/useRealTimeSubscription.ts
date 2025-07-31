
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';

interface RealTimeConfig {
  table: string;
  filter?: string;
  events?: ('INSERT' | 'UPDATE' | 'DELETE' | '*')[];
}

interface RealTimeHookReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRealTimeSubscription<T>(
  config: RealTimeConfig,
  initialFetch: () => Promise<T[]>
): RealTimeHookReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTenant } = useAppSelector((state) => state.tenant);

  const refetch = useCallback(async () => {
    if (!currentTenant) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const fetchedData = await initialFetch();
      setData(fetchedData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [currentTenant, initialFetch]);

  useEffect(() => {
    if (!currentTenant) {
      setLoading(false);
      return;
    }

    // Initial fetch
    refetch();

    // Set up real-time subscription using the correct API format
    const channelName = `${config.table}_changes_${currentTenant.id}`;
    const filter = config.filter || `tenant_id=eq.${currentTenant.id}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: config.table,
          filter: filter,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData(prev => [payload.new as T, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setData(prev => prev.map(item => 
              (item as any).id === payload.new.id ? payload.new as T : item
            ));
          } else if (payload.eventType === 'DELETE') {
            setData(prev => prev.filter(item => (item as any).id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant, config, refetch]);

  return { data, loading, error, refetch };
}
