
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface TenantDataRequest {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete';
  data?: any;
  filters?: Record<string, any>;
  id?: string;
}

async function validateUserAccess(userId: string, tenantId: string) {
  const { data: userTenant, error } = await supabase
    .from('user_tenants')
    .select('role, is_active')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .single();

  if (error || !userTenant) {
    throw new Error('User does not have access to this tenant');
  }

  return userTenant;
}

async function handleTenantDataRequest(request: TenantDataRequest, userId: string, tenantId: string) {
  console.log('Processing tenant data request:', { table: request.table, operation: request.operation, tenantId });

  // Validate user has access to tenant
  const userAccess = await validateUserAccess(userId, tenantId);
  console.log('User access validated:', userAccess);

  const { table, operation, data, filters, id } = request;

  // Define allowed tables for tenant data access
  const allowedTables = [
    'onboarding_workflows',
    'onboarding_steps',
    'subscription_plans',
    'tenant_branding',
    'tenant_features',
    'tenant_subscriptions',
    'tenants'
  ];

  if (!allowedTables.includes(table)) {
    throw new Error(`Access to table '${table}' is not allowed`);
  }

  let query = supabase.from(table);

  switch (operation) {
    case 'select':
      query = query.select('*');
      
      // Add tenant filtering for tenant-specific tables
      if (['onboarding_workflows', 'onboarding_steps', 'tenant_branding', 'tenant_features', 'tenant_subscriptions'].includes(table)) {
        if (table === 'onboarding_steps') {
          // For onboarding_steps, we need to join with workflows first
          query = query.select(`
            *,
            workflow:onboarding_workflows!inner(tenant_id)
          `);
        } else {
          query = query.eq('tenant_id', tenantId);
        }
      }

      // For tenants table, only return the specific tenant
      if (table === 'tenants') {
        query = query.eq('id', tenantId);
      }

      // For subscription_plans, return active plans only
      if (table === 'subscription_plans') {
        query = query.eq('is_active', true);
      }

      // Apply additional filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply ordering for consistency
      query = query.order('created_at', { ascending: false });
      
      break;

    case 'insert':
      if (!data) throw new Error('Data is required for insert operation');
      
      // Ensure tenant_id is set for tenant-specific tables
      if (['onboarding_workflows', 'tenant_branding', 'tenant_features', 'tenant_subscriptions'].includes(table)) {
        data.tenant_id = tenantId;
      }
      
      query = query.insert(data).select();
      break;

    case 'update':
      if (!data) throw new Error('Data is required for update operation');
      if (!id) throw new Error('ID is required for update operation');
      
      query = query.update(data).eq('id', id);
      
      // Add tenant filtering for security
      if (['onboarding_workflows', 'onboarding_steps', 'tenant_branding', 'tenant_features', 'tenant_subscriptions'].includes(table)) {
        if (table === 'onboarding_steps') {
          // For onboarding_steps, validate via workflow
          const { data: workflow } = await supabase
            .from('onboarding_workflows')
            .select('tenant_id')
            .eq('id', data.workflow_id || filters?.workflow_id)
            .single();
          
          if (!workflow || workflow.tenant_id !== tenantId) {
            throw new Error('Unauthorized access to onboarding step');
          }
        } else {
          query = query.eq('tenant_id', tenantId);
        }
      }
      
      query = query.select();
      break;

    case 'delete':
      if (!id) throw new Error('ID is required for delete operation');
      
      query = query.delete().eq('id', id);
      
      // Add tenant filtering for security
      if (['onboarding_workflows', 'tenant_branding', 'tenant_features', 'tenant_subscriptions'].includes(table)) {
        query = query.eq('tenant_id', tenantId);
      }
      
      break;

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }

  const { data: result, error } = await query;

  if (error) {
    console.error('Database operation error:', error);
    throw error;
  }

  console.log('Operation completed successfully:', { table, operation, resultCount: Array.isArray(result) ? result.length : result ? 1 : 0 });
  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from JWT
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Invalid or expired token');
    }

    console.log('User authenticated:', user.id);

    // Get tenant ID from request
    const url = new URL(req.url);
    const tenantId = url.searchParams.get('tenant_id');
    
    if (!tenantId) {
      throw new Error('tenant_id parameter is required');
    }

    console.log('Processing request for tenant:', tenantId);

    // Parse request body for POST/PUT requests
    let requestData: TenantDataRequest;
    
    if (req.method === 'GET') {
      requestData = {
        table: url.searchParams.get('table') || '',
        operation: 'select',
        filters: {}
      };

      // Parse filters from query parameters
      url.searchParams.forEach((value, key) => {
        if (key !== 'table' && key !== 'tenant_id') {
          requestData.filters![key] = value;
        }
      });
    } else {
      requestData = await req.json();
    }

    if (!requestData.table) {
      throw new Error('table parameter is required');
    }

    const result = await handleTenantDataRequest(requestData, user.id, tenantId);

    return new Response(JSON.stringify({ 
      success: true, 
      data: result 
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });

  } catch (error) {
    console.error('Tenant data API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const statusCode = errorMessage.includes('not have access') || errorMessage.includes('Unauthorized') ? 403 : 
                      errorMessage.includes('Missing') || errorMessage.includes('required') ? 400 : 500;

    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: statusCode,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });
  }
});
