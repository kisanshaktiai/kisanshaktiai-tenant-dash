
import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

interface UserSession {
  id: string;
  ip_address?: string;
  user_agent?: string;
  last_active_at: string;
  created_at: string;
}

export const useUserProfile = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is an admin user
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (adminUser) {
          setProfile({
            id: adminUser.id,
            email: adminUser.email,
            full_name: adminUser.full_name,
            role: adminUser.role,
            is_active: adminUser.is_active,
            created_at: adminUser.created_at,
          });
        } else {
          // For regular users, construct profile from auth user data
          setProfile({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name,
            role: 'user',
            is_active: true,
            created_at: user.created_at || new Date().toISOString(),
          });
        }

        // Fetch active sessions for this user
        if (currentTenant?.id) {
          const { data: userSessions, error: sessionsError } = await supabase
            .from('active_sessions')
            .select('*')
            .eq('user_id', user.id)
            .eq('tenant_id', currentTenant.id)
            .order('last_active_at', { ascending: false });

          if (sessionsError) {
            console.warn('Error fetching sessions:', sessionsError);
          } else {
            setSessions(userSessions || []);
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.id, currentTenant?.id]);

  const updateProfile = async (updates: Partial<Pick<UserProfile, 'full_name'>>) => {
    if (!user?.id || !profile) return;

    try {
      setError(null);
      
      // Try to update admin_users table first
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (adminUser) {
        const { error } = await supabase
          .from('admin_users')
          .update({
            full_name: updates.full_name,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    }
  };

  return {
    profile,
    sessions,
    loading,
    error,
    updateProfile,
  };
};
