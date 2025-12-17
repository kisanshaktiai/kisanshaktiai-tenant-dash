/**
 * Input Validation Service
 * Provides Zod-based validation for API payloads and user inputs
 * Prevents injection attacks and ensures data integrity
 */

import { z } from 'zod';

// UUID validation pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Common validation schemas
export const ValidationSchemas = {
  // UUID validation
  uuid: z.string().regex(UUID_REGEX, 'Invalid UUID format'),
  
  // Optional UUID
  optionalUuid: z.string().regex(UUID_REGEX, 'Invalid UUID format').optional().nullable(),
  
  // Tenant ID (required UUID)
  tenantId: z.string().regex(UUID_REGEX, 'Invalid tenant ID format'),
  
  // Land ID (required UUID)
  landId: z.string().regex(UUID_REGEX, 'Invalid land ID format'),
  
  // Farmer ID (required UUID)
  farmerId: z.string().regex(UUID_REGEX, 'Invalid farmer ID format'),
  
  // Email validation
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  
  // Phone number (international format)
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  
  // Safe string (no special characters that could be used for injection)
  safeString: z.string()
    .min(1, 'String cannot be empty')
    .max(1000, 'String too long')
    .refine(val => !/<script|javascript:|data:/i.test(val), 'Invalid characters detected'),
  
  // Positive number
  positiveNumber: z.number().positive('Number must be positive'),
  
  // Non-negative number
  nonNegativeNumber: z.number().min(0, 'Number cannot be negative'),
  
  // Pagination limit (max 100)
  paginationLimit: z.number().int().min(1).max(100).default(50),
  
  // Pagination offset
  paginationOffset: z.number().int().min(0).default(0),
  
  // Date string (ISO format)
  isoDate: z.string().datetime({ message: 'Invalid date format' }),
  
  // URL validation
  url: z.string().url('Invalid URL format').max(2048, 'URL too long'),
  
  // Hex color
  hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
};

// API Request Schemas
export const ApiRequestSchemas = {
  // NDVI Request payload
  ndviRequest: z.object({
    tenant_id: ValidationSchemas.tenantId,
    land_ids: z.array(ValidationSchemas.landId).min(1, 'At least one land ID required').max(100, 'Too many land IDs'),
    tile_id: z.string().min(1, 'Tile ID required'),
    instant: z.boolean().optional(),
    statistics_only: z.boolean().optional(),
    priority: z.number().int().min(1).max(10).optional(),
    farmer_id: ValidationSchemas.optionalUuid,
    metadata: z.record(z.unknown()).optional(),
  }),

  // Soil analysis request
  soilAnalysisRequest: z.object({
    tenant_id: ValidationSchemas.tenantId,
    land_ids: z.array(ValidationSchemas.landId).min(1).max(100),
  }),

  // Farmer creation/update
  farmerPayload: z.object({
    tenant_id: ValidationSchemas.tenantId,
    farmer_name: z.string().min(1).max(200),
    mobile_number: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number').optional(),
    email: ValidationSchemas.email.optional(),
    village: z.string().max(100).optional(),
    district: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
  }),

  // Land creation/update
  landPayload: z.object({
    tenant_id: ValidationSchemas.tenantId,
    farmer_id: ValidationSchemas.farmerId,
    name: z.string().min(1).max(200),
    area_acres: z.number().positive().max(10000),
    survey_number: z.string().max(50).optional(),
    village: z.string().max(100).optional(),
    district: z.string().max(100).optional(),
  }),

  // Generic query params
  queryParams: z.object({
    tenant_id: ValidationSchemas.tenantId,
    limit: ValidationSchemas.paginationLimit.optional(),
    offset: ValidationSchemas.paginationOffset.optional(),
    land_id: ValidationSchemas.optionalUuid,
  }),
};

// Validation result type
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Validate input against a Zod schema
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    const errors = result.error.errors.map(err => 
      `${err.path.join('.')}: ${err.message}`
    );
    
    return { success: false, errors };
  } catch (error) {
    return { 
      success: false, 
      errors: ['Validation failed unexpectedly'] 
    };
  }
}

/**
 * Validate UUID format
 */
export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * Sanitize string input - remove potential XSS vectors
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:/gi, '')
    .trim();
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : 
        typeof item === 'object' && item !== null ? sanitizeObject(item as Record<string, unknown>) : 
        item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

/**
 * Validate and sanitize API request payload
 */
export function validateApiPayload<T>(
  schema: z.ZodSchema<T>,
  payload: unknown,
  options: { sanitize?: boolean } = { sanitize: true }
): ValidationResult<T> {
  // Sanitize if enabled
  const dataToValidate = options.sanitize && typeof payload === 'object' && payload !== null
    ? sanitizeObject(payload as Record<string, unknown>)
    : payload;
  
  return validateInput(schema, dataToValidate);
}

// Export singleton instance for convenience
export const inputValidator = {
  validate: validateInput,
  validatePayload: validateApiPayload,
  isValidUuid,
  sanitize: sanitizeString,
  sanitizeObject,
  schemas: ValidationSchemas,
  apiSchemas: ApiRequestSchemas,
};

export default inputValidator;
