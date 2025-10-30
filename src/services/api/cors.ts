/**
 * Centralized CORS Configuration
 * This module provides a consistent CORS configuration for all API calls
 */

export const CORS_CONFIG = {
  // Default CORS headers for all API requests
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Max-Age': '86400', // 24 hours
  },
  
  // Allowed origins for production
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://*.lovable.dev',
    'https://*.supabase.co',
  ],
  
  // Check if origin is allowed
  isOriginAllowed: (origin: string | null): boolean => {
    if (!origin) return true; // Allow requests with no origin (e.g., mobile apps)
    
    return CORS_CONFIG.allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = new RegExp(allowed.replace(/\*/g, '.*'));
        return pattern.test(origin);
      }
      return allowed === origin;
    });
  },
  
  // Get CORS headers for a specific origin
  getCorsHeaders: (origin?: string | null): HeadersInit => {
    const headers: HeadersInit = { ...CORS_CONFIG.headers };
    
    if (origin && CORS_CONFIG.isOriginAllowed(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
    }
    
    return headers;
  },
  
  // Handle preflight OPTIONS request
  handlePreflight: (request: Request): Response => {
    const origin = request.headers.get('origin');
    const headers = CORS_CONFIG.getCorsHeaders(origin);
    
    return new Response(null, {
      status: 204,
      headers,
    });
  },
  
  // Apply CORS headers to a response
  applyCorsToResponse: (response: Response, request: Request): Response => {
    const origin = request.headers.get('origin');
    const corsHeaders = CORS_CONFIG.getCorsHeaders(origin);
    
    // Clone the response and add CORS headers
    const newHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newHeaders.set(key, value as string);
    });
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};

// Export for use in API services
export const corsHeaders = CORS_CONFIG.headers;

// Export helper function for API requests
export const withCORS = async (
  request: RequestInit,
  url: string
): Promise<Response> => {
  const headers = {
    ...CORS_CONFIG.headers,
    ...request.headers,
  };
  
  return fetch(url, {
    ...request,
    headers,
  });
};