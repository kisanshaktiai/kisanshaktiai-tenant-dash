
export interface SelectionOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  color?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  isVisible?: boolean;
}

export interface LeadFormData {
  organization_name: string;
  organization_type: 'Agri_Company' | 'NGO' | 'University' | 'Government' | 'Co-Operative' | 'other';
  contact_name: string;
  email: string;
  phone: string;
  company_size?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
  expected_farmers?: number;
  budget_range?: 'under_50k' | '50k_100k' | '100k_1000k' | '1000k_plus';
  timeline?: 'immediate' | '1_month' | '3_months' | '6_months' | 'flexible';
  requirements: string;
  current_solution: string;
  how_did_you_hear: string;
}

export interface FormProgress {
  currentStep: number;
  totalSteps: number;
  completedFields: string[];
  isValid: boolean;
}
