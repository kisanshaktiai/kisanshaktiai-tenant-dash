
import React, { useState } from 'react';
import { ComprehensiveCreateFarmerForm } from '../forms/ComprehensiveCreateFarmerForm';
import { useEnhancedFarmerManagement } from '@/hooks/business/useEnhancedFarmerManagement';
import { useFarmerValidation, type FarmerFormData } from '@/hooks/business/useFarmerValidation';
import { useAppSelector } from '@/store/hooks';
import { DEFAULT_LOCALE } from '@/lib/i18n';
import { toast } from 'sonner';

interface EnhancedCreateFarmerContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: any) => void;
}

const initialFormData: FarmerFormData = {
  // Personal Information - Required
  fullName: '',
  phone: '',
  pin: '',
  confirmPin: '',
  
  // Personal Information - Optional
  email: '',
  dateOfBirth: '',
  gender: '',
  languagePreference: DEFAULT_LOCALE, // Default to English
  
  // Address Information - Optional
  village: '',
  taluka: '',
  district: '',
  state: '',
  pincode: '',
  
  // Farming Information - Optional
  farmingExperience: '',
  totalLandSize: '',
  irrigationSource: '',
  hasStorage: false,
  hasTractor: false,
  primaryCrops: [],
  
  // Additional Information - Optional
  notes: '',
};

export const EnhancedCreateFarmerContainer: React.FC<EnhancedCreateFarmerContainerProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FarmerFormData>(initialFormData);
  const { loading, createComprehensiveFarmer } = useEnhancedFarmerManagement();
  const { errors, validateForm, clearErrors, formatIndianMobile } = useFarmerValidation();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  const handleFormChange = (field: keyof FarmerFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-format mobile number
      if (field === 'phone' && typeof value === 'string') {
        updated.phone = formatIndianMobile(value);
      }
      
      return updated;
    });
  };

  const handleSubmit = async (data: FarmerFormData) => {
    console.log('Submitting farmer form with data:', data);
    
    // Validate form - this is the actual submission, so show toast on errors
    const validationErrors = validateForm(data);
    const hasErrors = Object.values(validationErrors).some(error => error);
    
    if (hasErrors) {
      console.log('Validation errors found:', validationErrors);
      
      // Show toast only on actual form submission
      const errorFields = Object.keys(validationErrors).filter(key => validationErrors[key]);
      if (errorFields.length > 0) {
        toast.error(`Please fix the following errors: ${errorFields.join(', ')}`);
      }
      return;
    }

    try {
      // Transform form data to service format - only include defined values
      const farmerData = {
        // Required fields
        fullName: data.fullName,
        phone: data.phone,
        pin: data.pin,
        
        // Optional fields - only include if they have values
        ...(data.email && { email: data.email }),
        ...(data.dateOfBirth && { dateOfBirth: data.dateOfBirth }),
        ...(data.gender && { gender: data.gender }),
        ...(data.languagePreference && { languagePreference: data.languagePreference }),
        ...(data.village && { village: data.village }),
        ...(data.taluka && { taluka: data.taluka }),
        ...(data.district && { district: data.district }),
        ...(data.state && { state: data.state }),
        ...(data.pincode && { pincode: data.pincode }),
        ...(data.farmingExperience && { farmingExperience: data.farmingExperience }),
        ...(data.totalLandSize && { totalLandSize: data.totalLandSize }),
        ...(data.irrigationSource && { irrigationSource: data.irrigationSource }),
        hasStorage: data.hasStorage || false,
        hasTractor: data.hasTractor || false,
        primaryCrops: data.primaryCrops || [],
        ...(data.notes && { notes: data.notes }),
      };

      console.log('Transformed farmer data for submission:', farmerData);
      
      const result = await createComprehensiveFarmer(farmerData);
      
      console.log('Farmer creation result:', result);
      
      if (result.success) {
        // Reset form with default language preference
        setFormData({
          ...initialFormData,
          languagePreference: DEFAULT_LOCALE
        });
        clearErrors();
        
        // Call success callback
        onSuccess?.(result);
        
        // Show success message with farmer details
        toast.success(
          `Farmer created successfully!\nCode: ${result.farmerCode}\nMobile: ${result.mobileNumber}`,
          { duration: 5000 }
        );
        
        // Close dialog
        onClose();
      }
    } catch (error) {
      console.error('Failed to create farmer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create farmer';
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    setFormData({
      ...initialFormData,
      languagePreference: DEFAULT_LOCALE
    });
    clearErrors();
    onClose();
  };

  return (
    <ComprehensiveCreateFarmerForm
      isOpen={isOpen}
      onClose={handleClose}
      formData={formData}
      errors={errors}
      isSubmitting={loading}
      onFormChange={handleFormChange}
      onSubmit={handleSubmit}
    />
  );
};
