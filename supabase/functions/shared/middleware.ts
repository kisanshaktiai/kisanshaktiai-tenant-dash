
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS - whitelist approach for security
const ALLOWED_ORIGINS = [
  'https://lovable.dev',
  'https://*.lovable.app',
  'https://*.supabase.co',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
];

// Check if origin is allowed
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  // In development, allow localhost
  if (origin.startsWith('http://localhost:')) return true;
  
  return ALLOWED_ORIGINS.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(origin);
    }
    return pattern === origin;
  });
}

// Get CORS headers with dynamic origin
function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const origin = isOriginAllowed(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-tenant-id',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  };
}

// Legacy export for backward compatibility
export const corsHeaders = getCorsHeaders(null);

// Helper function to handle CORS preflight with origin validation
export function handleCorsOptions(request?: Request): Response {
  const origin = request?.headers.get('origin') || null;
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

// Apply CORS headers to any response with origin validation
export function withCors(response: Response, request?: Request): Response {
  const origin = request?.headers.get('origin') || null;
  const headers = getCorsHeaders(origin);
  
  const newHeaders = new Headers(response.headers);
  Object.entries(headers).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

export interface ApiRequest {
  method: string;
  url: URL;
  headers: Headers;
  body?: any;
}

export interface ApiResponse {
  status: number;
  data?: any;
  error?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Rate limiting in-memory store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function validateApiKey(apiKey: string): Promise<{ valid: boolean; tenantId?: string; permissions?: string[] }> {
  if (!apiKey) {
    return { valid: false };
  }

  // Hash the API key for lookup
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const { data: keyData, error } = await supabase
    .from('api_keys')
    .select('tenant_id, permissions, rate_limit_per_hour, is_active, expires_at')
    .eq('api_key_hash', hashHex)
    .single();

  if (error || !keyData || !keyData.is_active) {
    return { valid: false };
  }

  // Check expiration
  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    return { valid: false };
  }

  return {
    valid: true,
    tenantId: keyData.tenant_id,
    permissions: keyData.permissions || []
  };
}

export function checkRateLimit(apiKey: string, rateLimit: number): boolean {
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;
  
  const existing = rateLimitStore.get(apiKey);
  
  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(apiKey, { count: 1, resetTime: now + hourInMs });
    return true;
  }

  if (existing.count >= rateLimit) {
    return false;
  }

  existing.count++;
  return true;
}

export async function logApiRequest(request: ApiRequest, response: ApiResponse, tenantId: string, apiKeyId?: string) {
  const startTime = Date.now();
  
  try {
    await supabase.from('api_logs').insert({
      tenant_id: tenantId,
      api_key_id: apiKeyId,
      endpoint: request.url.pathname,
      method: request.method,
      status_code: response.status,
      request_headers: Object.fromEntries(request.headers.entries()),
      request_body: request.body,
      response_body: response.data || response.error,
      response_time_ms: Date.now() - startTime,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent'),
      error_message: response.error
    });
  } catch (error) {
    console.error('Failed to log API request:', error);
  }
}

export function createResponse(response: ApiResponse) {
  return new Response(
    JSON.stringify(response.data || { error: response.error }),
    {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
