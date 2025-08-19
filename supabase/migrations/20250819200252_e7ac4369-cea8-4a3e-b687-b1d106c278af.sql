
-- Check existing enum types and update them to match the expected values
DO $$ 
BEGIN
    -- Check if onboarding_status enum exists and update it
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'onboarding_status') THEN
        -- Add any missing values to existing enum
        ALTER TYPE public.onboarding_status ADD VALUE IF NOT EXISTS 'not_started';
        ALTER TYPE public.onboarding_status ADD VALUE IF NOT EXISTS 'in_progress';
        ALTER TYPE public.onboarding_status ADD VALUE IF NOT EXISTS 'completed';
        ALTER TYPE public.onboarding_status ADD VALUE IF NOT EXISTS 'paused';
    ELSE
        -- Create the enum if it doesn't exist
        CREATE TYPE public.onboarding_status AS ENUM ('not_started', 'in_progress', 'completed', 'paused');
    END IF;
    
    -- Check if step_status enum exists and update it
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'step_status') THEN
        ALTER TYPE public.step_status ADD VALUE IF NOT EXISTS 'pending';
        ALTER TYPE public.step_status ADD VALUE IF NOT EXISTS 'in_progress';
        ALTER TYPE public.step_status ADD VALUE IF NOT EXISTS 'completed';
        ALTER TYPE public.step_status ADD VALUE IF NOT EXISTS 'skipped';
        ALTER TYPE public.step_status ADD VALUE IF NOT EXISTS 'failed';
    ELSE
        CREATE TYPE public.step_status AS ENUM ('pending', 'in_progress', 'completed', 'skipped', 'failed');
    END IF;
END $$;

-- Create function to ensure onboarding workflow exists for a tenant
CREATE OR REPLACE FUNCTION public.ensure_onboarding_workflow(p_tenant_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_workflow_id UUID;
    v_tenant_type TEXT;
    v_subscription_plan TEXT;
    v_step_template RECORD;
    v_step_count INTEGER := 0;
BEGIN
    -- Get existing workflow
    SELECT id INTO v_workflow_id 
    FROM public.onboarding_workflows 
    WHERE tenant_id = p_tenant_id;
    
    -- If workflow exists, return it
    IF v_workflow_id IS NOT NULL THEN
        RETURN v_workflow_id;
    END IF;
    
    -- Get tenant info for template selection
    SELECT tenant_type, subscription_plan 
    INTO v_tenant_type, v_subscription_plan
    FROM public.tenants 
    WHERE id = p_tenant_id;
    
    -- Create new workflow
    INSERT INTO public.onboarding_workflows (
        tenant_id, 
        workflow_name,
        status,
        progress_percentage,
        current_step,
        metadata
    ) VALUES (
        p_tenant_id,
        'Tenant Onboarding',
        'not_started',
        0,
        1,
        jsonb_build_object('tenant_type', v_tenant_type, 'subscription_plan', v_subscription_plan)
    ) RETURNING id INTO v_workflow_id;
    
    -- Create steps from templates based on subscription plan
    FOR v_step_template IN 
        SELECT * FROM public.onboarding_step_templates 
        WHERE target_plan = v_subscription_plan OR target_plan IS NULL
        ORDER BY step_number
    LOOP
        v_step_count := v_step_count + 1;
        
        INSERT INTO public.onboarding_steps (
            workflow_id,
            step_number,
            step_name,
            step_description,
            step_status,
            is_required,
            estimated_time_minutes,
            step_data
        ) VALUES (
            v_workflow_id,
            v_step_template.step_number,
            v_step_template.step_name,
            v_step_template.step_description,
            'pending',
            v_step_template.is_required,
            v_step_template.estimated_time_minutes,
            COALESCE(v_step_template.default_data, '{}')
        );
    END LOOP;
    
    -- Update total steps count
    UPDATE public.onboarding_workflows 
    SET total_steps = v_step_count
    WHERE id = v_workflow_id;
    
    RETURN v_workflow_id;
END;
$$;

-- Create function to complete onboarding workflow
CREATE OR REPLACE FUNCTION public.complete_onboarding_workflow(p_tenant_id UUID, p_workflow_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
    v_all_completed BOOLEAN;
BEGIN
    -- Check if all required steps are completed
    SELECT NOT EXISTS(
        SELECT 1 FROM public.onboarding_steps os
        WHERE os.workflow_id = p_workflow_id
        AND os.is_required = true
        AND os.step_status != 'completed'
    ) INTO v_all_completed;
    
    IF NOT v_all_completed THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Not all required steps are completed'
        );
    END IF;
    
    -- Update workflow status
    UPDATE public.onboarding_workflows 
    SET 
        status = 'completed',
        progress_percentage = 100,
        completed_at = now(),
        updated_at = now()
    WHERE id = p_workflow_id AND tenant_id = p_tenant_id;
    
    -- Update tenant status if needed
    UPDATE public.tenants 
    SET 
        status = 'active',
        updated_at = now()
    WHERE id = p_tenant_id AND status IN ('trial', 'pending');
    
    RETURN jsonb_build_object('success', true);
END;
$$;

-- Create function to calculate workflow progress
CREATE OR REPLACE FUNCTION public.calculate_workflow_progress(p_workflow_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_steps INTEGER;
    v_completed_steps INTEGER;
    v_progress INTEGER;
BEGIN
    -- Get total and completed step counts
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN step_status = 'completed' THEN 1 END)
    INTO v_total_steps, v_completed_steps
    FROM public.onboarding_steps
    WHERE workflow_id = p_workflow_id;
    
    IF v_total_steps = 0 THEN
        RETURN 0;
    END IF;
    
    v_progress := ROUND((v_completed_steps::DECIMAL / v_total_steps::DECIMAL) * 100);
    
    -- Update workflow progress
    UPDATE public.onboarding_workflows
    SET 
        progress_percentage = v_progress,
        current_step = COALESCE((
            SELECT MIN(step_number) 
            FROM public.onboarding_steps 
            WHERE workflow_id = p_workflow_id 
            AND step_status IN ('pending', 'in_progress')
        ), v_total_steps + 1),
        updated_at = now()
    WHERE id = p_workflow_id;
    
    RETURN v_progress;
END;
$$;

-- Insert default onboarding step templates if they don't exist
INSERT INTO public.onboarding_step_templates (step_number, step_name, step_description, is_required, estimated_time_minutes, target_plan, default_data)
VALUES 
    (1, 'Business Verification', 'Verify business details and documentation', true, 30, NULL, '{"fields_required": ["business_name", "owner_name", "contact_email"]}'),
    (2, 'Subscription Plan', 'Select and configure subscription plan', true, 15, NULL, '{"plans_available": true}'),
    (3, 'Branding Configuration', 'Set up company branding and colors', true, 30, NULL, '{"branding_fields": ["app_name", "primary_color", "logo"]}'),
    (4, 'Feature Selection', 'Choose and configure platform features', true, 45, NULL, '{"feature_categories": ["farmer_management", "analytics", "communication"]}'),
    (5, 'Data Import', 'Import existing farmer and product data', false, 60, NULL, '{"import_types": ["farmers", "products", "dealers"]}'),
    (6, 'Team Invites', 'Invite team members and assign roles', false, 20, NULL, '{"invite_roles": ["admin", "manager", "viewer"]}}')
ON CONFLICT (step_number, COALESCE(target_plan, '')) DO NOTHING;
