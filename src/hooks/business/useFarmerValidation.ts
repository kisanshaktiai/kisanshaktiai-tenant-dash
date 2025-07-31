
import { useCallback } from 'react';
import { useFormValidation, validationRules, type ValidationSchema } from '@/hooks/core/useFormValidation';

export interface FarmerFormData {
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
  farmingExperience: string;
  totalLandSize: string;
  irrigationSource: string;
  hasStorage: boolean;
  hasTractor: boolean;
  primaryCrops: string[];
  notes: string;
}

const farmerValidationSchema: ValidationSchema = {
  fullName: [
    validationRules.required('Farmer name is required'),
    validationRules.minLength(2, 'Name must be at least 2 characters'),
    validationRules.maxLength(100, 'Name must be less than 100 characters'),
  ],
  phone: [
    validationRules.required('Phone number is required'),
    validationRules.phone('Please enter a valid 10-digit phone number'),
  ],
  email: [
    validationRules.email('Please enter a valid email address'),
  ],
  village: [
    validationRules.required('Village is required'),
    validationRules.minLength(2, 'Village name must be at least 2 characters'),
  ],
  district: [
    validationRules.required('District is required'),
  ],
  state: [
    validationRules.required('State is required'),
  ],
  pincode: [
    validationRules.required('Pincode is required'),
    {
      validate: (value: string) => !value || /^[0-9]{6}$/.test(value),
      message: 'Pincode must be 6 digits',
    },
  ],
  farmingExperience: [
    validationRules.required('Farming experience is required'),
    validationRules.number('Must be a valid number'),
    validationRules.min(0, 'Experience cannot be negative'),
    validationRules.max(100, 'Experience seems too high'),
  ],
  totalLandSize: [
    validationRules.required('Total land size is required'),
    validationRules.number('Must be a valid number'),
    validationRules.min(0.1, 'Land size must be at least 0.1 acres'),
    validationRules.max(10000, 'Land size seems too large'),
  ],
  primaryCrops: [
    {
      validate: (value: string[]) => value && value.length > 0,
      message: 'At least one crop must be selected',
    },
    {
      validate: (value: string[]) => !value || value.length <= 10,
      message: 'Maximum 10 crops can be selected',
    },
  ],
};

export const useFarmerValidation = () => {
  const validation = useFormValidation<FarmerFormData>(farmerValidationSchema);

  const validateBusinessRules = useCallback((data: FarmerFormData) => {
    const businessErrors: Record<string, string> = {};

    // Check if farming experience makes sense with age
    const birthYear = new Date(data.dateOfBirth).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    const experience = parseInt(data.farmingExperience);

    if (age > 0 && experience > age - 10) {
      businessErrors.farmingExperience = 'Farming experience seems too high for the age';
    }

    // Land size vs crops validation
    const landSize = parseFloat(data.totalLandSize);
    const cropCount = data.primaryCrops.length;

    if (landSize < 1 && cropCount > 3) {
      businessErrors.primaryCrops = 'Too many crops for small land size';
    }

    return businessErrors;
  }, []);

  const validateForm = useCallback((data: FarmerFormData) => {
    const validationErrors = validation.validateForm(data);
    const businessErrors = validateBusinessRules(data);

    return {
      ...validationErrors,
      ...businessErrors,
    };
  }, [validation, validateBusinessRules]);

  return {
    ...validation,
    validateForm,
    validateBusinessRules,
  };
};
