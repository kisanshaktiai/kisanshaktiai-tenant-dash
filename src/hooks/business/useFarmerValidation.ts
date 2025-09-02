
import { useState, useCallback } from 'react';

export interface FarmerFormData {
  // Personal Information - Required
  fullName: string;
  phone: string;
  pin: string;
  confirmPin: string;
  
  // Personal Information - Optional
  email: string;
  dateOfBirth: string;
  gender: string;
  languagePreference: string;
  
  // Address Information - Optional
  village: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
  
  // Farming Information - Optional
  farmingExperience: string;
  totalLandSize: string;
  irrigationSource: string;
  hasStorage: boolean;
  hasTractor: boolean;
  primaryCrops: string[];
  
  // Additional Information - Optional
  notes: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export const useFarmerValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateIndianMobile = (mobile: string): boolean => {
    // Remove any spaces, dashes, or special characters
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    
    // Check for 10-digit number starting with 6-9 (Indian mobile format)
    // Also accept numbers with 91 country code (12 digits total)
    const patterns = [
      /^[6-9][0-9]{9}$/, // 10 digits starting with 6-9
      /^91[6-9][0-9]{9}$/, // 12 digits with 91 prefix
    ];
    
    return patterns.some(pattern => pattern.test(cleanMobile));
  };

  const formatIndianMobile = (mobile: string): string => {
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    
    // Remove country code and return only 10 digits
    if (cleanMobile.startsWith('91') && cleanMobile.length === 12) {
      return cleanMobile.substring(2);
    } else if (cleanMobile.length === 10 && /^[6-9]/.test(cleanMobile)) {
      return cleanMobile;
    }
    
    return cleanMobile;
  };

  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePincode = (pincode: string): boolean => {
    if (!pincode) return true; // Pincode is optional
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
  };

  const validatePin = (pin: string): boolean => {
    return /^\d{4,6}$/.test(pin);
  };

  const validateForm = useCallback((data: FarmerFormData): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    // REQUIRED FIELDS VALIDATION
    
    // Full name is required
    if (!data.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // Mobile number is required
    if (!data.phone?.trim()) {
      newErrors.phone = 'Mobile number is required';
    } else if (!validateIndianMobile(data.phone)) {
      newErrors.phone = 'Please enter a valid Indian mobile number (10 digits starting with 6-9)';
    }

    // PIN is required
    if (!data.pin?.trim()) {
      newErrors.pin = 'PIN is required for farmer login';
    } else if (!validatePin(data.pin)) {
      newErrors.pin = 'PIN must be 4-6 digits';
    }

    // Confirm PIN is required
    if (!data.confirmPin?.trim()) {
      newErrors.confirmPin = 'Please confirm your PIN';
    } else if (data.pin !== data.confirmPin) {
      newErrors.confirmPin = 'PINs do not match';
    }

    // OPTIONAL FIELDS VALIDATION - Only validate if fields have values

    if (data.email && !validateEmail(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (data.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear();
      if (age < 18 || age > 100) {
        newErrors.dateOfBirth = 'Age must be between 18 and 100 years';
      }
    }

    if (data.pincode && !validatePincode(data.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    if (data.farmingExperience && (isNaN(Number(data.farmingExperience)) || Number(data.farmingExperience) < 0)) {
      newErrors.farmingExperience = 'Please enter valid years of experience';
    }

    if (data.totalLandSize && (isNaN(Number(data.totalLandSize)) || Number(data.totalLandSize) <= 0)) {
      newErrors.totalLandSize = 'Please enter valid land size in acres';
    }

    setErrors(newErrors);
    return newErrors;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    validateForm,
    clearErrors,
    clearFieldError,
    formatIndianMobile,
    validateIndianMobile,
  };
};
