
import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { queryKeys } from '@/lib/queryClient';

export const useTenantRealtimeOptimized = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const channelsRef = useRef<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Batch invalidations to prevent cascade of re-renders
  const invalidationTimeoutRef = useRef<NodeJS.Timeout>();
  const pendingInvalidationsRef = useRef<Set<string>>(new Set());

  const batchInvalidateQueries = useCallback((queryKey: string) => {
    pendingInvalidationsRef.current.add(queryKey);
    
    // Clear existing timeout
    if (invalidationTimeoutRef.current) {
      clearTimeout(invalidationTimeoutRef.current);
    }
    
    // Batch invalidations with a small delay
    invalidationTimeoutRef.current = setTimeout(() => {
      const invalidations = Array.from(pendingInvalidationsRef.current);
      pendingInvalidationsRef.current.clear();
      
      // Invalidate all batched queries at once
      invalidations.forEach(key => {
        switch (key) {
          case 'farmers':
            queryClient.invalidateQueries({ 
              queryKey: queryKeys.farmers(currentTenant!.id)
            });
            queryClient.invalidateQueries({ 
              queryKey: queryKeys.farmerStats(currentTenant!.id)
            });
            break;
          case 'dealers':
            queryClient.invalidateQueries({ 
              queryKey: queryKeys.dealers(currentTenant!.id)
            });
            break;
          case 'products':
            queryClient.invalidateQueries({ 
              queryKey: queryKeys.products(currentTenant!.id)
            });
            break;
        }
      });
      
      setLastUpdate(new Date());
    }, 100); // 100ms debounce
  }, [queryClient, currentTenant]);

  useEffect(() => {
    if (!currentTenant) {
      setIsConnected(false);
      return;
    }

    console.log('Setting up optimized tenant real-time connections for:', currentTenant.id);
    
    const setupChannels = () => {
      // Single channel for all tenant data to reduce connection overhead
      const tenantChannel = supabase
        .channel(`tenant_all_${currentTenant.id}`)
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
            batchInvalidateQueries('farmers');
          }
        )
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
            batchInvalidateQueries('dealers');
          }
        )
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
            batchInvalidateQueries('products');
          }
        );

      const channels = [tenantChannel];
      
      // Subscribe to channels
      channels.forEach((channel) => {
        channel.subscribe((status) => {
          console.log(`Optimized channel ${channel.topic} status:`, status);
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
      console.log('Cleaning up optimized tenant real-time connections');
      
      // Clear any pending invalidations
      if (invalidationTimeoutRef.current) {
        clearTimeout(invalidationTimeoutRef.current);
      }
      pendingInvalidationsRef.current.clear();
      
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
      setIsConnected(false);
    };
  }, [currentTenant, batchInvalidateQueries]);

  return {
    isConnected,
    activeChannels: channelsRef.current.length,
    lastUpdate
  };
};
