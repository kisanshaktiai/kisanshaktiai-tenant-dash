
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
    
    const { data: settings } = await supabase
      .from('tenant_settings')
      .select('max_farmers')
      .eq('tenant_id', currentTenant.id)
      .single();
    
    const { count: currentCount } = await supabase
      .from('farmers')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', currentTenant.id)
      .eq('is_verified', true);
    
    const maxFarmers = settings?.max_farmers || 10000;
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

      // Check for duplicate phone/email
      const { data: existingFarmer } = await supabase
        .from('user_profiles')
        .select('phone, email')
        .or(`phone.eq.${formData.phone},email.eq.${formData.email}`)
        .limit(1);

      if (existingFarmer && existingFarmer.length > 0) {
        throw new Error('A farmer with this phone number or email already exists');
      }

      // Prepare data for the database function
      const profileData = {
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
      };

      const farmerData = {
        farmer_code: farmerCode,
        farming_experience_years: parseInt(formData.farmingExperience) || 0,
        total_land_acres: parseFloat(formData.totalLandSize) || 0,
        primary_crops: formData.primaryCrops,
        farm_type: 'mixed', // Default value
        has_irrigation: formData.irrigationSource !== '',
        has_storage: formData.hasStorage,
        has_tractor: formData.hasTractor,
        irrigation_type: formData.irrigationSource || null,
        default_land: formData.totalLandSize ? {
          area_acres: formData.totalLandSize,
          village: formData.village,
          district: formData.district,
          state: formData.state,
          soil_type: 'mixed',
          water_source: formData.irrigationSource || 'rainwater'
        } : null
      };

      // Generate a temporary password (in production, this should be sent via SMS/email)
      const tempPassword = `temp${Math.random().toString(36).slice(-8)}`;

      // Call the database function to create farmer
      const { data: result, error: dbError } = await supabase
        .rpc('create_farmer_profile', {
          p_email: formData.email,
          p_password: tempPassword,
          p_tenant_id: currentTenant.id,
          p_farmer_data: farmerData,
          p_profile_data: profileData
        });

      if (dbError) throw dbError;
      if (result?.error) throw new Error(result.error);

      return {
        success: true,
        farmerId: result.farmer_id,
        userId: result.user_id,
        farmerCode,
        tempPassword // In production, don't return this - send via secure channel
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
      // Update user profile
      if (updates.fullName || updates.phone || updates.dateOfBirth || updates.gender) {
        const profileUpdates: any = {};
        if (updates.fullName) profileUpdates.full_name = updates.fullName;
        if (updates.phone) profileUpdates.phone = updates.phone;
        if (updates.dateOfBirth) profileUpdates.date_of_birth = updates.dateOfBirth;
        if (updates.gender) profileUpdates.gender = updates.gender;

        const { error: profileError } = await supabase
          .from('user_profiles')
          .update(profileUpdates)
          .eq('id', farmerId);

        if (profileError) throw profileError;
      }

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
