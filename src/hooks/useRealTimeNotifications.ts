
import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export const useRealTimeNotifications = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { user } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const handleNotification = useCallback((payload: any) => {
    const notification: Notification = {
      id: payload.new.id || Date.now().toString(),
      title: payload.new.title || 'New Update',
      message: payload.new.message || 'You have a new notification',
      type: payload.new.type || 'info',
      timestamp: new Date(payload.new.created_at || Date.now()),
      read: false,
      actionUrl: payload.new.action_url,
      metadata: payload.new.metadata
    };

    setNotifications(prev => [notification, ...prev.slice(0, 99)]);

    // Show toast notification
    toast(notification.title, {
      description: notification.message,
      action: notification.actionUrl ? {
        label: 'View',
        onClick: () => window.location.href = notification.actionUrl!
      } : undefined
    });
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    if (!currentTenant?.id || !user?.id) return;

    console.log('Setting up real-time notifications for tenant:', currentTenant.id);

    const channels = [
      // Farmer activity notifications
      supabase
        .channel(`notifications_${currentTenant.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'farmers',
            filter: `tenant_id=eq.${currentTenant.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              handleNotification({
                new: {
                  title: 'New Farmer Registered',
                  message: `A new farmer has joined your network`,
                  type: 'success',
                  created_at: new Date().toISOString()
                }
              });
            }
          }
        ),

      // System notifications
      supabase
        .channel(`system_notifications_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          handleNotification
        ),

      // Dealer network updates
      supabase
        .channel(`dealer_updates_${currentTenant.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'dealers',
            filter: `tenant_id=eq.${currentTenant.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              handleNotification({
                new: {
                  title: 'New Dealer Added',
                  message: `A new dealer has been added to your network`,
                  type: 'info',
                  created_at: new Date().toISOString()
                }
              });
            }
          }
        )
    ];

    // Subscribe to all channels
    channels.forEach((channel, index) => {
      channel.subscribe((status) => {
        console.log(`Notification channel ${index} status:`, status);
        setIsConnected(status === 'SUBSCRIBED');
      });
    });

    return () => {
      console.log('Cleaning up notification channels');
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
      setIsConnected(false);
    };
  }, [currentTenant?.id, user?.id, handleNotification]);

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    isConnected,
    markAsRead,
    clearAll
  };
};
