
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { queryKeys } from '@/lib/queryClient';

export const useRealTimeConnection = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const channelsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!currentTenant) return;

    console.log('Setting up real-time connections for tenant:', currentTenant.id);

    // Set up multiple real-time channels for different data types
    const channels = [
      // Farmers real-time updates
      supabase
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
            queryClient.invalidateQueries({ 
              queryKey: queryKeys.farmers(currentTenant.id) 
            });
          }
        ),

      // Dealers real-time updates
      supabase
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
            queryClient.invalidateQueries({ 
              queryKey: queryKeys.dealers(currentTenant.id) 
            });
          }
        ),

      // Analytics real-time updates
      supabase
        .channel(`tenant_analytics_${currentTenant.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'analytics_reports',
            filter: `tenant_id=eq.${currentTenant.id}`,
          },
          (payload) => {
            console.log('Analytics real-time update:', payload);
            queryClient.invalidateQueries({ 
              queryKey: queryKeys.analytics(currentTenant.id) 
            });
          }
        ),

      // User presence tracking
      supabase
        .channel(`tenant_presence_${currentTenant.id}`)
        .on('presence', { event: 'sync' }, () => {
          console.log('Presence sync');
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
        })
    ];

    // Subscribe to all channels
    channels.forEach((channel, index) => {
      const channelName = `channel_${index}_${currentTenant.id}`;
      channelsRef.current.add(channelName);
      channel.subscribe((status) => {
        console.log(`Channel ${channelName} status:`, status);
      });
    });

    return () => {
      console.log('Cleaning up real-time connections');
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      channelsRef.current.clear();
    };
  }, [currentTenant, queryClient]);

  return {
    isConnected: channelsRef.current.size > 0,
    activeChannels: channelsRef.current.size
  };
};
