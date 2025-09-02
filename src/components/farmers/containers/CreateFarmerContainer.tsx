

import React, { useState } from 'react';
import { CreateFarmerForm } from '../presentation/CreateFarmerForm';
import { useFarmerManagement } from '@/hooks/useFarmerManagement';
import { FarmerFormData } from '@/hooks/business/useFarmerValidation';
import { DEFAULT_LOCALE } from '@/lib/i18n';

interface CreateFarmerContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const initialFormData: FarmerFormData = {
  fullName: '',
  phone: '',
  pin: '',
  confirmPin: '',
  email: '',
  dateOfBirth: '',
  gender: '',
  languagePreference: DEFAULT_LOCALE,
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
  notes: '',
};

export const CreateFarmerContainer: React.FC<CreateFarmerContainerProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FarmerFormData>(initialFormData);
  const { createFarmer, loading, error } = useFarmerManagement();

  const handleFormChange = (field: keyof FarmerFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      const result = await createFarmer(formData);
      if (result.success) {
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error("Failed to create farmer:", error);
    }
  };

  // Convert single error string to ValidationErrors format expected by CreateFarmerForm
  const errors = error ? { general: error } : {};

  return (
    <CreateFarmerForm
      isOpen={isOpen}
      onClose={onClose}
      formData={formData}
      errors={errors}
      isSubmitting={loading}
      onFormChange={handleFormChange}
      onSubmit={handleSubmit}
    />
  );
};

