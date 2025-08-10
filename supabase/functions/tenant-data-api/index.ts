
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
  tenant_id: string; // Now required in request body
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

async function handleTenantDataRequest(request: TenantDataRequest, userId: string) {
  const { tenant_id: tenantId } = request;
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
      if (['onboarding_workflows', 'tenant_branding', 'tenant_features', 'tenant_subscriptions'].includes(table)) {
        query = query.eq('tenant_id', tenantId);
      }
      
      // Special handling for onboarding_steps - filter by workflow's tenant_id
      if (table === 'onboarding_steps') {
        // Get workflows for this tenant first to filter steps
        const { data: workflows } = await supabase
          .from('onboarding_workflows')
          .select('id')
          .eq('tenant_id', tenantId);
        
        if (workflows && workflows.length > 0) {
          const workflowIds = workflows.map(w => w.id);
          query = query.in('workflow_id', workflowIds);
        } else {
          // No workflows for this tenant, return empty
          return [];
        }
      }

      // For tenants table, only return the specific tenant
      if (table === 'tenants') {
        query = query.eq('id', tenantId);
      }

      // For subscription_plans, return active plans only (no tenant filtering needed)
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
      if (['onboarding_workflows', 'tenant_branding', 'tenant_features', 'tenant_subscriptions'].includes(table)) {
        query = query.eq('tenant_id', tenantId);
      }
      
      // Special handling for onboarding_steps - validate via workflow
      if (table === 'onboarding_steps') {
        // First get the step to find its workflow
        const { data: step } = await supabase
          .from('onboarding_steps')
          .select('workflow_id')
          .eq('id', id)
          .single();
        
        if (!step) {
          throw new Error('Onboarding step not found');
        }
        
        // Validate workflow belongs to tenant
        const { data: workflow } = await supabase
          .from('onboarding_workflows')
          .select('tenant_id')
          .eq('id', step.workflow_id)
          .single();
        
        if (!workflow || workflow.tenant_id !== tenantId) {
          throw new Error('Unauthorized access to onboarding step');
        }
      }
      
      // For tenants table, ensure we're only updating the correct tenant
      if (table === 'tenants') {
        query = query.eq('id', tenantId);
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
      
      // Special handling for onboarding_steps
      if (table === 'onboarding_steps') {
        // Similar validation as update
        const { data: step } = await supabase
          .from('onboarding_steps')
          .select('workflow_id')
          .eq('id', id)
          .single();
        
        if (step) {
          const { data: workflow } = await supabase
            .from('onboarding_workflows')
            .select('tenant_id')
            .eq('id', step.workflow_id)
            .single();
          
          if (!workflow || workflow.tenant_id !== tenantId) {
            throw new Error('Unauthorized access to onboarding step');
          }
        }
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

    // Parse request body
    const requestData: TenantDataRequest = await req.json();
    
    if (!requestData.table) {
      throw new Error('table parameter is required');
    }
    
    if (!requestData.tenant_id) {
      throw new Error('tenant_id parameter is required');
    }

    const result = await handleTenantDataRequest(requestData, user.id);

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
