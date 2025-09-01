
import React, { useState } from 'react';
import { CreateFarmerForm } from '../presentation/CreateFarmerForm';
import { useEnhancedFarmerManagement } from '@/hooks/business/useEnhancedFarmerManagement';
import { useFarmerValidation, type FarmerFormData } from '@/hooks/business/useFarmerValidation';

interface CreateFarmerContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const initialFormData: FarmerFormData = {
  fullName: '',
  phone: '',
  email: '',
  dateOfBirth: '',
  gender: '',
  village: '',
  taluka: '',
  district: '',
  state: '',
  pincode: '',
  farmingExperience: '',
  totalLandSize: '',
  irrigationSource: '',
  hasStorage: false,
  hasTractor: false,
  primaryCrops: [],
  pin: '',
  confirmPin: '',
  notes: '',
};

export const CreateFarmerContainer: React.FC<CreateFarmerContainerProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FarmerFormData>(initialFormData);
  const { createComprehensiveFarmer, loading } = useEnhancedFarmerManagement();
  const { errors, validateForm, clearErrors } = useFarmerValidation();

  const handleFormChange = (field: keyof FarmerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (data: FarmerFormData) => {
    const validationErrors = validateForm(data);
    if (Object.values(validationErrors).some(error => error)) {
      console.log('Validation errors:', validationErrors);
      return;
    }

    try {
      const result = await createComprehensiveFarmer(data);
      if (result?.success) {
        setFormData(initialFormData);
        clearErrors();
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('Failed to create farmer:', error);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    clearErrors();
    onClose();
  };

  return (
    <CreateFarmerForm
      isOpen={isOpen}
      formData={formData}
      errors={errors}
      isSubmitting={loading}
      onFormChange={handleFormChange}
      onSubmit={handleSubmit}
      onClose={handleClose}
    />
  );
};
