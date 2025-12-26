import { z } from 'zod';

/**
 * Validation schemas for authentication forms
 * All inputs are sanitized and validated before processing
 */

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' })
    .max(255, { message: 'Email must be less than 255 characters' })
    .transform((val) => val.toLowerCase()),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(128, { message: 'Password must be less than 128 characters' }),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' })
    .max(255, { message: 'Email must be less than 255 characters' })
    .transform((val) => val.toLowerCase()),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Validate login credentials
 * Returns sanitized data or validation errors
 */
export const validateLoginCredentials = (
  email: string,
  password: string
): { success: true; data: LoginFormData } | { success: false; error: string } => {
  const result = loginSchema.safeParse({ email, password });

  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0]?.message || 'Invalid input',
    };
  }

  return { success: true, data: result.data };
};

/**
 * Validate reset password email
 * Returns sanitized data or validation errors
 */
export const validateResetEmail = (
  email: string
): { success: true; data: ResetPasswordFormData } | { success: false; error: string } => {
  const result = resetPasswordSchema.safeParse({ email });

  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0]?.message || 'Invalid email',
    };
  }

  return { success: true, data: result.data };
};
