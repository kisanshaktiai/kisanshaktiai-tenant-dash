
import { useRealTimeSubscription } from '../useRealTimeSubscription';
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
  total_app_opens?: number;
  total_queries?: number;
  last_app_open?: string;
}

export const useFarmersData = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  const fetchFarmers = async (): Promise<Farmer[]> => {
    if (!currentTenant) return [];

    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .eq('tenant_id', currentTenant.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  return useRealTimeSubscription<Farmer>(
    {
      table: 'farmers',
      filter: `tenant_id=eq.${currentTenant?.id}`,
    },
    fetchFarmers
  );
};
