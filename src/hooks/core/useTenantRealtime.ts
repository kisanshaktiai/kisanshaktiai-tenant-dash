
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTenantRealtime = (
  userId: string | undefined,
  currentTenantId: string | undefined,
  onTenantChange: () => void
) => {
  const handleRealtimeChange = useCallback(() => {
    console.log('useTenantRealtime: Real-time tenant data change detected');
    // Debounce rapid changes
    setTimeout(() => {
      onTenantChange();
    }, 500);
  }, [onTenantChange]);

  useEffect(() => {
    if (!userId) return;

    console.log('useTenantRealtime: Setting up real-time subscriptions for user:', userId);

    const channel = supabase
      .channel(`tenant_changes_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_tenants',
          filter: `user_id=eq.${userId}`,
        },
        handleRealtimeChange
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenants',
        },
        (payload) => {
          console.log('useTenantRealtime: Real-time tenant update detected:', payload.eventType);
          const payloadNew = payload.new as Record<string, any> | null;
          const payloadOld = payload.old as Record<string, any> | null;
          const payloadId = payloadNew?.id || payloadOld?.id;
          
          if (currentTenantId && payloadId && payloadId === currentTenantId) {
            handleRealtimeChange();
          }
        }
      )
      .subscribe();

    return () => {
      console.log('useTenantRealtime: Cleaning up real-time subscriptions');
      supabase.removeChannel(channel);
    };
  }, [userId, currentTenantId, handleRealtimeChange]);
};
