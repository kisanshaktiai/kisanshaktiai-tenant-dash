
import { useCallback } from 'react';
import { useEnhancedFarmerManagement } from './useEnhancedFarmerManagement';
import { useFarmerValidation, type FarmerFormData } from './useFarmerValidation';
import { useErrorHandler } from '@/hooks/core/useErrorHandler';

export const useFarmerManagementNew = () => {
  const { validateForm } = useFarmerValidation();
  const { handleAsyncError } = useErrorHandler();
  const { createComprehensiveFarmer, loading } = useEnhancedFarmerManagement();

  const createFarmer = useCallback(async (formData: FarmerFormData) => {
    // Validate form
    const errors = validateForm(formData);
    const hasErrors = Object.values(errors).some(error => error);
    
    if (hasErrors) {
      console.log('Validation errors found:', errors);
      throw new Error('Please fix form errors before submitting');
    }

    // Use the enhanced farmer management service for comprehensive data handling
    return handleAsyncError(async () => {
      const result = await createComprehensiveFarmer(formData);
      return {
        success: true,
        farmerId: result.farmerId,
        farmerCode: result.farmerCode,
      };
    }, 'Failed to create farmer');
  }, [validateForm, createComprehensiveFarmer, handleAsyncError]);

  return {
    createFarmer,
    isCreating: loading,
    createError: null,
    isUpdating: false,
    updateError: null,
    updateFarmer: async () => ({ success: false }), // Placeholder for compatibility
  };
};
