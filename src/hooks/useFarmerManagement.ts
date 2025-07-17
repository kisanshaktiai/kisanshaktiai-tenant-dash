
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
    
    // Use simple count check with default limits since functions aren't available
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

      // Create a basic farmer record since the function isn't available in types
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
        is_verified: false,
        total_app_opens: 0,
        total_queries: 0
      };

      // Create farmer record directly
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
