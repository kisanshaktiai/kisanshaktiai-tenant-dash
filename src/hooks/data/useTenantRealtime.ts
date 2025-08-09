
import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';

export interface TenantRealtimeStatus {
  isConnected: boolean;
  activeChannels: number;
  lastUpdate?: Date;
}

export const useTenantRealtime = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const channelsRef = useRef<Set<string>>(new Set());
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const connectionStatusRef = useRef<TenantRealtimeStatus>({
    isConnected: false,
    activeChannels: 0
  });

  // Debounced invalidation to prevent excessive re-renders
  const debouncedInvalidate = useCallback((queryKey: readonly string[], delay = 300) => {
    const keyString = JSON.stringify(queryKey);
    
    // Clear existing timer
    const existingTimer = debounceTimersRef.current.get(keyString);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey });
      connectionStatusRef.current.lastUpdate = new Date();
      debounceTimersRef.current.delete(keyString);
    }, delay);

    debounceTimersRef.current.set(keyString, timer);
  }, [queryClient]);

  useEffect(() => {
    if (!currentTenant) return;

    console.log('Setting up tenant real-time subscriptions for:', currentTenant.id);

    const channels = [
      // Farmers channel
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
            debouncedInvalidate([...queryKeys.farmers(currentTenant.id)]);
            debouncedInvalidate([...queryKeys.farmerStats(currentTenant.id)]);
          }
        ),

      // Dealers channel
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
            debouncedInvalidate([...queryKeys.dealers(currentTenant.id)]);
          }
        ),

      // Products channel
      supabase
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
            debouncedInvalidate([...queryKeys.products(currentTenant.id)]);
          }
        ),

      // Analytics reports channel
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
            debouncedInvalidate([...queryKeys.analytics(currentTenant.id)]);
            debouncedInvalidate([...queryKeys.dashboardStats(currentTenant.id)]);
            debouncedInvalidate([...queryKeys.engagementStats(currentTenant.id)]);
          }
        )
    ];

    // Subscribe to all channels
    channels.forEach((channel, index) => {
      const channelName = `channel_${index}_${currentTenant.id}`;
      channelsRef.current.add(channelName);
      
      channel.subscribe((status) => {
        console.log(`Channel ${channelName} status:`, status);
        
        if (status === 'SUBSCRIBED') {
          connectionStatusRef.current.isConnected = true;
          connectionStatusRef.current.activeChannels = channelsRef.current.size;
        } else if (status === 'CHANNEL_ERROR') {
          connectionStatusRef.current.isConnected = false;
          toast.error('Real-time connection lost. Retrying...');
        } else if (status === 'CLOSED') {
          connectionStatusRef.current.isConnected = false;
        }
      });
    });

    return () => {
      console.log('Cleaning up tenant real-time subscriptions');
      
      // Clear debounce timers
      debounceTimersRef.current.forEach(timer => clearTimeout(timer));
      debounceTimersRef.current.clear();
      
      // Remove channels
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      
      channelsRef.current.clear();
      connectionStatusRef.current = {
        isConnected: false,
        activeChannels: 0
      };
    };
  }, [currentTenant, debouncedInvalidate]);

  return {
    isConnected: connectionStatusRef.current.isConnected,
    activeChannels: connectionStatusRef.current.activeChannels,
    lastUpdate: connectionStatusRef.current.lastUpdate
  };
};
