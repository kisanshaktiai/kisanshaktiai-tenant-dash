
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, validateApiKey, checkRateLimit, logApiRequest, createResponse, ApiRequest, ApiResponse } from "../shared/middleware.ts";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

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
      return createResponse({ status: 401, error: 'API key required' });
    }

    const { valid, tenantId } = await validateApiKey(apiKey);
    if (!valid) {
      return createResponse({ status: 401, error: 'Invalid API key' });
    }

    if (!checkRateLimit(apiKey, 1000)) {
      return createResponse({ status: 429, error: 'Rate limit exceeded' });
    }

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

    const response = await handleProductsEndpoint(apiRequest, tenantId!);
    await logApiRequest(apiRequest, response, tenantId!);

    return createResponse(response);

  } catch (error) {
    console.error('Products API Error:', error);
    return createResponse({ status: 500, error: 'Internal server error' });
  }
});
