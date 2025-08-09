
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { queryKeys } from '@/lib/queryClient';
import { useDealersQuery } from './useDealersQuery';
import type { Dealer, DealersListOptions } from '@/services/DealersService';

export const useRealTimeDealersQuery = (options: DealersListOptions = {}) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const dealersQuery = useDealersQuery(options);

  useEffect(() => {
    if (!currentTenant) return;

    console.log('Setting up real-time subscription for dealers');

    const channel = supabase
      .channel(`dealers_changes_${currentTenant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dealers',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload) => {
          console.log('Dealers real-time event:', payload);

          if (payload.eventType === 'INSERT') {
            // Add new dealer to cache
            queryClient.setQueryData(
              queryKeys.dealersList(currentTenant.id),
              (old: any) => {
                if (old?.data) {
                  return {
                    ...old,
                    data: [payload.new as Dealer, ...old.data],
                    count: old.count + 1,
                  };
                }
                return old;
              }
            );
          } else if (payload.eventType === 'UPDATE') {
            // Update dealer in cache
            queryClient.setQueryData(
              queryKeys.dealer(payload.new.id, currentTenant.id),
              payload.new as Dealer
            );
            
            // Update in dealers list
            queryClient.setQueryData(
              queryKeys.dealersList(currentTenant.id),
              (old: any) => {
                if (old?.data) {
                  return {
                    ...old,
                    data: old.data.map((dealer: Dealer) =>
                      dealer.id === payload.new.id ? payload.new as Dealer : dealer
                    ),
                  };
                }
                return old;
              }
            );
          } else if (payload.eventType === 'DELETE') {
            // Remove dealer from cache
            queryClient.removeQueries({ queryKey: queryKeys.dealer(payload.old.id, currentTenant.id) });
            
            // Remove from dealers list
            queryClient.setQueryData(
              queryKeys.dealersList(currentTenant.id),
              (old: any) => {
                if (old?.data) {
                  return {
                    ...old,
                    data: old.data.filter((dealer: Dealer) => dealer.id !== payload.old.id),
                    count: Math.max(0, old.count - 1),
                  };
                }
                return old;
              }
            );
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up dealers real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [currentTenant, queryClient]);

  return dealersQuery;
};
