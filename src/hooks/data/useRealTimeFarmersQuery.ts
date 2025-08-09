
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryClient';
import { useFarmersQuery } from './useFarmersQuery';
import { useAppSelector } from '@/store/hooks';
import type { Farmer } from '@/services/FarmersService';

export const useRealTimeFarmersQuery = (options = {}) => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const farmersQuery = useFarmersQuery(options);

  useEffect(() => {
    if (!currentTenant) return;

    const channel = supabase
      .channel(`farmers_${currentTenant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farmers',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload) => {
          const farmer = payload.new as Farmer;
          
          if (payload.eventType === 'INSERT') {
            // Add to farmers list cache
            queryClient.setQueryData(
              queryKeys.farmersList(currentTenant.id, options),
              (oldData: any) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  data: [farmer, ...oldData.data],
                  count: (oldData.count || 0) + 1,
                };
              }
            );
            
            // Set individual farmer cache
            queryClient.setQueryData(queryKeys.farmer(farmer.id, currentTenant.id), farmer);
            
          } else if (payload.eventType === 'UPDATE') {
            // Update farmers list cache
            queryClient.setQueryData(
              queryKeys.farmersList(currentTenant.id, options),
              (oldData: any) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  data: oldData.data.map((f: Farmer) => 
                    f.id === farmer.id ? farmer : f
                  ),
                };
              }
            );
            
            // Update individual farmer cache
            queryClient.setQueryData(queryKeys.farmer(farmer.id, currentTenant.id), farmer);
            
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            
            // Remove from farmers list cache
            queryClient.setQueryData(
              queryKeys.farmersList(currentTenant.id, options),
              (oldData: any) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  data: oldData.data.filter((f: Farmer) => f.id !== deletedId),
                  count: Math.max(0, (oldData.count || 0) - 1),
                };
              }
            );
            
            // Remove individual farmer cache
            queryClient.removeQueries({ queryKey: queryKeys.farmer(deletedId, currentTenant.id) });
          }

          // Invalidate stats queries
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.farmerStats(currentTenant.id) 
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant, queryClient, options]);

  return farmersQuery;
};
