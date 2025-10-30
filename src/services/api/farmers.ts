
import { ApiService } from './base';
import { supabase } from '@/integrations/supabase/client';

export interface CreateFarmerData {
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
  farmingExperience: string;
  totalLandSize: string;
  irrigationSource: string;
  hasStorage: boolean;
  hasTractor: boolean;
  primaryCrops: string[];
  notes: string;
  pin?: string;
  languagePreference?: string;
}

export interface FarmerCreateResult {
  success: boolean;
  farmerId?: string;
  userId?: string;
  farmerCode?: string;
  tempPassword?: string;
  error?: string;
}

class FarmersApiService extends ApiService {
  async getFarmers(tenantId: string) {
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    
    if (error) throw this.handleError(error);
    return data || [];
  }

  async getFarmer(farmerId: string, tenantId: string) {
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .eq('id', farmerId)
      .eq('tenant_id', tenantId)
      .single();
    
    if (error) throw this.handleError(error);
    return data;
  }

  async createFarmer(farmerData: any, tenantId: string) {
    const { data, error } = await supabase
      .from('farmers')
      .insert({ ...farmerData, tenant_id: tenantId })
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    return data;
  }

  async updateFarmer(farmerId: string, updates: any, tenantId: string) {
    const { data, error } = await supabase
      .from('farmers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', farmerId)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    return data;
  }

  async deleteFarmer(farmerId: string, tenantId: string) {
    const { error } = await supabase
      .from('farmers')
      .delete()
      .eq('id', farmerId)
      .eq('tenant_id', tenantId);
    
    if (error) throw this.handleError(error);
    return { success: true };
  }

  async getFarmerCount(tenantId: string) {
    const { count, error } = await supabase
      .from('farmers')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);
    
    if (error) throw this.handleError(error);
    return count || 0;
  }
}

export const farmersApi = new FarmersApiService();
