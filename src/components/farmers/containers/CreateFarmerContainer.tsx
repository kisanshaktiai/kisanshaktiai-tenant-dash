
import React, { useState } from 'react';
import { CreateFarmerForm } from '../presentation/CreateFarmerForm';
import { useFarmerManagementNew } from '@/hooks/business/useFarmerManagementNew';
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
  notes: '',
};

export const CreateFarmerContainer: React.FC<CreateFarmerContainerProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FarmerFormData>(initialFormData);
  const { createFarmer, isCreating } = useFarmerManagementNew();
  const { errors, validateForm, clearErrors } = useFarmerValidation();

  const handleFormChange = (field: keyof FarmerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (data: FarmerFormData) => {
    const validationErrors = validateForm(data);
    if (Object.values(validationErrors).some(error => error)) {
      return;
    }

    const result = await createFarmer(data);
    if (result?.success) {
      setFormData(initialFormData);
      clearErrors();
      onSuccess?.();
      onClose();
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
      isSubmitting={isCreating}
      onFormChange={handleFormChange}
      onSubmit={handleSubmit}
      onClose={handleClose}
    />
  );
};
