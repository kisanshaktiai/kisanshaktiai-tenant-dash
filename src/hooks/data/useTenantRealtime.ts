
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { queryKeys } from '@/lib/queryClient';

export const useTenantRealtime = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const channelsRef = useRef<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!currentTenant?.id) {
      setIsConnected(false);
      return;
    }
    
    const setupChannels = () => {
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
            
            queryClient.invalidateQueries({ 
              queryKey: queryKeys.farmers(currentTenant.id)
            });
            queryClient.invalidateQueries({ 
              queryKey: queryKeys.farmerStats(currentTenant.id)
            });
            queryClient.invalidateQueries({ 
              queryKey: queryKeys.dashboardStats(currentTenant.id)
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
            queryClient.invalidateQueries({ 
              queryKey: queryKeys.dashboardStats(currentTenant.id)
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
            queryClient.invalidateQueries({ 
              queryKey: queryKeys.dashboardStats(currentTenant.id)
            });
          }
        );

      // Lands channel
      const landsChannel = supabase
        .channel(`tenant_lands_${currentTenant.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'lands',
            filter: `tenant_id=eq.${currentTenant.id}`,
          },
          (payload) => {
            console.log('Lands real-time update:', payload);
            setLastUpdate(new Date());
            
            queryClient.invalidateQueries({ 
              queryKey: ['enhanced-dashboard', currentTenant.id]
            });
          }
        );

      // Campaigns channel
      const campaignsChannel = supabase
        .channel(`tenant_campaigns_${currentTenant.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'campaigns',
            filter: `tenant_id=eq.${currentTenant.id}`,
          },
          (payload) => {
            console.log('Campaigns real-time update:', payload);
            setLastUpdate(new Date());
            
            queryClient.invalidateQueries({ 
              queryKey: ['enhanced-dashboard', currentTenant.id]
            });
          }
        );

      const channels = [farmersChannel, dealersChannel, productsChannel, landsChannel, campaignsChannel];
      
      // Subscribe to channels
      channels.forEach((channel) => {
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
          } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            setIsConnected(false);
          }
        });
      });

      channelsRef.current = channels;
      return channels;
    };

    const channels = setupChannels();

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
      setIsConnected(false);
    };
  }, [currentTenant, queryClient]);

  return {
    isConnected,
    activeChannels: channelsRef.current.length,
    lastUpdate
  };
};
