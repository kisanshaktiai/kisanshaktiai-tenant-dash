import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-tenant-id',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Max-Age': '86400',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(Boolean);
    const method = req.method;
    
    // Get authorization header and tenant ID
    const authorization = req.headers.get('Authorization');
    const tenantId = req.headers.get('X-Tenant-ID');
    
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!tenantId) {
      return new Response(
        JSON.stringify({ error: 'Tenant ID required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client with user's token
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: authorization,
        },
      },
    });

    // Verify user has access to tenant
    const { data: userTenant, error: tenantError } = await supabase
      .from('user_tenants')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (tenantError || !userTenant) {
      console.error('Tenant access error:', tenantError);
      return new Response(
        JSON.stringify({ error: 'Access denied to this tenant' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Route handling
    let response: any;
    
    switch (method) {
      case 'GET':
        if (path[1]) {
          // Get single dealer by ID
          response = await getDealer(supabase, tenantId, path[1]);
        } else {
          // Get all dealers with filters
          const searchParams = url.searchParams;
          response = await getDealers(supabase, tenantId, {
            search: searchParams.get('search') || undefined,
            status: searchParams.get('status') || undefined,
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '50'),
            sortBy: searchParams.get('sortBy') || 'created_at',
            sortOrder: searchParams.get('sortOrder') || 'desc',
          });
        }
        break;

      case 'POST':
        const createData = await req.json();
        response = await createDealer(supabase, tenantId, createData);
        break;

      case 'PUT':
      case 'PATCH':
        if (!path[1]) {
          return new Response(
            JSON.stringify({ error: 'Dealer ID required for update' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        const updateData = await req.json();
        response = await updateDealer(supabase, tenantId, path[1], updateData);
        break;

      case 'DELETE':
        if (!path[1]) {
          return new Response(
            JSON.stringify({ error: 'Dealer ID required for deletion' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        response = await deleteDealer(supabase, tenantId, path[1]);
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            status: 405, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

    // Return successful response
    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Dealers API error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.toString() : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Get all dealers with filters
async function getDealers(supabase: any, tenantId: string, options: any) {
  let query = supabase
    .from('dealers')
    .select('*', { count: 'exact' })
    .eq('tenant_id', tenantId);

  // Apply search filter
  if (options.search) {
    query = query.or(`
      dealer_name.ilike.%${options.search}%,
      dealer_code.ilike.%${options.search}%,
      contact_email.ilike.%${options.search}%,
      contact_phone.ilike.%${options.search}%,
      business_name.ilike.%${options.search}%
    `);
  }

  // Apply status filter
  if (options.status) {
    query = query.eq('status', options.status);
  }

  // Apply sorting
  const order = options.sortOrder === 'asc' ? true : false;
  query = query.order(options.sortBy, { ascending: order });

  // Apply pagination
  const from = (options.page - 1) * options.limit;
  const to = from + options.limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching dealers:', error);
    throw error;
  }

  return {
    data,
    count,
    page: options.page,
    limit: options.limit,
    totalPages: Math.ceil((count || 0) / options.limit),
  };
}

// Get single dealer
async function getDealer(supabase: any, tenantId: string, dealerId: string) {
  const { data, error } = await supabase
    .from('dealers')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', dealerId)
    .single();

  if (error) {
    console.error('Error fetching dealer:', error);
    throw error;
  }

  return data;
}

// Create new dealer
async function createDealer(supabase: any, tenantId: string, dealerData: any) {
  // Get tenant info for dealer code generation
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('slug')
    .eq('id', tenantId)
    .single();

  if (tenantError) {
    console.error('Error fetching tenant:', tenantError);
    throw tenantError;
  }

  // Get current dealer count for code generation
  const { count, error: countError } = await supabase
    .from('dealers')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);

  if (countError) {
    console.error('Error counting dealers:', countError);
    throw countError;
  }

  // Generate dealer code
  const dealerNumber = (count || 0) + 1;
  const dealerCode = `${tenant.slug.toUpperCase().substring(0, 3)}-DLR-${String(dealerNumber).padStart(6, '0')}`;

  // Create dealer record
  const { data, error } = await supabase
    .from('dealers')
    .insert({
      ...dealerData,
      tenant_id: tenantId,
      dealer_code: dealerCode,
      status: dealerData.status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating dealer:', error);
    throw error;
  }

  // Log the creation
  await supabase
    .from('api_logs')
    .insert({
      tenant_id: tenantId,
      endpoint: '/dealers',
      method: 'POST',
      status_code: 201,
      request_body: { action: 'create_dealer', dealer_id: data.id },
      response_body: { success: true },
    });

  return data;
}

// Update dealer
async function updateDealer(supabase: any, tenantId: string, dealerId: string, updates: any) {
  // Remove fields that shouldn't be updated
  delete updates.id;
  delete updates.tenant_id;
  delete updates.dealer_code;
  delete updates.created_at;

  const { data, error } = await supabase
    .from('dealers')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('tenant_id', tenantId)
    .eq('id', dealerId)
    .select()
    .single();

  if (error) {
    console.error('Error updating dealer:', error);
    throw error;
  }

  // Log the update
  await supabase
    .from('api_logs')
    .insert({
      tenant_id: tenantId,
      endpoint: `/dealers/${dealerId}`,
      method: 'PUT',
      status_code: 200,
      request_body: { action: 'update_dealer', updates },
      response_body: { success: true },
    });

  return data;
}

// Delete dealer
async function deleteDealer(supabase: any, tenantId: string, dealerId: string) {
  const { error } = await supabase
    .from('dealers')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('id', dealerId);

  if (error) {
    console.error('Error deleting dealer:', error);
    throw error;
  }

  // Log the deletion
  await supabase
    .from('api_logs')
    .insert({
      tenant_id: tenantId,
      endpoint: `/dealers/${dealerId}`,
      method: 'DELETE',
      status_code: 200,
      request_body: { action: 'delete_dealer' },
      response_body: { success: true },
    });

  return { success: true, message: 'Dealer deleted successfully' };
}