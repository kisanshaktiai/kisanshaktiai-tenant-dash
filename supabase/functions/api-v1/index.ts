import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface ApiRequest {
  method: string;
  url: URL;
  headers: Headers;
  body?: any;
}

interface ApiResponse {
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

async function validateApiKey(apiKey: string): Promise<{ valid: boolean; tenantId?: string; permissions?: string[] }> {
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

function checkRateLimit(apiKey: string, rateLimit: number): boolean {
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

async function logApiRequest(request: ApiRequest, response: ApiResponse, tenantId: string, apiKeyId?: string) {
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

async function handleFarmersEndpoint(request: ApiRequest, tenantId: string): Promise<ApiResponse> {
  const url = request.url;
  const method = request.method;
  
  switch (method) {
    case 'GET':
      if (url.searchParams.get('id')) {
        // Get single farmer
        const farmerId = url.searchParams.get('id');
        const { data, error } = await supabase
          .from('farmers')
          .select('*')
          .eq('id', farmerId)
          .eq('tenant_id', tenantId)
          .single();
        
        if (error) return { status: 404, error: 'Farmer not found' };
        return { status: 200, data };
      } else {
        // Get all farmers with pagination
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;
        
        const { data, error } = await supabase
          .from('farmers')
          .select('*')
          .eq('tenant_id', tenantId)
          .range(offset, offset + limit - 1);
        
        if (error) return { status: 500, error: error.message };
        return { status: 200, data };
      }
    
    case 'POST':
      // Create farmer
      const { data: newFarmer, error: createError } = await supabase
        .from('farmers')
        .insert({ ...request.body, tenant_id: tenantId })
        .select()
        .single();
      
      if (createError) return { status: 400, error: createError.message };
      return { status: 201, data: newFarmer };
    
    case 'PUT':
      // Update farmer
      const farmerId = url.searchParams.get('id');
      if (!farmerId) return { status: 400, error: 'Farmer ID required' };
      
      const { data: updatedFarmer, error: updateError } = await supabase
        .from('farmers')
        .update(request.body)
        .eq('id', farmerId)
        .eq('tenant_id', tenantId)
        .select()
        .single();
      
      if (updateError) return { status: 400, error: updateError.message };
      return { status: 200, data: updatedFarmer };
    
    case 'DELETE':
      // Delete farmer
      const deleteId = url.searchParams.get('id');
      if (!deleteId) return { status: 400, error: 'Farmer ID required' };
      
      const { error: deleteError } = await supabase
        .from('farmers')
        .delete()
        .eq('id', deleteId)
        .eq('tenant_id', tenantId);
      
      if (deleteError) return { status: 400, error: deleteError.message };
      return { status: 204, data: null };
    
    default:
      return { status: 405, error: 'Method not allowed' };
  }
}

async function handleProductsEndpoint(request: ApiRequest, tenantId: string): Promise<ApiResponse> {
  const url = request.url;
  const method = request.method;
  
  switch (method) {
    case 'GET':
      if (url.searchParams.get('id')) {
        const productId = url.searchParams.get('id');
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .eq('tenant_id', tenantId)
          .single();
        
        if (error) return { status: 404, error: 'Product not found' };
        return { status: 200, data };
      } else {
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('tenant_id', tenantId)
          .range(offset, offset + limit - 1);
        
        if (error) return { status: 500, error: error.message };
        return { status: 200, data };
      }
    
    case 'POST':
      const { data: newProduct, error: createError } = await supabase
        .from('products')
        .insert({ ...request.body, tenant_id: tenantId })
        .select()
        .single();
      
      if (createError) return { status: 400, error: createError.message };
      return { status: 201, data: newProduct };
    
    case 'PUT':
      const productId = url.searchParams.get('id');
      if (!productId) return { status: 400, error: 'Product ID required' };
      
      const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update(request.body)
        .eq('id', productId)
        .eq('tenant_id', tenantId)
        .select()
        .single();
      
      if (updateError) return { status: 400, error: updateError.message };
      return { status: 200, data: updatedProduct };
    
    default:
      return { status: 405, error: 'Method not allowed' };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate API key
    const { valid, tenantId, permissions } = await validateApiKey(apiKey);
    if (!valid) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Rate limiting
    if (!checkRateLimit(apiKey, 1000)) { // Default 1000 per hour
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    let body = null;
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      try {
        body = await req.json();
      } catch {
        // Body might be empty or invalid JSON
      }
    }

    const apiRequest: ApiRequest = {
      method: req.method,
      url,
      headers: req.headers,
      body
    };

    let response: ApiResponse;

    // Route to appropriate handler
    const path = url.pathname;
    if (path.includes('/farmers')) {
      response = await handleFarmersEndpoint(apiRequest, tenantId!);
    } else if (path.includes('/products')) {
      response = await handleProductsEndpoint(apiRequest, tenantId!);
    } else {
      response = { status: 404, error: 'Endpoint not found' };
    }

    // Log the API request
    await logApiRequest(apiRequest, response, tenantId!);

    return new Response(
      JSON.stringify(response.data || { error: response.error }),
      {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});