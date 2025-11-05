

import React, { useState } from 'react';
import { CreateFarmerForm } from '../presentation/CreateFarmerForm';
import { useFarmerManagement } from '@/hooks/business/useFarmerManagement';
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
  country: 'india',
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
  const { createFarmer, isCreating, createError } = useFarmerManagement();

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
  const errors = createError ? { general: createError } : {};

  return (
    <CreateFarmerForm
      isOpen={isOpen}
      onClose={onClose}
      formData={formData}
      errors={errors}
      isSubmitting={isCreating}
      onFormChange={handleFormChange}
      onSubmit={handleSubmit}
    />
  );
};

