
import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

export interface OnboardingRealtimeStatus {
  isConnected: boolean;
  lastUpdate?: Date;
}

export const useOnboardingRealtime = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const statusRef = useRef<OnboardingRealtimeStatus>({
    isConnected: false
  });

  // Invalidate onboarding queries
  const invalidateOnboarding = useCallback(() => {
    if (!currentTenant?.id) return;
    
    queryClient.invalidateQueries({ 
      queryKey: ['onboarding', currentTenant.id] 
    });
    
    statusRef.current.lastUpdate = new Date();
  }, [queryClient, currentTenant?.id]);

  useEffect(() => {
    if (!currentTenant?.id) return;

    console.log('Setting up onboarding real-time for tenant:', currentTenant.id);

    // Create dedicated channel for onboarding
    const channelName = `onboarding_${currentTenant.id}`;
    const channel = supabase.channel(channelName);

    // Listen to workflow changes
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
        invalidateOnboarding();
        
        if (payload.eventType === 'UPDATE' && payload.new?.status === 'completed') {
          toast.success('Onboarding completed! Welcome aboard! 🎉');
        }
      }
    );

    // Listen to step changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'onboarding_steps',
      },
      (payload) => {
        console.log('Onboarding step update:', payload);
        invalidateOnboarding();
        
        if (payload.eventType === 'UPDATE' && payload.new?.step_status === 'completed') {
          toast.success(`Step "${payload.new.step_name}" completed!`);
        }
      }
    );

    // Subscribe and track connection status
    channel.subscribe((status) => {
      console.log(`Onboarding channel status:`, status);
      
      if (status === 'SUBSCRIBED') {
        statusRef.current.isConnected = true;
      } else if (status === 'CHANNEL_ERROR') {
        statusRef.current.isConnected = false;
        toast.error('Real-time connection lost. Refreshing...');
        setTimeout(invalidateOnboarding, 1000);
      } else if (status === 'CLOSED') {
        statusRef.current.isConnected = false;
      }
    });

    channelRef.current = channel;

    return () => {
      console.log('Cleaning up onboarding real-time');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      statusRef.current.isConnected = false;
    };
  }, [currentTenant?.id, invalidateOnboarding]);

  return {
    isConnected: statusRef.current.isConnected,
    lastUpdate: statusRef.current.lastUpdate
  };
};
