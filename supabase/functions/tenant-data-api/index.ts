
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
  operation: 'select' | 'insert' | 'update' | 'delete' | 'ensure_workflow' | 'complete_workflow' | 'calculate_progress';
  data?: any;
  filters?: Record<string, any>;
  id?: string;
  tenant_id: string;
  workflow_id?: string;
}

interface UserContext {
  userId: string;
  role: string;
  isAdmin: boolean;
  isTenantUser: boolean;
  tenantId?: string;
}

// Enhanced user context validation
async function getUserContext(userId: string, tenantId: string): Promise<UserContext> {
  try {
    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role, is_active')
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (adminUser) {
      return {
        userId,
        role: adminUser.role,
        isAdmin: true,
        isTenantUser: false
      };
    }

    // Check if user has tenant access
    const { data: userTenant } = await supabase
      .from('user_tenants')
      .select('role, is_active, tenant_id')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .single();

    if (userTenant) {
      return {
        userId,
        role: userTenant.role,
        isAdmin: false,
        isTenantUser: true,
        tenantId: userTenant.tenant_id
      };
    }

    throw new Error('User does not have access to this tenant');
  } catch (error) {
    console.error('Error getting user context:', error);
    throw new Error(`Access denied: ${error.message}`);
  }
}

function canAccessTable(userContext: UserContext, table: string, operation: string): boolean {
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
    return false;
  }

  if (userContext.isAdmin) {
    return true;
  }

  if (userContext.isTenantUser) {
    const adminOperations = ['insert', 'update', 'delete'];
    const isAdminRole = ['tenant_owner', 'tenant_admin'].includes(userContext.role);
    
    if (adminOperations.includes(operation) && !isAdminRole) {
      return false;
    }
    
    return true;
  }

  return false;
}

// Simplified workflow creation that works with current schema
async function ensureOnboardingWorkflow(tenantId: string): Promise<string> {
  console.log('Ensuring onboarding workflow for tenant:', tenantId);

  try {
    // Check if workflow already exists
    const { data: existingWorkflow } = await supabase
      .from('onboarding_workflows')
      .select('id')
      .eq('tenant_id', tenantId)
      .single();

    if (existingWorkflow) {
      console.log('Workflow already exists:', existingWorkflow.id);
      
      // Ensure all steps exist for this workflow
      const { data: existingSteps } = await supabase
        .from('onboarding_steps')
        .select('id, step_name')
        .eq('workflow_id', existingWorkflow.id);
      
      console.log('Existing steps count:', existingSteps?.length || 0);
      
      // If no steps exist, create them
      if (!existingSteps || existingSteps.length === 0) {
        await createBasicSteps(existingWorkflow.id);
      }
      
      return existingWorkflow.id;
    }

    // Get tenant details for plan-based template
    const { data: tenant } = await supabase
      .from('tenants')
      .select('subscription_plan, type')
      .eq('id', tenantId)
      .single();

    const subscriptionPlan = tenant?.subscription_plan || 'Kisan_Basic';
    console.log('Creating workflow for subscription plan:', subscriptionPlan);

    // Create new workflow with only required fields
    const { data: workflow, error: workflowError } = await supabase
      .from('onboarding_workflows')
      .insert({
        tenant_id: tenantId,
        status: 'in_progress',
        current_step: 1,
        total_steps: 0,
        started_at: new Date().toISOString(),
        metadata: { 
          subscription_plan: subscriptionPlan, 
          created_by: 'system',
          workflow_version: '2.0'
        }
      })
      .select()
      .single();

    if (workflowError) {
      console.error('Error creating workflow:', workflowError);
      throw workflowError;
    }

    console.log('Created workflow:', workflow.id);

    // Create basic steps based on subscription plan
    await createBasicSteps(workflow.id);

    return workflow.id;
  } catch (error) {
    console.error('Error in ensureOnboardingWorkflow:', error);
    throw error;
  }
}

// Create basic steps that work with current schema
async function createBasicSteps(workflowId: string) {
  const steps = [
    { 
      name: 'Business Verification', 
      description: 'Verify GST, PAN, and business documents', 
      required: true, 
      estimated_time: 25
    },
    { 
      name: 'Subscription Configuration', 
      description: 'Configure subscription plan and billing preferences', 
      required: true, 
      estimated_time: 10
    },
    { 
      name: 'Branding Setup', 
      description: 'Customize app branding and white-label configuration', 
      required: false, 
      estimated_time: 20
    },
    { 
      name: 'Feature Configuration', 
      description: 'Select and configure platform features', 
      required: true, 
      estimated_time: 30
    },
    { 
      name: 'Team Setup', 
      description: 'Create team structure and send invitations', 
      required: true, 
      estimated_time: 15
    }
  ];
  
  // Create steps with only required fields that exist in schema
  const stepsToInsert = steps.map((step, index) => ({
    workflow_id: workflowId,
    step_number: index + 1,
    step_name: step.name,
    step_status: 'pending',
    step_data: {
      description: step.description,
      required: step.required,
      estimated_time: step.estimated_time
    }
  }));

  const { error: stepsError } = await supabase
    .from('onboarding_steps')
    .insert(stepsToInsert);

  if (stepsError) {
    console.error('Error creating steps:', stepsError);
    throw stepsError;
  }

  // Update total_steps
  await supabase
    .from('onboarding_workflows')
    .update({ 
      total_steps: steps.length,
      metadata: {
        step_template_version: '2.0',
        plan_based: 'basic'
      }
    })
    .eq('id', workflowId);

  console.log('Created', steps.length, 'basic steps for workflow:', workflowId);
}

async function calculateProgress(workflowId: string): Promise<number> {
  const { data: steps } = await supabase
    .from('onboarding_steps')
    .select('step_status')
    .eq('workflow_id', workflowId);

  if (!steps || steps.length === 0) {
    return 0;
  }

  const completedCount = steps.filter(step => step.step_status === 'completed').length;
  return Math.round((completedCount / steps.length) * 100);
}

async function completeWorkflow(workflowId: string, tenantId: string): Promise<void> {
  console.log('Completing workflow:', workflowId);

  await supabase
    .from('onboarding_workflows')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', workflowId)
    .eq('tenant_id', tenantId);

  console.log('Workflow completed successfully');
}

async function handleTenantDataRequest(request: TenantDataRequest, userContext: UserContext) {
  const { tenant_id: tenantId } = request;
  console.log('Processing tenant data request:', { 
    table: request.table, 
    operation: request.operation, 
    tenantId,
    userRole: userContext.role,
    isAdmin: userContext.isAdmin
  });

  // Handle special operations
  if (request.operation === 'ensure_workflow') {
    const workflowId = await ensureOnboardingWorkflow(tenantId);
    return { workflow_id: workflowId };
  }

  if (request.operation === 'complete_workflow') {
    if (!request.workflow_id) {
      throw new Error('workflow_id is required for complete_workflow operation');
    }
    await completeWorkflow(request.workflow_id, tenantId);
    return { success: true };
  }

  if (request.operation === 'calculate_progress') {
    if (!request.workflow_id) {
      throw new Error('workflow_id is required for calculate_progress operation');
    }
    const progress = await calculateProgress(request.workflow_id);
    return { progress };
  }

  // Check authorization
  if (!canAccessTable(userContext, request.table, request.operation)) {
    throw new Error(`Access denied to table '${request.table}' for operation '${request.operation}'`);
  }

  const { table, operation, data, filters, id } = request;

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
        const { data: workflows } = await supabase
          .from('onboarding_workflows')
          .select('id')
          .eq('tenant_id', tenantId);
        
        if (workflows && workflows.length > 0) {
          const workflowIds = workflows.map(w => w.id);
          query = query.in('workflow_id', workflowIds);
        } else {
          return [];
        }
      }

      // For tenants table, only return the specific tenant
      if (table === 'tenants') {
        if (userContext.isAdmin) {
          if (tenantId !== 'all') {
            query = query.eq('id', tenantId);
          }
        } else {
          query = query.eq('id', tenantId);
        }
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
        const { data: step } = await supabase
          .from('onboarding_steps')
          .select('workflow_id')
          .eq('id', id)
          .single();
        
        if (!step) {
          throw new Error('Onboarding step not found');
        }
        
        const { data: workflow } = await supabase
          .from('onboarding_workflows')
          .select('tenant_id')
          .eq('id', step.workflow_id)
          .single();
        
        if (!workflow || workflow.tenant_id !== tenantId) {
          throw new Error('Unauthorized access to onboarding step');
        }

        // Update workflow progress after step update
        const progress = await calculateProgress(step.workflow_id);
        await supabase
          .from('onboarding_workflows')
          .update({
            updated_at: new Date().toISOString()
          })
          .eq('id', step.workflow_id);
      }
      
      // For tenants table, ensure we're only updating the correct tenant
      if (table === 'tenants') {
        if (!userContext.isAdmin) {
          query = query.eq('id', tenantId);
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
      
      if (table === 'onboarding_steps') {
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

  console.log('Operation completed successfully:', { 
    table, 
    operation, 
    resultCount: Array.isArray(result) ? result.length : result ? 1 : 0 
  });
  
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
      console.error('Missing authorization header');
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      throw new Error('Invalid or expired token');
    }

    console.log('User authenticated:', user.id);

    // Enhanced request body parsing with better error handling
    let requestData: any;
    try {
      const contentType = req.headers.get('content-type') || '';
      console.log('Request Content-Type:', contentType);
      
      const bodyText = await req.text();
      console.log('Raw request body length:', bodyText?.length || 0);
      
      if (!bodyText || bodyText.trim() === '') {
        console.error('Request body is empty');
        throw new Error('Request body is required and cannot be empty');
      }
      
      if (bodyText === 'undefined' || bodyText === 'null') {
        console.error('Request body is literal undefined/null');
        throw new Error('Invalid request body: received literal undefined/null');
      }
      
      try {
        requestData = JSON.parse(bodyText);
        console.log('Successfully parsed JSON request data');
      } catch (jsonError) {
        console.error('JSON parsing failed:', jsonError);
        console.error('Failed body content:', bodyText);
        throw new Error(`Invalid JSON format: ${jsonError.message}`);
      }
      
    } catch (parseError) {
      console.error('Request body parsing error:', parseError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Failed to parse request: ${parseError.message}`,
        details: 'Ensure request body is valid JSON with required fields',
        timestamp: new Date().toISOString()
      }), {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      });
    }

    // Enhanced validation with detailed error messages
    if (!requestData || typeof requestData !== 'object') {
      console.error('Invalid request data format:', typeof requestData);
      throw new Error('Request data must be a valid JSON object');
    }

    if (!requestData.tenant_id) {
      console.error('Missing tenant_id in request:', Object.keys(requestData));
      throw new Error('tenant_id is required in request body');
    }

    if (!requestData.operation) {
      console.error('Missing operation in request:', Object.keys(requestData));
      throw new Error('operation is required in request body');
    }

    const validOperations = ['select', 'insert', 'update', 'delete', 'ensure_workflow', 'complete_workflow', 'calculate_progress'];
    if (!validOperations.includes(requestData.operation)) {
      throw new Error(`Invalid operation: ${requestData.operation}. Valid operations: ${validOperations.join(', ')}`);
    }

    console.log('Processing validated request:', {
      tenant_id: requestData.tenant_id,
      operation: requestData.operation,
      table: requestData.table,
      hasValidStructure: true
    });

    // Get user context with enhanced error handling
    const userContext = await getUserContext(user.id, requestData.tenant_id);
    console.log('User context established:', { 
      role: userContext.role, 
      isAdmin: userContext.isAdmin, 
      isTenantUser: userContext.isTenantUser 
    });

    const result = await handleTenantDataRequest(requestData, userContext);

    return new Response(JSON.stringify({ 
      success: true, 
      data: result,
      timestamp: new Date().toISOString(),
      processed_by: 'tenant-data-api-v2'
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });

  } catch (error) {
    console.error('Tenant data API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const statusCode = errorMessage.includes('not have access') || errorMessage.includes('Unauthorized') || errorMessage.includes('Access denied') ? 403 : 
                      errorMessage.includes('Missing') || errorMessage.includes('required') || errorMessage.includes('empty') || errorMessage.includes('Invalid') ? 400 : 
                      errorMessage.includes('not found') ? 404 : 500;

    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      timestamp: new Date().toISOString(),
      request_id: crypto.randomUUID(),
      support_info: 'Contact support with the request_id for assistance'
    }), {
      status: statusCode,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });
  }
});
