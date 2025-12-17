/**
 * Centralized API Configuration Service
 * Manages all external API URLs with validation and environment variable support
 */

// Environment-based API URLs with fallbacks for development
const getEnvUrl = (key: string, fallback: string): string => {
  const value = import.meta.env[key];
  return value && value.trim() !== '' ? value : fallback;
};

// API Configuration
export const API_CONFIG = {
  // NDVI Land API
  NDVI_API: {
    BASE_URL: getEnvUrl('VITE_NDVI_API_URL', 'https://ndvi-land-api.onrender.com'),
    TIMEOUT: 30000,
    RETRY_COUNT: 3,
    RETRY_DELAY: 2000,
  },
  
  // Soil Analysis API  
  SOIL_API: {
    BASE_URL: getEnvUrl('VITE_SOIL_API_URL', 'https://kisanshakti-api.onrender.com'),
    TIMEOUT: 30000,
    RETRY_COUNT: 3,
    RETRY_DELAY: 2000,
  },

  // Supabase (from env)
  SUPABASE: {
    URL: import.meta.env.VITE_SUPABASE_URL || '',
    ANON_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
    PROJECT_ID: import.meta.env.VITE_SUPABASE_PROJECT_ID || '',
  },
} as const;

// URL Validation Patterns
const URL_PATTERNS = {
  HTTPS: /^https:\/\//,
  VALID_DOMAIN: /^https:\/\/[a-zA-Z0-9][a-zA-Z0-9-_.]+[a-zA-Z0-9]\.[a-zA-Z]{2,}/,
};

/**
 * Validate URL format and security
 */
export const validateApiUrl = (url: string): { valid: boolean; error?: string } => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();

  // Must use HTTPS in production
  if (import.meta.env.PROD && !URL_PATTERNS.HTTPS.test(trimmedUrl)) {
    return { valid: false, error: 'HTTPS required in production' };
  }

  // Validate domain format
  if (!URL_PATTERNS.VALID_DOMAIN.test(trimmedUrl)) {
    return { valid: false, error: 'Invalid URL format' };
  }

  return { valid: true };
};

/**
 * Build API URL with path and query parameters
 */
export const buildApiUrl = (
  baseUrl: string,
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): string => {
  // Validate base URL
  const validation = validateApiUrl(baseUrl);
  if (!validation.valid) {
    console.error(`[API Config] Invalid base URL: ${validation.error}`);
    throw new Error(`Invalid API URL: ${validation.error}`);
  }

  // Sanitize path - remove leading slash if base URL has trailing slash
  const sanitizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
  
  let url = `${sanitizedBase}${sanitizedPath}`;

  // Add query parameters
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return url;
};

/**
 * Get NDVI API URL with path
 */
export const getNdviApiUrl = (path: string, params?: Record<string, string | number | boolean | undefined>): string => {
  return buildApiUrl(API_CONFIG.NDVI_API.BASE_URL, path, params);
};

/**
 * Get Soil API URL with path
 */
export const getSoilApiUrl = (path: string, params?: Record<string, string | number | boolean | undefined>): string => {
  return buildApiUrl(API_CONFIG.SOIL_API.BASE_URL, path, params);
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV === true;
};

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD === true;
};

// Export type for API config
export type ApiConfigType = typeof API_CONFIG;
