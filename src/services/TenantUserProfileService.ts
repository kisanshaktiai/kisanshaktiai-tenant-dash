import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from './core/BaseApiService';

export interface TenantUserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  tenant_role?: string;
  department?: string;
  designation?: string;
  employee_id?: string;
  is_active?: boolean;
  tenant_info?: {
    id: string;
    name: string;
    type: string;
    status: string;
    subscription_plan: string;
    owner_email?: string;
  };
}

export interface UpdateTenantUserProfile {
  full_name?: string;
  phone?: string;
  department?: string;
  designation?: string;
  employee_id?: string;
}

class TenantUserProfileService extends BaseApiService {
  /**
   * Get tenant user profile data
   */
  async getTenantUserProfile(userId: string, tenantId: string): Promise<TenantUserProfile | null> {
    return this.executeQuery(async () => {
      // Fetch from auth.users and user_tenants
      const { data: authData } = await supabase.auth.getUser();
      
      const { data: userTenantData, error: userTenantError } = await supabase
        .from('user_tenants')
        .select(`
          role,
          department,
          designation,
          employee_id,
          is_active,
          tenants:tenant_id (
            id,
            name,
            type,
            status,
            subscription_plan,
            owner_email
          )
        `)
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .single();

      if (userTenantError) {
        return { data: null, error: userTenantError };
      }

      const profile: TenantUserProfile = {
        id: userId,
        email: authData.user?.email || '',
        full_name: authData.user?.user_metadata?.full_name || authData.user?.user_metadata?.name,
        phone: authData.user?.user_metadata?.phone || authData.user?.user_metadata?.mobile_number,
        avatar_url: authData.user?.user_metadata?.avatar_url,
        created_at: authData.user?.created_at || new Date().toISOString(),
        tenant_role: userTenantData?.role,
        department: userTenantData?.department,
        designation: userTenantData?.designation,
        employee_id: userTenantData?.employee_id,
        is_active: userTenantData?.is_active,
        tenant_info: userTenantData?.tenants ? {
          id: (userTenantData.tenants as any).id,
          name: (userTenantData.tenants as any).name,
          type: (userTenantData.tenants as any).type,
          status: (userTenantData.tenants as any).status,
          subscription_plan: (userTenantData.tenants as any).subscription_plan,
          owner_email: (userTenantData.tenants as any).owner_email,
        } : undefined,
      };

      return { data: profile, error: null };
    });
  }

  /**
   * Update tenant user profile (user_tenants table)
   */
  async updateTenantUserProfile(
    userId: string,
    tenantId: string,
    updates: UpdateTenantUserProfile
  ): Promise<boolean> {
    try {
      // Update user_tenants table
      const { department, designation, employee_id } = updates;
      
      const userTenantUpdates: any = {
        updated_at: new Date().toISOString(),
      };

      if (department !== undefined) userTenantUpdates.department = department;
      if (designation !== undefined) userTenantUpdates.designation = designation;
      if (employee_id !== undefined) userTenantUpdates.employee_id = employee_id;

      const { error: tenantError } = await supabase
        .from('user_tenants')
        .update(userTenantUpdates)
        .eq('user_id', userId)
        .eq('tenant_id', tenantId);

      if (tenantError) throw tenantError;

      // Update auth user metadata
      const { full_name, phone } = updates;
      if (full_name || phone) {
        const metadataUpdates: any = {};
        if (full_name) metadataUpdates.full_name = full_name;
        if (phone) metadataUpdates.phone = phone;

        const { error: authError } = await supabase.auth.updateUser({
          data: metadataUpdates,
        });

        if (authError) throw authError;
      }

      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload avatar to Supabase Storage
   */
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

      // Update user metadata with new avatar URL
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      return publicUrl;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Change password
   */
  async changePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all user tenants
   */
  async getUserTenants(userId: string) {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('user_tenants')
        .select(`
          tenant_id,
          role,
          is_active,
          is_primary,
          department,
          designation,
          joined_at,
          tenants:tenant_id (
            id,
            name,
            type,
            status,
            subscription_plan
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('is_primary', { ascending: false });

      return { data, error };
    });
  }
}

export const tenantUserProfileService = new TenantUserProfileService();
