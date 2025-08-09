
import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

export interface OnboardingRealtimeStatus {
  isConnected: boolean;
  lastUpdate?: Date;
  isReconnecting: boolean;
  reconnectAttempts: number;
}

export const useOnboardingRealtime = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const [status, setStatus] = useState<OnboardingRealtimeStatus>({
    isConnected: false,
    isReconnecting: false,
    reconnectAttempts: 0,
  });

  // Invalidate all tenant-related queries
  const invalidateQueries = useCallback(() => {
    if (!currentTenant?.id) return;
    
    queryClient.invalidateQueries({ 
      queryKey: ['onboarding', currentTenant.id] 
    });
    
    queryClient.invalidateQueries({ 
      queryKey: ['tenant-status', currentTenant.id] 
    });

    queryClient.invalidateQueries({ 
      queryKey: ['tenants'] 
    });
    
    setStatus(prev => ({ ...prev, lastUpdate: new Date() }));
  }, [queryClient, currentTenant?.id]);

  const reconnect = useCallback(() => {
    if (!currentTenant?.id || channelRef.current) return;

    setStatus(prev => ({ 
      ...prev, 
      isReconnecting: true, 
      reconnectAttempts: prev.reconnectAttempts + 1 
    }));

    // Clean up existing channel if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Setup channel again
    setupChannel();
  }, [currentTenant?.id]);

  const setupChannel = useCallback(() => {
    if (!currentTenant?.id) return;

    console.log('Setting up comprehensive real-time for tenant:', currentTenant.id);

    const channelName = `tenant_onboarding_${currentTenant.id}`;
    const channel = supabase.channel(channelName);

    // Listen to onboarding workflow changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'onboarding_workflows',
        filter: `tenant_id=eq.${currentTenant.id}`,
      },
      (payload) => {
        console.log('Onboarding workflow update:', payload);
        invalidateQueries();
        
        if (payload.eventType === 'UPDATE' && payload.new?.status === 'completed') {
          toast.success('🎉 Onboarding completed! Welcome aboard!');
        }
      }
    );

    // Listen to onboarding step changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'onboarding_steps',
      },
      (payload) => {
        console.log('Onboarding step update:', payload);
        invalidateQueries();
        
        if (payload.eventType === 'UPDATE' && payload.new?.step_status === 'completed') {
          toast.success(`✅ Step "${payload.new.step_name}" completed!`);
        }
      }
    );

    // Listen to tenant table changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tenants',
        filter: `id=eq.${currentTenant.id}`,
      },
      (payload) => {
        console.log('Tenant data update:', payload);
        invalidateQueries();
      }
    );

    // Listen to tenant branding changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tenant_branding',
        filter: `tenant_id=eq.${currentTenant.id}`,
      },
      (payload) => {
        console.log('Tenant branding update:', payload);
        invalidateQueries();
        toast.info('Branding updated successfully');
      }
    );

    // Listen to tenant features changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tenant_features',
        filter: `tenant_id=eq.${currentTenant.id}`,
      },
      (payload) => {
        console.log('Tenant features update:', payload);
        invalidateQueries();
        toast.info('Features updated successfully');
      }
    );

    // Listen to tenant subscriptions changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tenant_subscriptions',
        filter: `tenant_id=eq.${currentTenant.id}`,
      },
      (payload) => {
        console.log('Tenant subscription update:', payload);
        invalidateQueries();
        toast.info('Subscription updated successfully');
      }
    );

    // Subscribe and track connection status
    channel.subscribe((channelStatus) => {
      console.log(`Comprehensive onboarding channel status:`, channelStatus);
      
      if (channelStatus === 'SUBSCRIBED') {
        setStatus(prev => ({ 
          ...prev, 
          isConnected: true, 
          isReconnecting: false 
        }));
      } else if (channelStatus === 'CHANNEL_ERROR') {
        setStatus(prev => ({ 
          ...prev, 
          isConnected: false, 
          isReconnecting: false 
        }));
        toast.error('Real-time connection lost. Data may be outdated.');
        // Invalidate queries to ensure we have fresh data
        setTimeout(invalidateQueries, 1000);
      } else if (channelStatus === 'CLOSED') {
        setStatus(prev => ({ 
          ...prev, 
          isConnected: false, 
          isReconnecting: false 
        }));
      }
    });

    channelRef.current = channel;
  }, [currentTenant?.id, invalidateQueries]);

  useEffect(() => {
    if (!currentTenant?.id) return;

    setupChannel();

    return () => {
      console.log('Cleaning up comprehensive real-time');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setStatus(prev => ({ ...prev, isConnected: false }));
    };
  }, [currentTenant?.id, setupChannel]);

  return {
    ...status,
    reconnect,
  };
};
