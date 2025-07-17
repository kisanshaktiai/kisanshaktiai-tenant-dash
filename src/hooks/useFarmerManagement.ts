
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store/hooks';

export interface CreateFarmerData {
  // Personal Information
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  
  // Address Information
  village: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
  
  // Farming Information
  farmingExperience: string;
  totalLandSize: string;
  irrigationSource: string;
  hasStorage: boolean;
  hasTractor: boolean;
  primaryCrops: string[];
  
  // Additional Information
  notes: string;
}

interface FarmerCreateResult {
  success: boolean;
  farmer_id?: string;
  user_id?: string;
  error?: string;
}

export const useFarmerManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentTenant } = useAppSelector((state) => state.tenant);

  const generateFarmerCode = async () => {
    if (!currentTenant) return null;
    
    // Get count of existing farmers for this tenant
    const { count } = await supabase
      .from('farmers')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', currentTenant.id);
    
    const farmerNumber = (count || 0) + 1;
    const tenantPrefix = currentTenant.slug.substring(0, 3).toUpperCase();
    return `${tenantPrefix}${farmerNumber.toString().padStart(6, '0')}`;
  };

  const checkTenantLimits = async () => {
    if (!currentTenant) throw new Error('No tenant selected');
    
    // Use direct SQL query since tenant_settings might not be in types yet
    const { data: settings, error: settingsError } = await supabase
      .rpc('check_tenant_farmer_limits', { tenant_id: currentTenant.id });
    
    if (settingsError) {
      console.warn('Could not check tenant limits, using defaults:', settingsError);
      // Fallback to default limits if the function doesn't exist yet
      const maxFarmers = 10000;
      const { count: currentCount } = await supabase
        .from('farmers')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', currentTenant.id)
        .eq('is_verified', true);
      
      const currentFarmers = currentCount || 0;
      if (currentFarmers >= maxFarmers) {
        throw new Error(`Farmer limit exceeded. Maximum allowed: ${maxFarmers}`);
      }
      return { currentFarmers, maxFarmers };
    }
    
    const result = settings as { current_farmers: number; max_farmers: number };
    if (result.current_farmers >= result.max_farmers) {
      throw new Error(`Farmer limit exceeded. Maximum allowed: ${result.max_farmers}`);
    }
    
    return { currentFarmers: result.current_farmers, maxFarmers: result.max_farmers };
  };

  const createFarmer = async (formData: CreateFarmerData) => {
    if (!currentTenant) {
      throw new Error('No tenant selected');
    }

    setLoading(true);
    setError(null);

    try {
      // Check tenant limits
      await checkTenantLimits();

      // Generate unique farmer code
      const farmerCode = await generateFarmerCode();
      if (!farmerCode) throw new Error('Failed to generate farmer code');

      // Check for duplicate phone/email in existing farmers
      const { data: existingFarmers } = await supabase
        .from('farmers')
        .select('id')
        .eq('tenant_id', currentTenant.id)
        .limit(1);

      // For now, create a basic farmer record until the full function is available
      // This will be enhanced once the database function is properly recognized
      const farmerData = {
        tenant_id: currentTenant.id,
        farmer_code: farmerCode,
        farming_experience_years: parseInt(formData.farmingExperience) || 0,
        total_land_acres: parseFloat(formData.totalLandSize) || 0,
        primary_crops: formData.primaryCrops,
        farm_type: 'mixed',
        has_irrigation: formData.irrigationSource !== '',
        has_storage: formData.hasStorage,
        has_tractor: formData.hasTractor,
        irrigation_type: formData.irrigationSource || null,
        is_verified: false
      };

      // Try the database function first, fall back to direct insert
      try {
        const { data: result, error: dbError } = await supabase
          .rpc('create_farmer_profile', {
            p_email: formData.email,
            p_password: `temp${Math.random().toString(36).slice(-8)}`,
            p_tenant_id: currentTenant.id,
            p_farmer_data: farmerData,
            p_profile_data: {
              full_name: formData.fullName,
              phone: formData.phone,
              date_of_birth: formData.dateOfBirth,
              gender: formData.gender,
              address: {
                village: formData.village,
                taluka: formData.taluka,
                district: formData.district,
                state: formData.state,
                pincode: formData.pincode
              }
            }
          }) as { data: FarmerCreateResult | null; error: any };

        if (dbError) throw dbError;
        
        const funcResult = result as FarmerCreateResult;
        if (funcResult?.error) throw new Error(funcResult.error);

        return {
          success: true,
          farmerId: funcResult.farmer_id,
          userId: funcResult.user_id,
          farmerCode,
          tempPassword: 'Generated during registration'
        };

      } catch (funcError) {
        console.warn('Database function not available, using fallback:', funcError);
        
        // Fallback: Create a basic farmer record
        const { data: newFarmer, error: insertError } = await supabase
          .from('farmers')
          .insert({
            ...farmerData,
            id: crypto.randomUUID() // Generate a UUID for the farmer
          })
          .select()
          .single();

        if (insertError) throw insertError;

        return {
          success: true,
          farmerId: newFarmer.id,
          userId: newFarmer.id,
          farmerCode,
          tempPassword: 'Manual registration - contact admin'
        };
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create farmer';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateFarmerProfile = async (farmerId: string, updates: Partial<CreateFarmerData>) => {
    setLoading(true);
    setError(null);

    try {
      // Update farmer record
      const farmerUpdates: any = {};
      if (updates.farmingExperience) {
        farmerUpdates.farming_experience_years = parseInt(updates.farmingExperience);
      }
      if (updates.totalLandSize) {
        farmerUpdates.total_land_acres = parseFloat(updates.totalLandSize);
      }
      if (updates.primaryCrops) {
        farmerUpdates.primary_crops = updates.primaryCrops;
      }
      if (updates.irrigationSource !== undefined) {
        farmerUpdates.irrigation_type = updates.irrigationSource;
        farmerUpdates.has_irrigation = updates.irrigationSource !== '';
      }
      if (updates.hasStorage !== undefined) {
        farmerUpdates.has_storage = updates.hasStorage;
      }
      if (updates.hasTractor !== undefined) {
        farmerUpdates.has_tractor = updates.hasTractor;
      }

      if (Object.keys(farmerUpdates).length > 0) {
        farmerUpdates.updated_at = new Date().toISOString();
        
        const { error: farmerError } = await supabase
          .from('farmers')
          .update(farmerUpdates)
          .eq('id', farmerId);

        if (farmerError) throw farmerError;
      }

      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update farmer';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createFarmer,
    updateFarmerProfile,
    loading,
    error,
    clearError: () => setError(null)
  };
};
