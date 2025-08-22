
import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGlobalErrorHandler } from '@/hooks/core/useGlobalErrorHandler';

export interface RealtimeOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  queryKeys: readonly string[];
  debounceMs?: number;
  enabled?: boolean;
}

export const useFocusedRealtime = (options: RealtimeOptions) => {
  const queryClient = useQueryClient();
  const { handleError } = useGlobalErrorHandler();
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<ReturnType<typeof supabase.channel>>();

  const debouncedInvalidate = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: options.queryKeys });
    }, options.debounceMs || 300);
  }, [queryClient, options.queryKeys, options.debounceMs]);

  useEffect(() => {
    if (!options.enabled) return;

    try {
      const channelName = `realtime_${options.table}_${Date.now()}`;
      const channel = supabase.channel(channelName);

      const postgresConfig: any = {
        event: options.event || '*',
        schema: 'public',
        table: options.table,
      };

      if (options.filter) {
        postgresConfig.filter = options.filter;
      }

      channel.on('postgres_changes', postgresConfig, (payload) => {
        console.log(`Realtime update for ${options.table}:`, payload);
        debouncedInvalidate();
      });

      channel.subscribe((status) => {
        console.log(`Realtime channel ${channelName} status:`, status);
        if (status === 'CHANNEL_ERROR') {
          handleError(
            new Error(`Realtime subscription error for ${options.table}`),
            'realtime'
          );
        }
      });

      channelRef.current = channel;

      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        supabase.removeChannel(channel);
      };
    } catch (error) {
      handleError(error, `realtime-setup-${options.table}`);
    }
  }, [
    options.enabled,
    options.table,
    options.event,
    options.filter,
    debouncedInvalidate,
    handleError,
  ]);

  return {
    isConnected: !!channelRef.current,
  };
};
