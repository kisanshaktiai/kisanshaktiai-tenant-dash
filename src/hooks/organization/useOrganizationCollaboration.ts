import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';

interface UserPresence {
  userId: string;
  userName: string;
  editingField?: string;
  lastSeen: string;
}

interface CollaborationState {
  activeUsers: UserPresence[];
  isFieldLocked: (fieldName: string) => boolean;
  lockField: (fieldName: string) => void;
  unlockField: (fieldName: string) => void;
}

export const useOrganizationCollaboration = (): CollaborationState => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { user } = useAppSelector((state) => state.auth);
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [currentEditingField, setCurrentEditingField] = useState<string | undefined>();

  useEffect(() => {
    if (!currentTenant?.id || !user?.id) return;

    const channel = supabase.channel(`org-presence-${currentTenant.id}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: UserPresence[] = [];
        
        Object.keys(state).forEach((key) => {
          const presences = state[key] as any[];
          presences.forEach((presence) => {
            if (presence.userId !== user.id) {
              users.push(presence as UserPresence);
            }
          });
        });
        
        setActiveUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: user.id,
            userName: user.email?.split('@')[0] || 'Unknown User',
            editingField: currentEditingField,
            lastSeen: new Date().toISOString(),
          });
        }
      });

    // Update presence when editing field changes
    const updatePresence = async () => {
      if (channel.state === 'joined') {
        await channel.track({
          userId: user.id,
          userName: user.email?.split('@')[0] || 'Unknown User',
          editingField: currentEditingField,
          lastSeen: new Date().toISOString(),
        });
      }
    };

    updatePresence();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, user?.id, user?.email, currentEditingField]);

  const isFieldLocked = useCallback(
    (fieldName: string): boolean => {
      return activeUsers.some((u) => u.editingField === fieldName);
    },
    [activeUsers]
  );

  const lockField = useCallback((fieldName: string) => {
    setCurrentEditingField(fieldName);
  }, []);

  const unlockField = useCallback((fieldName: string) => {
    setCurrentEditingField((current) => (current === fieldName ? undefined : current));
  }, []);

  return {
    activeUsers,
    isFieldLocked,
    lockField,
    unlockField,
  };
};
