
import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { userProfileService, type UserProfileData, type UserTenantInfo } from '@/services/UserProfileService';

interface UserSession {
  id: string;
  ip_address?: string;
  user_agent?: string;
  last_active_at: string;
  created_at: string;
}

interface EnhancedUserProfile extends UserProfileData {
  role?: string;
  tenant_info?: UserTenantInfo;
}

export const useUserProfile = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const [profile, setProfile] = useState<EnhancedUserProfile | null>(null);
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

        // Fetch user profile from user_profiles table
        const userProfile = await userProfileService.getUserProfile(user.id);

        if (userProfile) {
          // Fetch tenant role information
          let tenantInfo: UserTenantInfo | undefined;
          if (currentTenant?.id) {
            const tenants = await userProfileService.getUserTenants(user.id, currentTenant.id);
            tenantInfo = tenants[0];
          }

          setProfile({
            ...userProfile,
            email: userProfile.email || user.email || '',
            role: tenantInfo?.role || 'user',
            tenant_info: tenantInfo,
          });

          // Fetch active sessions
          if (currentTenant?.id) {
            const userSessions = await userProfileService.getActiveSessions(user.id, currentTenant.id);
            setSessions(userSessions || []);
          }
        } else {
          // Fallback: Create profile from auth.user metadata
          setProfile({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name,
            display_name: user.user_metadata?.display_name,
            mobile_number: user.user_metadata?.mobile_number,
            role: 'user',
            created_at: user.created_at || new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        
        // Fallback to auth user data
        setProfile({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name,
          role: 'user',
          created_at: user.created_at || new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.id, currentTenant?.id]);

  const updateProfile = async (updates: Partial<UserProfileData>) => {
    if (!user?.id || !profile) return false;

    try {
      setError(null);
      const updatedProfile = await userProfileService.updateProfile(user.id, updates);
      setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user?.id) return null;

    try {
      setError(null);
      const avatarUrl = await userProfileService.uploadAvatar(user.id, file);
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      return avatarUrl;
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
      return null;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setError(null);
      await userProfileService.changePassword(currentPassword, newPassword);
      return true;
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err instanceof Error ? err.message : 'Failed to change password');
      return false;
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      setError(null);
      await userProfileService.terminateSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      return true;
    } catch (err) {
      console.error('Error terminating session:', err);
      setError(err instanceof Error ? err.message : 'Failed to terminate session');
      return false;
    }
  };

  return {
    profile,
    sessions,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    changePassword,
    terminateSession,
  };
};
