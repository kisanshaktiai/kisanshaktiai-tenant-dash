
import { useState } from 'react';
import { tenantService, TenantRegistrationData } from '@/services/tenantService';
import { toast } from 'sonner';

export const useTenantRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTenant = async (data: TenantRegistrationData, onSuccess?: (tenantData: any) => void) => {
    setIsSubmitting(true);
    
    try {
      const response = await tenantService.createTenant(data);
      toast.success('Organization created successfully!');
      
      if (onSuccess && response?.data) {
        onSuccess(response.data);
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createTenant,
    isSubmitting
  };
};
