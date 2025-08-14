
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

async function getUserContext(userId: string, tenantId: string): Promise<UserContext> {
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
        await createDefaultSteps(existingWorkflow.id, 'Kisan_Basic');
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

    // Create workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('onboarding_workflows')
      .insert({
        tenant_id: tenantId,
        workflow_name: 'Tenant Onboarding',
        status: 'in_progress',
        progress_percentage: 0,
        current_step: 1,
        total_steps: 0,
        started_at: new Date().toISOString(),
        metadata: { subscription_plan: subscriptionPlan }
      })
      .select()
      .single();

    if (workflowError) {
      console.error('Error creating workflow:', workflowError);
      throw workflowError;
    }

    console.log('Created workflow:', workflow.id);

    // Create steps based on subscription plan
    await createDefaultSteps(workflow.id, subscriptionPlan);

    return workflow.id;
  } catch (error) {
    console.error('Error in ensureOnboardingWorkflow:', error);
    throw error;
  }
}

async function createDefaultSteps(workflowId: string, subscriptionPlan: string) {
  const steps = getStepsForPlan(subscriptionPlan);
  
  const stepsToInsert = steps.map((step, index) => ({
    workflow_id: workflowId,
    step_number: index + 1,
    step_name: step.name,
    step_description: step.description,
    step_status: 'pending',
    is_required: step.required,
    estimated_time_minutes: step.estimated_time,
    step_data: {}
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
    .update({ total_steps: steps.length })
    .eq('id', workflowId);

  console.log('Created', steps.length, 'steps for workflow:', workflowId);
}

function getStepsForPlan(subscriptionPlan: string) {
  switch (subscriptionPlan) {
    case 'AI_Enterprise':
      return [
        { name: 'Business Verification', description: 'Verify GST, PAN, and business documents', required: true, estimated_time: 30 },
        { name: 'Subscription Plan', description: 'Configure enterprise subscription and billing', required: true, estimated_time: 15 },
        { name: 'Branding Configuration', description: 'Set up custom branding and white-label configuration', required: true, estimated_time: 45 },
        { name: 'Feature Selection', description: 'Configure AI features and advanced analytics', required: true, estimated_time: 60 },
        { name: 'Data Import', description: 'Import existing data and integrate with external systems', required: true, estimated_time: 120 },
        { name: 'Team Invites', description: 'Create admin accounts and set up team structure', required: true, estimated_time: 30 }
      ];
    case 'Shakti_Growth':
      return [
        { name: 'Business Verification', description: 'Verify GST, PAN, and business documents', required: true, estimated_time: 30 },
        { name: 'Subscription Plan', description: 'Select and configure growth plan features', required: true, estimated_time: 15 },
        { name: 'Branding Configuration', description: 'Set up logo, colors, and basic branding', required: true, estimated_time: 30 },
        { name: 'Feature Selection', description: 'Choose growth features and set limits', required: true, estimated_time: 45 },
        { name: 'Data Import', description: 'Import farmer and product data', required: true, estimated_time: 60 },
        { name: 'Team Invites', description: 'Invite team members and assign roles', required: true, estimated_time: 20 }
      ];
    default: // Kisan_Basic
      return [
        { name: 'Business Verification', description: 'Verify GST, PAN, and business documents', required: true, estimated_time: 30 },
        { name: 'Subscription Plan', description: 'Configure basic subscription and features', required: true, estimated_time: 15 },
        { name: 'Branding Configuration', description: 'Set up basic logo and colors', required: false, estimated_time: 15 },
        { name: 'Feature Selection', description: 'Configure core features for basic plan', required: true, estimated_time: 30 },
        { name: 'Data Import', description: 'Import basic farmer data', required: false, estimated_time: 30 },
        { name: 'Team Invites', description: 'Create admin account', required: true, estimated_time: 10 }
      ];
  }
}

async function calculateProgress(workflowId: string): Promise<number> {
  const { data: steps } = await supabase
    .from('onboarding_steps')
    .select('step_status')
    .eq('workflow_id', workflowId);

  if (!steps || steps.length === 0) {
    return 0;
  }

  const completedSteps = steps.filter(step => step.step_status === 'completed').length;
  return Math.round((completedSteps / steps.length) * 100);
}

async function completeWorkflow(workflowId: string, tenantId: string): Promise<void> {
  console.log('Completing workflow:', workflowId);

  const progress = await calculateProgress(workflowId);

  await supabase
    .from('onboarding_workflows')
    .update({
      status: 'completed',
      progress_percentage: 100,
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
            progress_percentage: progress,
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

    // Parse request body with enhanced error handling
    let requestData: any;
    try {
      const bodyText = await req.text();
      console.log('Raw request body length:', bodyText?.length || 0);
      
      if (!bodyText || bodyText.trim() === '' || bodyText === 'undefined') {
        console.error('Request body is empty or undefined');
        throw new Error('Request body is required');
      }
      
      requestData = JSON.parse(bodyText);
      console.log('Parsed request data:', JSON.stringify(requestData, null, 2));
      
    } catch (parseError) {
      console.error('Request parsing error:', parseError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: parseError.message || 'Failed to parse request body' 
      }), {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      });
    }

    // Validate required fields
    if (!requestData || typeof requestData !== 'object') {
      console.error('Invalid request data format:', typeof requestData);
      throw new Error('Request data must be an object');
    }

    if (!requestData.tenant_id) {
      console.error('Missing tenant_id in request:', requestData);
      throw new Error('tenant_id is required');
    }

    if (!requestData.operation) {
      console.error('Missing operation in request:', requestData);
      throw new Error('operation is required');
    }

    console.log('Processing request:', {
      tenant_id: requestData.tenant_id,
      operation: requestData.operation,
      table: requestData.table
    });

    // Get user context
    const userContext = await getUserContext(user.id, requestData.tenant_id);
    console.log('User context:', { 
      role: userContext.role, 
      isAdmin: userContext.isAdmin, 
      isTenantUser: userContext.isTenantUser 
    });

    const result = await handleTenantDataRequest(requestData, userContext);

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
    const statusCode = errorMessage.includes('not have access') || errorMessage.includes('Unauthorized') || errorMessage.includes('Access denied') ? 403 : 
                      errorMessage.includes('Missing') || errorMessage.includes('required') || errorMessage.includes('Invalid') || errorMessage.includes('empty') ? 400 : 500;

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
