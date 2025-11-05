import { z } from 'zod';

// Organization Profile Validation
export const organizationProfileSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters'),
  slug: z.string()
    .trim()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .refine((val) => !val.startsWith('-') && !val.endsWith('-'), {
      message: 'Slug cannot start or end with a hyphen'
    }),
  type: z.enum(['agri_company', 'ngo', 'university', 'government', 'cooperative', 'other']),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
  industry: z.string()
    .max(100, 'Industry must be less than 100 characters')
    .optional()
    .nullable(),
  website: z.string()
    .url('Please enter a valid URL')
    .max(255, 'Website URL must be less than 255 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  email: z.string()
    .email('Please enter a valid email')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  phone: z.string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 
      'Please enter a valid phone number')
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  address: z.string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .nullable(),
  city: z.string()
    .max(100, 'City must be less than 100 characters')
    .optional()
    .nullable(),
  state: z.string()
    .max(100, 'State must be less than 100 characters')
    .optional()
    .nullable(),
  country: z.string()
    .max(100, 'Country must be less than 100 characters')
    .optional()
    .nullable(),
  postal_code: z.string()
    .max(20, 'Postal code must be less than 20 characters')
    .optional()
    .nullable(),
  employee_count: z.number()
    .int('Employee count must be a whole number')
    .min(1, 'Employee count must be at least 1')
    .max(1000000, 'Employee count must be less than 1,000,000')
    .optional()
    .nullable(),
  founded_year: z.number()
    .int('Founded year must be a valid year')
    .min(1800, 'Founded year must be after 1800')
    .max(new Date().getFullYear(), `Founded year cannot be in the future`)
    .optional()
    .nullable(),
});

export type OrganizationProfileFormData = z.infer<typeof organizationProfileSchema>;

// Organization Branding Validation
export const organizationBrandingSchema = z.object({
  logo_url: z.string()
    .url('Please enter a valid URL')
    .max(500, 'Logo URL must be less than 500 characters')
    .optional()
    .nullable(),
  primary_color: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color')
    .optional()
    .nullable(),
  secondary_color: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color')
    .optional()
    .nullable(),
  accent_color: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color')
    .optional()
    .nullable(),
  font_family: z.string()
    .max(100, 'Font family must be less than 100 characters')
    .optional()
    .nullable(),
  tagline: z.string()
    .max(200, 'Tagline must be less than 200 characters')
    .optional()
    .nullable(),
  theme_mode: z.enum(['light', 'dark', 'auto'])
    .optional()
    .nullable(),
});

export type OrganizationBrandingFormData = z.infer<typeof organizationBrandingSchema>;

// Slug uniqueness validation (async)
export const validateSlugUniqueness = async (
  slug: string, 
  currentSlug?: string
): Promise<boolean> => {
  if (slug === currentSlug) return true;
  
  // This would call a Supabase RPC function to check uniqueness
  // For now, returning true - implement with actual check
  return true;
};
