/**
 * Real-time Tenant Data Hook
 * Provides real-time updates for any tenant-scoped table
 */

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeConfig {
  tableName: string;
  tenantId: string;
  queryKey: readonly unknown[];
  enabled?: boolean;
}

export interface RealtimeStatus {
  isConnected: boolean;
  lastUpdate: Date | null;
  error: string | null;
}

export const useRealtimeTenantData = (config: RealtimeConfig) => {
  const { tableName, tenantId, queryKey, enabled = true } = config;
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [status, setStatus] = useState<RealtimeStatus>({
    isConnected: false,
    lastUpdate: null,
    error: null
  });

  useEffect(() => {
    if (!enabled || !tenantId || !tableName) {
      return;
    }

    const channelName = `realtime_${tableName}_${tenantId}`;
    console.log(`[Realtime] Setting up channel: ${channelName}`);

    // Clean up any existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create new channel
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: `tenant_id=eq.${tenantId}`
        },
        (payload) => {
          console.log(`[Realtime] ${tableName} update:`, payload);
          
          // Update status
          setStatus({
            isConnected: true,
            lastUpdate: new Date(),
            error: null
          });

          // Invalidate the query to trigger a refetch
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Channel ${channelName} status:`, status);
        
        if (status === 'SUBSCRIBED') {
          setStatus(prev => ({
            ...prev,
            isConnected: true,
            error: null
          }));
        } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          setStatus(prev => ({
            ...prev,
            isConnected: false,
            error: `Channel ${status.toLowerCase()}`
          }));
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount or when dependencies change
    return () => {
      console.log(`[Realtime] Cleaning up channel: ${channelName}`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setStatus({
        isConnected: false,
        lastUpdate: null,
        error: null
      });
    };
  }, [enabled, tenantId, tableName, queryKey, queryClient]);

  return status;
};