
import React, { useState } from 'react';
import { ComprehensiveCreateFarmerForm } from '../forms/ComprehensiveCreateFarmerForm';
import { useEnhancedFarmerManagement } from '@/hooks/business/useEnhancedFarmerManagement';
import { useFarmerValidation, type FarmerFormData } from '@/hooks/business/useFarmerValidation';
import { toast } from 'sonner';

interface EnhancedCreateFarmerContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: any) => void;
}

const initialFormData: FarmerFormData = {
  // Personal Information
  fullName: '',
  phone: '',
  email: '',
  dateOfBirth: '',
  gender: '',
  
  // Address Information
  village: '',
  taluka: '',
  district: '',
  state: '',
  pincode: '',
  
  // Farming Information
  farmingExperience: '',
  totalLandSize: '',
  irrigationSource: '',
  hasStorage: false,
  hasTractor: false,
  primaryCrops: [],
  
  // Authentication
  pin: '',
  confirmPin: '',
  
  // Additional Information
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
    
    // Validate form
    const validationErrors = validateForm(data);
    const hasErrors = Object.values(validationErrors).some(error => error);
    
    if (hasErrors) {
      console.log('Validation errors:', validationErrors);
      toast.error('Please fix the form errors before submitting');
      return;
    }

    try {
      // Transform form data to service format
      const farmerData = {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || undefined,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        village: data.village,
        taluka: data.taluka || undefined,
        district: data.district,
        state: data.state,
        pincode: data.pincode,
        farmingExperience: data.farmingExperience,
        totalLandSize: data.totalLandSize,
        irrigationSource: data.irrigationSource || undefined,
        hasStorage: data.hasStorage,
        hasTractor: data.hasTractor,
        primaryCrops: data.primaryCrops,
        pin: data.pin,
        notes: data.notes || undefined,
      };

      console.log('Transformed farmer data:', farmerData);
      
      const result = await createComprehensiveFarmer(farmerData);
      
      console.log('Farmer creation result:', result);
      
      if (result.success) {
        // Reset form
        setFormData(initialFormData);
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
      toast.error(error instanceof Error ? error.message : 'Failed to create farmer');
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
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
