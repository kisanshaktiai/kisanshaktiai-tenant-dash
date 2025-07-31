
import { useRealTimeSubscription } from '../useRealTimeSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';

interface Dealer {
  id: string;
  tenant_id: string;
  dealer_code: string;
  business_name: string;
  contact_person: string;
  phone: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useDealersData = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  const fetchDealers = async (): Promise<Dealer[]> => {
    if (!currentTenant) return [];

    const { data, error } = await supabase
      .from('dealers')
      .select('*')
      .eq('tenant_id', currentTenant.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  return useRealTimeSubscription<Dealer>(
    {
      table: 'dealers',
      filter: `tenant_id=eq.${currentTenant?.id}`,
    },
    fetchDealers
  );
};
