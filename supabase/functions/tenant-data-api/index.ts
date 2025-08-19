
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TenantDataRequest {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete' | 'ensure_workflow' | 'complete_workflow' | 'calculate_progress';
  data?: any;
  filters?: Record<string, any>;
  id?: string;
  workflow_id?: string;
  tenant_id: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Enhanced logging for debugging
    console.log('Request Content-Type:', req.headers.get('content-type'));
    
    // Get raw body text first
    const rawBody = await req.text();
    console.log('Raw request body length:', rawBody.length);
    
    if (!rawBody || rawBody.trim() === '') {
      console.error('Request body is empty');
      return new Response(
        JSON.stringify({ success: false, error: 'Request body is required and cannot be empty' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse JSON from raw body
    let requestData: TenantDataRequest;
    try {
      requestData = JSON.parse(rawBody);
      console.log('Parsed request data:', { 
        operation: requestData.operation, 
        table: requestData.table, 
        tenant_id: requestData.tenant_id 
      });
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate required fields
    if (!requestData.operation) {
      return new Response(
        JSON.stringify({ success: false, error: 'Operation is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!requestData.tenant_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Tenant ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.log('User authenticated:', user?.id);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('User authenticated:', user.id);

    // Handle different operations
    const { operation, table, data, filters, id, workflow_id, tenant_id } = requestData;

    switch (operation) {
      case 'ensure_workflow': {
        console.log('Ensuring onboarding workflow for tenant:', tenant_id);
        
        // Check if workflow already exists
        const { data: existingWorkflow, error: checkError } = await supabase
          .from('onboarding_workflows')
          .select('id')
          .eq('tenant_id', tenant_id)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking existing workflow:', checkError);
          return new Response(
            JSON.stringify({ success: false, error: checkError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        if (existingWorkflow) {
          console.log('Workflow already exists:', existingWorkflow.id);
          return new Response(
            JSON.stringify({ 
              success: true, 
              data: { workflow_id: existingWorkflow.id },
              message: 'Workflow already exists' 
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // Create new workflow
        const { data: newWorkflow, error: createError } = await supabase
          .from('onboarding_workflows')
          .insert({
            tenant_id,
            workflow_name: 'Tenant Onboarding',
            status: 'not_started',
            progress_percentage: 0,
            current_step: 1,
            total_steps: 6,
            metadata: {}
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating workflow:', createError);
          return new Response(
            JSON.stringify({ success: false, error: createError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // Create default onboarding steps
        const defaultSteps = [
          { step_number: 1, step_name: 'Business Verification', step_description: 'Verify business details and documentation', is_required: true, estimated_time_minutes: 30 },
          { step_number: 2, step_name: 'Subscription Plan', step_description: 'Select and configure subscription plan', is_required: true, estimated_time_minutes: 15 },
          { step_number: 3, step_name: 'Branding Configuration', step_description: 'Set up company branding and customization', is_required: true, estimated_time_minutes: 20 },
          { step_number: 4, step_name: 'Feature Selection', step_description: 'Choose and configure platform features', is_required: true, estimated_time_minutes: 25 },
          { step_number: 5, step_name: 'Data Import', step_description: 'Import existing data or skip for later', is_required: false, estimated_time_minutes: 45 },
          { step_number: 6, step_name: 'Team Invites', step_description: 'Invite team members and assign roles', is_required: false, estimated_time_minutes: 15 }
        ];

        const stepsToInsert = defaultSteps.map(step => ({
          ...step,
          workflow_id: newWorkflow.id,
          step_status: 'pending',
          step_data: {}
        }));

        const { error: stepsError } = await supabase
          .from('onboarding_steps')
          .insert(stepsToInsert);

        if (stepsError) {
          console.error('Error creating steps:', stepsError);
          // Don't fail the whole operation, workflow is created
        }

        console.log('Created new workflow:', newWorkflow.id);
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: { workflow_id: newWorkflow.id },
            message: 'Workflow created successfully' 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'complete_workflow': {
        if (!workflow_id) {
          return new Response(
            JSON.stringify({ success: false, error: 'Workflow ID is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const { data: updatedWorkflow, error: updateError } = await supabase
          .from('onboarding_workflows')
          .update({
            status: 'completed',
            progress_percentage: 100,
            completed_at: new Date().toISOString()
          })
          .eq('id', workflow_id)
          .eq('tenant_id', tenant_id)
          .select()
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ success: false, error: updateError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data: updatedWorkflow }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'calculate_progress': {
        if (!workflow_id) {
          return new Response(
            JSON.stringify({ success: false, error: 'Workflow ID is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const { data: steps, error: stepsError } = await supabase
          .from('onboarding_steps')
          .select('step_status')
          .eq('workflow_id', workflow_id);

        if (stepsError) {
          return new Response(
            JSON.stringify({ success: false, error: stepsError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const totalSteps = steps.length;
        const completedSteps = steps.filter(step => step.step_status === 'completed').length;
        const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

        return new Response(
          JSON.stringify({ success: true, data: { progress } }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'select': {
        if (!table) {
          return new Response(
            JSON.stringify({ success: false, error: 'Table is required for select operation' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        let query = supabase.from(table).select('*');
        
        // Apply tenant isolation
        query = query.eq('tenant_id', tenant_id);
        
        // Apply additional filters if provided
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (key !== 'tenant_id') { // Don't override tenant isolation
              query = query.eq(key, value);
            }
          });
        }

        const { data: result, error: selectError } = await query;

        if (selectError) {
          return new Response(
            JSON.stringify({ success: false, error: selectError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data: result }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'insert': {
        if (!table || !data) {
          return new Response(
            JSON.stringify({ success: false, error: 'Table and data are required for insert operation' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // Ensure tenant isolation
        const dataWithTenant = { ...data, tenant_id };

        const { data: result, error: insertError } = await supabase
          .from(table)
          .insert(dataWithTenant)
          .select()
          .single();

        if (insertError) {
          return new Response(
            JSON.stringify({ success: false, error: insertError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data: result }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'update': {
        if (!table || !id || !data) {
          return new Response(
            JSON.stringify({ success: false, error: 'Table, ID, and data are required for update operation' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const { data: result, error: updateError } = await supabase
          .from(table)
          .update(data)
          .eq('id', id)
          .eq('tenant_id', tenant_id)
          .select()
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ success: false, error: updateError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data: result }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'delete': {
        if (!table || !id) {
          return new Response(
            JSON.stringify({ success: false, error: 'Table and ID are required for delete operation' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const { data: result, error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', id)
          .eq('tenant_id', tenant_id)
          .select()
          .single();

        if (deleteError) {
          return new Response(
            JSON.stringify({ success: false, error: deleteError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data: result }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      default: {
        return new Response(
          JSON.stringify({ success: false, error: `Unsupported operation: ${operation}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

  } catch (error) {
    console.error('Request body parsing error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
