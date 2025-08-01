
import { useMemo } from 'react';
import { LeadFormData, FormProgress } from '../types/LeadFormTypes';

const REQUIRED_FIELDS = [
  'organization_name',
  'organization_type', 
  'contact_name',
  'email'
];

const OPTIONAL_FIELDS = [
  'phone',
  'company_size',
  'expected_farmers',
  'budget_range', 
  'timeline',
  'requirements',
  'current_solution',
  'how_did_you_hear'
];

export const useFormProgress = (formData: LeadFormData): FormProgress => {
  return useMemo(() => {
    const allFields = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];
    const completedFields = allFields.filter(field => {
      const value = formData[field as keyof LeadFormData];
      return value !== undefined && value !== null && value !== '';
    });

    const requiredFieldsCompleted = REQUIRED_FIELDS.every(field => {
      const value = formData[field as keyof LeadFormData];
      return value !== undefined && value !== null && value !== '';
    });

    return {
      currentStep: Math.min(Math.floor((completedFields.length / allFields.length) * 3) + 1, 3),
      totalSteps: allFields.length,
      completedFields: completedFields,
      isValid: requiredFieldsCompleted
    };
  }, [formData]);
};
