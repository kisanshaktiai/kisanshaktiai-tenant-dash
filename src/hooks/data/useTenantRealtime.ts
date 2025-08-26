
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { queryKeys } from '@/lib/queryClient';

export const useTenantRealtime = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const channelsRef = useRef<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!currentTenant) {
      setIsConnected(false);
      return;
    }

    console.log('Setting up tenant real-time connections for:', currentTenant.id);
    
    const setupChannels = async () => {
      // Farmers channel
      const farmersChannel = supabase
        .channel(`tenant_farmers_${currentTenant.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'farmers',
            filter: `tenant_id=eq.${currentTenant.id}`,
          },
          (payload) => {
            console.log('Farmers real-time update:', payload);
            setLastUpdate(new Date());
            
            // Invalidate related queries
            queryClient.invalidateQueries({ 
              queryKey: queryKeys.farmers(currentTenant.id)
            });
            queryClient.invalidateQueries({ 
              queryKey: queryKeys.farmerStats(currentTenant.id)
            });
          }
        );

      // Dealers channel
      const dealersChannel = supabase
        .channel(`tenant_dealers_${currentTenant.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'dealers',
            filter: `tenant_id=eq.${currentTenant.id}`,
          },
          (payload) => {
            console.log('Dealers real-time update:', payload);
            setLastUpdate(new Date());
            
            queryClient.invalidateQueries({ 
              queryKey: queryKeys.dealers(currentTenant.id)
            });
          }
        );

      // Products channel
      const productsChannel = supabase
        .channel(`tenant_products_${currentTenant.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'products',
            filter: `tenant_id=eq.${currentTenant.id}`,
          },
          (payload) => {
            console.log('Products real-time update:', payload);
            setLastUpdate(new Date());
            
            queryClient.invalidateQueries({ 
              queryKey: queryKeys.products(currentTenant.id)
            });
          }
        );

      // Subscribe to channels
      const channels = [farmersChannel, dealersChannel, productsChannel];
      
      channels.forEach((channel) => {
        channel.subscribe((status) => {
          console.log(`Channel status:`, status);
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            channelsRef.current.add(channel.topic);
          }
        });
      });

      return channels;
    };

    const channels = setupChannels();

    return () => {
      console.log('Cleaning up tenant real-time connections');
      channels.then(channelList => {
        channelList.forEach((channel) => {
          supabase.removeChannel(channel);
        });
      });
      channelsRef.current.clear();
      setIsConnected(false);
    };
  }, [currentTenant, queryClient]);

  return {
    isConnected,
    activeChannels: channelsRef.current.size,
    lastUpdate
  };
};
