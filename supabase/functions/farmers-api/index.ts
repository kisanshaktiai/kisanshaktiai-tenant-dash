
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, validateApiKey, checkRateLimit, logApiRequest, createResponse, ApiRequest, ApiResponse } from "../shared/middleware.ts";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

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

    // Validate API key
    const { valid, tenantId, permissions } = await validateApiKey(apiKey);
    if (!valid) {
      return createResponse({ status: 401, error: 'Invalid API key' });
    }

    // Rate limiting
    if (!checkRateLimit(apiKey, 1000)) {
      return createResponse({ status: 429, error: 'Rate limit exceeded' });
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

    const response = await handleFarmersEndpoint(apiRequest, tenantId!);

    // Log the API request
    await logApiRequest(apiRequest, response, tenantId!);

    return createResponse(response);

  } catch (error) {
    console.error('Farmers API Error:', error);
    return createResponse({ status: 500, error: 'Internal server error' });
  }
});
