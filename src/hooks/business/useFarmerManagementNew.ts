
import { useCallback } from 'react';
import { useCreateFarmerMutation, useUpdateFarmerMutation } from '@/hooks/data/useFarmersQuery';
import { useFarmerValidation, type FarmerFormData } from './useFarmerValidation';
import { useErrorHandler } from '@/hooks/core/useErrorHandler';
import type { CreateFarmerData, UpdateFarmerData } from '@/services/FarmersService';

export const useFarmerManagementNew = () => {
  const { validateForm } = useFarmerValidation();
  const { handleAsyncError } = useErrorHandler();
  const createFarmerMutation = useCreateFarmerMutation();
  const updateFarmerMutation = useUpdateFarmerMutation();

  const transformFormDataToCreateData = useCallback((formData: FarmerFormData): Omit<CreateFarmerData, 'tenant_id' | 'farmer_code'> => {
    return {
      farming_experience_years: parseInt(formData.farmingExperience) || 0,
      total_land_acres: parseFloat(formData.totalLandSize) || 0,
      primary_crops: formData.primaryCrops,
      farm_type: 'mixed',
      has_irrigation: formData.irrigationSource !== '',
      has_storage: formData.hasStorage,
      has_tractor: formData.hasTractor,
      irrigation_type: formData.irrigationSource || null,
      is_verified: false,
    };
  }, []);

  const createFarmer = useCallback(async (formData: FarmerFormData) => {
    // Validate form
    const errors = validateForm(formData);
    const hasErrors = Object.values(errors).some(error => error);
    
    if (hasErrors) {
      throw new Error('Please fix form errors before submitting');
    }

    // Transform and create
    const createData = transformFormDataToCreateData(formData);
    
    return handleAsyncError(async () => {
      const result = await createFarmerMutation.mutateAsync(createData);
      return {
        success: true,
        farmerId: result.id,
        farmerCode: result.farmer_code,
      };
    }, 'Failed to create farmer');
  }, [validateForm, transformFormDataToCreateData, createFarmerMutation, handleAsyncError]);

  const updateFarmer = useCallback(async (farmerId: string, updates: Partial<FarmerFormData>) => {
    const updateData: UpdateFarmerData = {};
    
    if (updates.farmingExperience) {
      updateData.farming_experience_years = parseInt(updates.farmingExperience);
    }
    if (updates.totalLandSize) {
      updateData.total_land_acres = parseFloat(updates.totalLandSize);
    }
    if (updates.primaryCrops) {
      updateData.primary_crops = updates.primaryCrops;
    }
    if (updates.irrigationSource !== undefined) {
      updateData.irrigation_type = updates.irrigationSource;
      updateData.has_irrigation = updates.irrigationSource !== '';
    }
    if (updates.hasStorage !== undefined) {
      updateData.has_storage = updates.hasStorage;
    }
    if (updates.hasTractor !== undefined) {
      updateData.has_tractor = updates.hasTractor;
    }

    return handleAsyncError(async () => {
      const result = await updateFarmerMutation.mutateAsync({ farmerId, data: updateData });
      return {
        success: true,
        farmer: result,
      };
    }, 'Failed to update farmer');
  }, [updateFarmerMutation, handleAsyncError]);

  return {
    createFarmer,
    updateFarmer,
    isCreating: createFarmerMutation.isPending,
    isUpdating: updateFarmerMutation.isPending,
    createError: createFarmerMutation.error,
    updateError: updateFarmerMutation.error,
  };
};
