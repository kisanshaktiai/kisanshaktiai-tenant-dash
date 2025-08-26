
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';

interface RealtimeSubscription {
  table: string;
  filter?: string;
  queryKeys: readonly string[];
  onUpdate?: (payload: any) => void;
}

class ConsolidatedRealtimeService {
  private static instance: ConsolidatedRealtimeService;
  private channel: any = null;
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private queryClient: any = null;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private constructor() {}

  static getInstance(): ConsolidatedRealtimeService {
    if (!ConsolidatedRealtimeService.instance) {
      ConsolidatedRealtimeService.instance = new ConsolidatedRealtimeService();
    }
    return ConsolidatedRealtimeService.instance;
  }

  initialize(queryClient: any) {
    this.queryClient = queryClient;
  }

  private debouncedInvalidate(queryKey: readonly string[], delay = 300) {
    const keyString = JSON.stringify(queryKey);
    
    const existingTimer = this.debounceTimers.get(keyString);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      if (this.queryClient) {
        this.queryClient.invalidateQueries({ queryKey });
      }
      this.debounceTimers.delete(keyString);
    }, delay);

    this.debounceTimers.set(keyString, timer);
  }

  subscribe(tenantId: string, subscriptions: RealtimeSubscription[]) {
    if (this.channel) {
      this.unsubscribe();
    }

    const channelName = `tenant_realtime_${tenantId}`;
    this.channel = supabase.channel(channelName);

    // Store subscriptions for reference
    subscriptions.forEach((sub, index) => {
      this.subscriptions.set(`${tenantId}_${index}`, sub);
    });

    // Set up postgres changes listeners
    subscriptions.forEach((subscription) => {
      const config: any = {
        event: '*',
        schema: 'public',
        table: subscription.table,
      };

      if (subscription.filter) {
        config.filter = subscription.filter;
      }

      this.channel.on('postgres_changes', config, (payload: any) => {
        console.log(`Realtime update for ${subscription.table}:`, payload);
        
        // Custom handler if provided
        if (subscription.onUpdate) {
          subscription.onUpdate(payload);
        }

        // Debounced query invalidation
        this.debouncedInvalidate(subscription.queryKeys);
      });
    });

    // Subscribe with status tracking
    this.channel.subscribe((status: string) => {
      console.log(`Consolidated realtime channel status:`, status);
      
      if (status === 'SUBSCRIBED') {
        this.isConnected = true;
        this.reconnectAttempts = 0;
      } else if (status === 'CHANNEL_ERROR') {
        this.isConnected = false;
        this.handleReconnect();
      } else if (status === 'CLOSED') {
        this.isConnected = false;
      }
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        toast.info(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        // Implement reconnection logic here
      }, Math.pow(2, this.reconnectAttempts) * 1000);
    } else {
      toast.error('Real-time connection lost. Please refresh the page.');
    }
  }

  unsubscribe() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }

    // Clear debounce timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
    
    this.subscriptions.clear();
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      activeChannels: this.subscriptions.size,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

export const consolidatedRealtimeService = ConsolidatedRealtimeService.getInstance();
