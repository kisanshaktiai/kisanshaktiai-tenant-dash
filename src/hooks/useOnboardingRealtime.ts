
import { useEffect, useRef, useCallback, useState } from 'react';
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
  const [status, setStatus] = useState<OnboardingRealtimeStatus>({
    isConnected: false,
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

  const setupChannel = useCallback(() => {
    if (!currentTenant?.id) return;

    console.log('Setting up onboarding real-time for tenant:', currentTenant.id);

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
          toast.success(`✅ Step completed!`);
        }
      }
    );

    // Subscribe and track connection status
    channel.subscribe((channelStatus) => {
      console.log(`Onboarding channel status:`, channelStatus);
      
      if (channelStatus === 'SUBSCRIBED') {
        setStatus(prev => ({ 
          ...prev, 
          isConnected: true
        }));
      } else if (channelStatus === 'CHANNEL_ERROR' || channelStatus === 'CLOSED') {
        setStatus(prev => ({ 
          ...prev, 
          isConnected: false
        }));
        // Just invalidate queries to ensure fresh data
        setTimeout(invalidateQueries, 1000);
      }
    });

    channelRef.current = channel;
  }, [currentTenant?.id, invalidateQueries]);

  useEffect(() => {
    if (!currentTenant?.id) return;

    setupChannel();

    return () => {
      console.log('Cleaning up onboarding real-time');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setStatus(prev => ({ ...prev, isConnected: false }));
    };
  }, [currentTenant?.id, setupChannel]);

  return {
    ...status,
  };
};
