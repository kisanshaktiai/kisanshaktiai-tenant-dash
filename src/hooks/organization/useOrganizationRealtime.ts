import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

interface RealtimeStatus {
  isConnected: boolean;
  activeChannels: number;
  lastUpdate: Date | null;
}

export const useOrganizationRealtime = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const [status, setStatus] = useState<RealtimeStatus>({
    isConnected: false,
    activeChannels: 0,
    lastUpdate: null,
  });

  const invalidateQueries = useCallback(
    (table: string) => {
      const queryKeys: string[] = [];
      
      switch (table) {
        case 'tenants':
          queryKeys.push('organization-profile');
          break;
        case 'tenant_branding':
          queryKeys.push('organization-branding');
          break;
        case 'tenant_features':
          queryKeys.push('organization-features');
          break;
        case 'organization_settings':
          queryKeys.push('organization-settings');
          break;
        case 'tenant_subscriptions':
          queryKeys.push('organization-subscription');
          break;
      }

      queryKeys.forEach((key) => {
        queryClient.invalidateQueries({ 
          queryKey: [key, currentTenant?.id],
          refetchType: 'active'
        });
      });

      setStatus((prev) => ({ ...prev, lastUpdate: new Date() }));
    },
    [queryClient, currentTenant?.id]
  );

  useEffect(() => {
    if (!currentTenant?.id) return;

    const channels: any[] = [];
    let connectedChannels = 0;

    // Subscribe to tenants table
    const tenantsChannel = supabase
      .channel(`org-tenants-${currentTenant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenants',
          filter: `id=eq.${currentTenant.id}`,
        },
        (payload) => {
          console.log('Tenants change detected:', payload);
          invalidateQueries('tenants');
          if (payload.eventType === 'UPDATE') {
            toast.info('Organization profile updated');
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          connectedChannels++;
          setStatus((prev) => ({ ...prev, activeChannels: connectedChannels }));
        }
      });

    channels.push(tenantsChannel);

    // Subscribe to tenant_branding table
    const brandingChannel = supabase
      .channel(`org-branding-${currentTenant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenant_branding',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload) => {
          console.log('Branding change detected:', payload);
          invalidateQueries('tenant_branding');
          if (payload.eventType === 'UPDATE') {
            toast.info('Branding updated');
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          connectedChannels++;
          setStatus((prev) => ({ ...prev, activeChannels: connectedChannels }));
        }
      });

    channels.push(brandingChannel);

    // Subscribe to tenant_features table
    const featuresChannel = supabase
      .channel(`org-features-${currentTenant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenant_features',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload) => {
          console.log('Features change detected:', payload);
          invalidateQueries('tenant_features');
          if (payload.eventType === 'UPDATE') {
            toast.info('Features updated');
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          connectedChannels++;
          setStatus((prev) => ({ ...prev, activeChannels: connectedChannels }));
        }
      });

    channels.push(featuresChannel);

    // Subscribe to organization_settings table
    const settingsChannel = supabase
      .channel(`org-settings-${currentTenant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organization_settings',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload) => {
          console.log('Settings change detected:', payload);
          invalidateQueries('organization_settings');
          if (payload.eventType === 'UPDATE') {
            toast.info('Settings updated');
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          connectedChannels++;
          setStatus((prev) => ({ ...prev, activeChannels: connectedChannels }));
        }
      });

    channels.push(settingsChannel);

    // Subscribe to tenant_subscriptions table
    const subscriptionChannel = supabase
      .channel(`org-subscription-${currentTenant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenant_subscriptions',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload) => {
          console.log('Subscription change detected:', payload);
          invalidateQueries('tenant_subscriptions');
          if (payload.eventType === 'UPDATE') {
            toast.info('Subscription updated');
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          connectedChannels++;
          setStatus((prev) => ({ ...prev, activeChannels: connectedChannels }));
        }
      });

    channels.push(subscriptionChannel);

    setStatus((prev) => ({ ...prev, isConnected: true }));

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      setStatus({ isConnected: false, activeChannels: 0, lastUpdate: null });
    };
  }, [currentTenant?.id, invalidateQueries]);

  return status;
};
