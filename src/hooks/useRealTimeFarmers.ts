
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';

interface Farmer {
  id: string;
  tenant_id: string;
  farmer_code: string;
  farming_experience_years: number;
  total_land_acres: number;
  primary_crops: string[];
  farm_type: string;
  has_irrigation: boolean;
  has_storage: boolean;
  has_tractor: boolean;
  irrigation_type: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export const useRealTimeFarmers = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTenant } = useAppSelector((state) => state.tenant);

  useEffect(() => {
    if (!currentTenant) {
      setLoading(false);
      return;
    }

    const fetchFarmers = async () => {
      try {
        const { data, error } = await supabase
          .from('farmers')
          .select('*')
          .eq('tenant_id', currentTenant.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setFarmers(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch farmers');
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();

    // Set up real-time subscription
    const channel = supabase
      .channel('farmers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farmers',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setFarmers(prev => [payload.new as Farmer, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setFarmers(prev => prev.map(farmer => 
              farmer.id === payload.new.id ? payload.new as Farmer : farmer
            ));
          } else if (payload.eventType === 'DELETE') {
            setFarmers(prev => prev.filter(farmer => farmer.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant]);

  return {
    data: farmers,
    loading,
    error
  };
};
