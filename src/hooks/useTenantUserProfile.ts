import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  tenantUserProfileService,
  type TenantUserProfile,
  type UpdateTenantUserProfile,
} from '@/services/TenantUserProfileService';

export const useTenantUserProfile = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const [profile, setProfile] = useState<TenantUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !currentTenant?.id) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const profileData = await tenantUserProfileService.getTenantUserProfile(
          user.id,
          currentTenant.id
        );

        if (profileData) {
          setProfile(profileData);
        } else {
          // Fallback to basic auth data
          setProfile({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name,
            phone: user.user_metadata?.phone,
            avatar_url: user.user_metadata?.avatar_url,
            created_at: user.created_at || new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Error fetching tenant user profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        
        // Fallback to basic auth data
        setProfile({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name,
          created_at: user.created_at || new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id, currentTenant?.id]);

  const updateProfile = async (updates: UpdateTenantUserProfile) => {
    if (!user?.id || !currentTenant?.id || !profile) return false;

    try {
      setError(null);
      const success = await tenantUserProfileService.updateTenantUserProfile(
        user.id,
        currentTenant.id,
        updates
      );

      if (success) {
        setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      }

      return success;
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
      const avatarUrl = await tenantUserProfileService.uploadAvatar(user.id, file);
      setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : null));
      return avatarUrl;
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
      return null;
    }
  };

  const changePassword = async (newPassword: string) => {
    try {
      setError(null);
      await tenantUserProfileService.changePassword(newPassword);
      return true;
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err instanceof Error ? err.message : 'Failed to change password');
      return false;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    changePassword,
  };
};
