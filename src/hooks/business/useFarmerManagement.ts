
import { useState } from 'react';
import { enhancedFarmerDataService as farmersApi, type ComprehensiveFarmerFormData } from '@/services/EnhancedFarmerDataService';
import { useAppSelector } from '@/store/hooks';

export const useFarmerManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentTenant } = useAppSelector((state) => state.tenant);

  const generateFarmerCode = async () => {
    if (!currentTenant) return null;
    
    const count = await farmersApi.getFarmerCount(currentTenant.id);
    const farmerNumber = count + 1;
    const tenantPrefix = currentTenant.slug.substring(0, 3).toUpperCase();
    return `${tenantPrefix}${farmerNumber.toString().padStart(6, '0')}`;
  };

  const checkTenantLimits = async () => {
    if (!currentTenant) throw new Error('No tenant selected');
    
    const maxFarmers = 10000;
    const currentCount = await farmersApi.getFarmerCount(currentTenant.id);
    
    if (currentCount >= maxFarmers) {
      throw new Error(`Farmer limit exceeded. Maximum allowed: ${maxFarmers}`);
    }
    return { currentFarmers: currentCount, maxFarmers };
  };

  const createFarmer = async (formData: ComprehensiveFarmerFormData) => {
    if (!currentTenant) {
      throw new Error('No tenant selected');
    }

    setLoading(true);
    setError(null);

    try {
      await checkTenantLimits();

      const farmerCode = await generateFarmerCode();
      if (!farmerCode) throw new Error('Failed to generate farmer code');

      // Hash the PIN for security
      const encoder = new TextEncoder();
      const data = encoder.encode(formData.pin || '0000');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const pinHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Format mobile number (remove country code if present)
      const formatMobileNumber = (phone: string) => {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
          return cleanPhone.substring(2);
        }
        return cleanPhone.length === 10 ? cleanPhone : phone;
      };

      // Prepare comprehensive metadata
      const metadata = {
        personal_info: {
          full_name: formData.fullName,
          email: formData.email || null,
          date_of_birth: formData.dateOfBirth || null,
          gender: formData.gender || null,
        },
        address_info: {
          village: formData.village || null,
          taluka: formData.taluka || null,
          district: formData.district || null,
          state: formData.state || null,
          pincode: formData.pincode || null,
        },
        farming_info: {
          farming_experience: formData.farmingExperience || null,
          total_land_size: formData.totalLandSize || null,
          irrigation_source: formData.irrigationSource || null,
          has_storage: formData.hasStorage || false,
          has_tractor: formData.hasTractor || false,
        },
        additional_info: {
          notes: formData.notes || null,
        }
      };

      // Map all fields according to database schema
      const farmerData = {
        tenant_id: currentTenant.id,
        farmer_code: farmerCode,
        mobile_number: formatMobileNumber(formData.phone),
        pin_hash: pinHash,
        farming_experience_years: parseInt(formData.farmingExperience) || 0,
        total_land_acres: parseFloat(formData.totalLandSize) || 0,
        primary_crops: formData.primaryCrops || [],
        farm_type: 'mixed',
        has_irrigation: !!formData.irrigationSource,
        has_storage: formData.hasStorage || false,
        has_tractor: formData.hasTractor || false,
        irrigation_type: formData.irrigationSource || null,
        is_verified: false,
        total_app_opens: 0,
        total_queries: 0,
        language_preference: formData.languagePreference || 'english',
        preferred_contact_method: 'mobile',
        notes: formData.notes || null,
        metadata: metadata,
        // Optional fields that might be added later
        aadhaar_number: null,
        shc_id: null,
        annual_income_range: null,
        has_loan: false,
        loan_amount: null,
        associated_tenants: [],
        preferred_dealer_id: null,
        verification_documents: [],
        app_install_date: null,
        last_app_open: null,
        last_login_at: null,
        login_attempts: 0,
      };

      const newFarmer = await farmersApi.createFarmer(farmerData);

      return {
        success: true,
        farmerId: (newFarmer as any).id,
        userId: (newFarmer as any).id,
        farmerCode,
        tempPassword: 'PIN set successfully'
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create farmer';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateFarmerProfile = async (farmerId: string, updates: Partial<ComprehensiveFarmerFormData>) => {
    if (!currentTenant) throw new Error('No tenant selected');

    setLoading(true);
    setError(null);

    try {
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
        await farmersApi.updateFarmer(farmerId, currentTenant.id, farmerUpdates);
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
