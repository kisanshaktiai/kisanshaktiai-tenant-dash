
import { BaseApiService } from './core/BaseApiService';
import { supabase } from '@/integrations/supabase/client';

export interface OnboardingWorkflow {
  id: string;
  tenant_id: string;
  workflow_name: string;
  workflow_type: string;
  template_data: any;
  current_step: number;
  total_steps: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface OnboardingStep {
  id: string;
  workflow_id: string;
  step_order: number;
  step_name: string;
  step_type: string;
  step_config: any;
  step_data: any;
  step_status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  step_number: number;
  step_description: string;
  is_required: boolean;
  estimated_time_minutes: number;
  started_at: string | null;
}

class EnhancedOnboardingService extends BaseApiService {
  protected basePath = '/onboarding';
  private cache = new Map<string, any>();

  async getOnboardingWorkflow(tenantId: string): Promise<OnboardingWorkflow | null> {
    try {
      const { data, error } = await supabase
        .from('onboarding_workflows')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (error) throw new Error(error.message);
      
      if (data) {
        return {
          id: data.id,
          tenant_id: data.tenant_id,
          workflow_name: 'Default Onboarding',
          workflow_type: 'standard',
          template_data: {},
          current_step: data.current_step,
          total_steps: data.total_steps,
          status: data.status as 'pending' | 'in_progress' | 'completed' | 'failed',
          metadata: typeof data.metadata === 'object' ? data.metadata as Record<string, any> : {},
          created_at: data.created_at,
          updated_at: data.updated_at
        };
      }
      
      return null;
    } catch (error) {
      throw new Error(`Failed to fetch onboarding workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createOnboardingWorkflow(tenantId: string, workflowData: Partial<OnboardingWorkflow>): Promise<OnboardingWorkflow> {
    try {
      const { data, error } = await supabase
        .from('onboarding_workflows')
        .insert({
          tenant_id: tenantId,
          current_step: workflowData.current_step || 1,
          total_steps: workflowData.total_steps || 6,
          status: workflowData.status || 'pending',
          metadata: workflowData.metadata || {}
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      return {
        id: data.id,
        tenant_id: data.tenant_id,
        workflow_name: 'Default Onboarding',
        workflow_type: 'standard',
        template_data: {},
        current_step: data.current_step,
        total_steps: data.total_steps,
        status: data.status as 'pending' | 'in_progress' | 'completed' | 'failed',
        metadata: typeof data.metadata === 'object' ? data.metadata as Record<string, any> : {},
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      throw new Error(`Failed to create onboarding workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateWorkflowStatus(workflowId: string, status: OnboardingWorkflow['status']): Promise<OnboardingWorkflow> {
    try {
      const { data, error } = await supabase
        .from('onboarding_workflows')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflowId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      return {
        id: data.id,
        tenant_id: data.tenant_id,
        workflow_name: 'Default Onboarding',
        workflow_type: 'standard',
        template_data: {},
        current_step: data.current_step,
        total_steps: data.total_steps,
        status: data.status as 'pending' | 'in_progress' | 'completed' | 'failed',
        metadata: typeof data.metadata === 'object' ? data.metadata as Record<string, any> : {},
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      throw new Error(`Failed to update workflow status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getOnboardingSteps(workflowId: string): Promise<OnboardingStep[]> {
    try {
      const { data, error } = await supabase
        .from('onboarding_steps')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('step_number');

      if (error) throw new Error(error.message);
      
      return (data || []).map(step => ({
        id: step.id,
        workflow_id: step.workflow_id,
        step_order: step.step_number,
        step_name: step.step_name,
        step_type: 'default',
        step_config: {},
        step_data: typeof step.step_data === 'object' ? step.step_data : {},
        step_status: step.step_status === 'failed' ? 'pending' : step.step_status,
        completed_at: step.completed_at,
        created_at: step.created_at,
        updated_at: step.updated_at,
        step_number: step.step_number,
        step_description: '',
        is_required: true,
        estimated_time_minutes: 10,
        started_at: null
      }));
    } catch (error) {
      throw new Error(`Failed to fetch onboarding steps: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async completeStep(stepId: string, stepData: any, tenantId?: string): Promise<OnboardingStep> {
    try {
      const { data, error } = await supabase
        .from('onboarding_steps')
        .update({
          step_status: 'completed',
          step_data: stepData,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', stepId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      return {
        id: data.id,
        workflow_id: data.workflow_id,
        step_order: data.step_number,
        step_name: data.step_name,
        step_type: 'default',
        step_config: {},
        step_data: typeof data.step_data === 'object' ? data.step_data : {},
        step_status: data.step_status === 'failed' ? 'pending' : data.step_status,
        completed_at: data.completed_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
        step_number: data.step_number,
        step_description: '',
        is_required: true,
        estimated_time_minutes: 10,
        started_at: null
      };
    } catch (error) {
      throw new Error(`Failed to complete step: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isOnboardingComplete(tenantId: string): Promise<boolean> {
    try {
      const workflow = await this.getOnboardingWorkflow(tenantId);
      if (!workflow) return false;
      
      const steps = await this.getOnboardingSteps(workflow.id);
      const completedSteps = steps.filter(step => step.step_status === 'completed');
      
      return completedSteps.length === steps.length && steps.length > 0;
    } catch (error) {
      console.error('Error checking onboarding completion:', error);
      return false;
    }
  }

  async getOnboardingData(tenantId: string) {
    try {
      const workflow = await this.getOnboardingWorkflow(tenantId);
      if (!workflow) return null;
      
      const steps = await this.getOnboardingSteps(workflow.id);
      
      return {
        workflow,
        steps
      };
    } catch (error) {
      throw new Error(`Failed to get onboarding data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async initializeOnboardingWorkflow(tenantId: string) {
    try {
      // Check if workflow already exists
      const existing = await this.getOnboardingWorkflow(tenantId);
      if (existing) return this.getOnboardingData(tenantId);
      
      // Create new workflow
      const workflow = await this.createOnboardingWorkflow(tenantId, {
        current_step: 1,
        total_steps: 6,
        status: 'pending'
      });
      
      // Create default steps
      const defaultSteps = [
        { name: 'Business Verification', order: 1, description: 'Verify business details and documents' },
        { name: 'Subscription Plan', order: 2, description: 'Choose your subscription plan' },
        { name: 'Branding Configuration', order: 3, description: 'Set up your brand colors and logo' },
        { name: 'Feature Selection', order: 4, description: 'Select features for your platform' },
        { name: 'Data Import', order: 5, description: 'Import your existing data' },
        { name: 'Team Setup', order: 6, description: 'Invite team members' }
      ];
      
      for (const step of defaultSteps) {
        await supabase
          .from('onboarding_steps')
          .insert({
            workflow_id: workflow.id,
            step_name: step.name,
            step_number: step.order,
            step_status: 'pending',
            step_data: {}
          });
      }
      
      return this.getOnboardingData(tenantId);
    } catch (error) {
      throw new Error(`Failed to initialize onboarding workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateStepStatus(stepId: string, status: OnboardingStep['step_status'], stepData?: any, tenantId?: string) {
    try {
      const { data, error } = await supabase
        .from('onboarding_steps')
        .update({
          step_status: status,
          step_data: stepData || {},
          updated_at: new Date().toISOString(),
          ...(status === 'completed' && { completed_at: new Date().toISOString() })
        })
        .eq('id', stepId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      return {
        id: data.id,
        workflow_id: data.workflow_id,
        step_order: data.step_number,
        step_name: data.step_name,
        step_type: 'default',
        step_config: {},
        step_data: typeof data.step_data === 'object' ? data.step_data : {},
        step_status: data.step_status === 'failed' ? 'pending' : data.step_status,
        completed_at: data.completed_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
        step_number: data.step_number,
        step_description: '',
        is_required: true,
        estimated_time_minutes: 10,
        started_at: null
      };
    } catch (error) {
      throw new Error(`Failed to update step status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async completeWorkflow(workflowId: string, tenantId?: string) {
    try {
      const { data, error } = await supabase
        .from('onboarding_workflows')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', workflowId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      return {
        id: data.id,
        tenant_id: data.tenant_id,
        workflow_name: 'Default Onboarding',
        workflow_type: 'standard',
        template_data: {},
        current_step: data.current_step,
        total_steps: data.total_steps,
        status: data.status as 'pending' | 'in_progress' | 'completed' | 'failed',
        metadata: typeof data.metadata === 'object' ? data.metadata as Record<string, any> : {},
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      throw new Error(`Failed to complete workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateOnboardingIntegrity(tenantId: string) {
    try {
      const workflow = await this.getOnboardingWorkflow(tenantId);
      if (!workflow) {
        return { isValid: false, repaired: false, issues: ['No workflow found'] };
      }
      
      const steps = await this.getOnboardingSteps(workflow.id);
      if (steps.length === 0) {
        return { isValid: false, repaired: false, issues: ['No steps found'] };
      }
      
      return { isValid: true, repaired: false, issues: [] };
    } catch (error) {
      return { isValid: false, repaired: false, issues: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

export const enhancedOnboardingService = new EnhancedOnboardingService();
