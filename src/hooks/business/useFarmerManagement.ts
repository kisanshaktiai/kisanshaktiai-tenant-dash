
import { useState } from 'react';
import { farmersApi, CreateFarmerData } from '@/services/api/farmers';
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

  const createFarmer = async (formData: CreateFarmerData) => {
    if (!currentTenant) {
      throw new Error('No tenant selected');
    }

    setLoading(true);
    setError(null);

    try {
      await checkTenantLimits();

      const farmerCode = await generateFarmerCode();
      if (!farmerCode) throw new Error('Failed to generate farmer code');

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
        total_queries: 0,
        id: crypto.randomUUID()
      };

      const newFarmer = await farmersApi.createFarmer(farmerData, currentTenant.id);

      return {
        success: true,
        farmerId: (newFarmer as any).id,
        userId: (newFarmer as any).id,
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
        await farmersApi.updateFarmer(farmerId, farmerUpdates, currentTenant.id);
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
