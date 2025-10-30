import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { enhancedFarmerDataService } from '@/services/EnhancedFarmerDataService';

export const useRealtimeFarmerNotes = (farmerId: string) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  const notesQuery = useQuery({
    queryKey: ['farmer-notes', currentTenant?.id, farmerId],
    queryFn: async () => {
      if (!currentTenant) throw new Error('No tenant selected');
      return enhancedFarmerDataService.getFarmerNotes(currentTenant.id, farmerId);
    },
    enabled: !!currentTenant && !!farmerId,
    staleTime: 0,
  });

  useEffect(() => {
    if (!currentTenant?.id || !farmerId) return;

    const channel = supabase.channel(`farmer_notes_${farmerId}_${currentTenant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farmer_notes',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload: any) => {
          if (payload.new?.farmer_id === farmerId || payload.old?.farmer_id === farmerId) {
            console.log('[RealtimeFarmerNotes] Update received:', payload);
            queryClient.invalidateQueries({
              queryKey: ['farmer-notes', currentTenant.id, farmerId],
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [currentTenant, farmerId, queryClient]);

  return notesQuery;
};