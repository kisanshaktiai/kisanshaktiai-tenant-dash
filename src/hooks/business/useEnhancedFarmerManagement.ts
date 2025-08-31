
import { useState, useCallback } from 'react';
import { enhancedFarmerManagementService, type ComprehensiveFarmerData } from '@/services/EnhancedFarmerManagementService';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

export const useEnhancedFarmerManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentTenant } = useAppSelector((state) => state.tenant);

  const createComprehensiveFarmer = useCallback(async (farmerData: ComprehensiveFarmerData) => {
    if (!currentTenant) {
      throw new Error('No tenant selected');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Creating comprehensive farmer with data:', farmerData);
      
      const result = await enhancedFarmerManagementService.createComprehensiveFarmer(
        currentTenant.id,
        farmerData
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to create farmer');
      }

      toast.success(`Farmer created successfully! Code: ${result.farmerCode}`);
      
      return {
        success: true,
        farmer: result.farmer,
        farmerId: result.farmerId,
        farmerCode: result.farmerCode,
        mobileNumber: result.mobileNumber,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create farmer';
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentTenant]);

  const getFarmerDetails = useCallback(async (farmerId: string) => {
    if (!currentTenant) {
      throw new Error('No tenant selected');
    }

    setLoading(true);
    setError(null);

    try {
      const farmer = await enhancedFarmerManagementService.getFarmerWithAllDetails(
        farmerId,
        currentTenant.id
      );
      
      return farmer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch farmer details';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentTenant]);

  const validateFarmerLogin = useCallback(async (mobileNumber: string, pin: string) => {
    if (!currentTenant) {
      throw new Error('No tenant selected');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await enhancedFarmerManagementService.validateFarmerLogin(
        mobileNumber,
        pin,
        currentTenant.id
      );

      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentTenant]);

  return {
    loading,
    error,
    createComprehensiveFarmer,
    getFarmerDetails,
    validateFarmerLogin,
    clearError: () => setError(null),
  };
};
