
import { useState, useCallback } from 'react';

export interface ValidationRule<T = any> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule[];
}

export interface ValidationErrors {
  [key: string]: string | undefined;
}

export const useFormValidation = <T extends Record<string, any>>(
  schema: ValidationSchema
) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  const validateField = useCallback((name: string, value: any): string | undefined => {
    const rules = schema[name] || [];
    
    for (const rule of rules) {
      if (!rule.validate(value)) {
        return rule.message;
      }
    }
    
    return undefined;
  }, [schema]);

  const validateForm = useCallback((data: T): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    let hasErrors = false;

    Object.keys(schema).forEach(field => {
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setIsValid(!hasErrors);
    
    return newErrors;
  }, [schema, validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(true);
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: undefined,
    }));
  }, []);

  return {
    errors,
    isValid,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
  };
};

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value) => value != null && value !== '' && value !== undefined,
    message,
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value: string) => !value || value.length >= min,
    message: message || `Must be at least ${min} characters`,
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value: string) => !value || value.length <= max,
    message: message || `Must be no more than ${max} characters`,
  }),
  
  email: (message = 'Invalid email address'): ValidationRule => ({
    validate: (value: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),
  
  phone: (message = 'Invalid phone number'): ValidationRule => ({
    validate: (value: string) => !value || /^[0-9]{10}$/.test(value.replace(/\D/g, '')),
    message,
  }),
  
  number: (message = 'Must be a valid number'): ValidationRule => ({
    validate: (value: any) => value === '' || value === null || !isNaN(Number(value)),
    message,
  }),
  
  min: (min: number, message?: string): ValidationRule => ({
    validate: (value: any) => value === '' || value === null || Number(value) >= min,
    message: message || `Must be at least ${min}`,
  }),
  
  max: (max: number, message?: string): ValidationRule => ({
    validate: (value: any) => value === '' || value === null || Number(value) <= max,
    message: message || `Must be no more than ${max}`,
  }),
};
