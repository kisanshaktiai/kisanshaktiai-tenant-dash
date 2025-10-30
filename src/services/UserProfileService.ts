import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from './core/BaseApiService';

export interface UserProfileData {
  id: string;
  email?: string;
  full_name?: string;
  display_name?: string;
  mobile_number?: string;
  avatar_url?: string;
  bio?: string;
  date_of_birth?: string;
  gender?: string;
  address_line1?: string;
  address_line2?: string;
  village?: string;
  taluka?: string;
  district?: string;
  state?: string;
  pincode?: string;
  country?: string;
  preferred_language?: string;
  notification_preferences?: any;
  is_profile_complete?: boolean;
  last_active_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserTenantInfo {
  tenant_id: string;
  role: string;
  is_primary: boolean;
  is_active: boolean;
  tenant_name?: string;
  tenant_logo?: string;
}

class UserProfileService extends BaseApiService {
  async getUserProfile(userId: string): Promise<UserProfileData | null> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('farmer_id', userId)
        .single();

      return { data, error };
    });
  }

  async getUserTenants(userId: string, currentTenantId?: string): Promise<UserTenantInfo[]> {
    return this.executeQuery(async () => {
      let query = supabase
        .from('user_tenants')
        .select(`
          tenant_id,
          role,
          is_primary,
          is_active,
          tenants:tenant_id (
            name,
            logo_url
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (currentTenantId) {
        query = query.eq('tenant_id', currentTenantId);
      }

      const { data, error } = await query;

      if (error) return { data: [], error };

      const formattedData = (data || []).map((ut: any) => ({
        tenant_id: ut.tenant_id,
        role: ut.role,
        is_primary: ut.is_primary,
        is_active: ut.is_active,
        tenant_name: ut.tenants?.name,
        tenant_logo: ut.tenants?.logo_url,
      }));

      return { data: formattedData, error: null };
    });
  }

  async updateProfile(userId: string, updates: Partial<UserProfileData>): Promise<UserProfileData> {
    return this.executeQuery(async () => {
      // Remove fields that shouldn't be updated or have type conflicts
      const { id, email, created_at, preferred_language, ...updateData } = updates;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('farmer_id', userId)
        .select()
        .single();

      return { data, error };
    });
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await this.updateProfile(userId, { avatar_url: publicUrl });

      return publicUrl;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getActiveSessions(userId: string, tenantId: string) {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .order('last_active_at', { ascending: false });

      return { data, error };
    });
  }

  async terminateSession(sessionId: string): Promise<void> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('active_sessions')
        .delete()
        .eq('id', sessionId);

      return { data, error };
    });
  }
}

export const userProfileService = new UserProfileService();
