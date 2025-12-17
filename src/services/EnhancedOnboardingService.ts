
import { BaseApiService } from './core/BaseApiService';
import { supabase } from '@/integrations/supabase/client';
import { onboardingTemplateService } from './OnboardingTemplateService';

const IS_DEV = import.meta.env.DEV;
const log = IS_DEV ? console.log.bind(console) : () => {};

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
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private transformDbStepToFrontend(dbStep: any): OnboardingStep {
    const stepData = typeof dbStep.step_data === 'object' ? dbStep.step_data : {};
    const displayName = stepData.display_name || onboardingTemplateService.getDisplayNameForStep(dbStep.step_name);
    
    return {
      id: dbStep.id,
      workflow_id: dbStep.workflow_id,
      step_order: dbStep.step_number,
      step_name: displayName,
      step_type: stepData.step_type || 'standard',
      step_config: stepData.step_config || {},
      step_data: stepData,
      step_status: dbStep.step_status === 'failed' ? 'pending' : dbStep.step_status,
      completed_at: dbStep.completed_at,
      created_at: dbStep.created_at,
      updated_at: dbStep.updated_at,
      step_number: dbStep.step_number,
      step_description: stepData.step_description || `Complete ${displayName}`,
      is_required: stepData.is_required !== false,
      estimated_time_minutes: stepData.estimated_time_minutes || 15,
      started_at: dbStep.started_at || null
    };
  }

  async getOnboardingWorkflow(tenantId: string): Promise<OnboardingWorkflow | null> {
    const cacheKey = `workflow-${tenantId}`;
    const cached = this.getCached<OnboardingWorkflow>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('onboarding_workflows')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (error) throw new Error(error.message);
      
      if (data) {
        const metadata = typeof data.metadata === 'object' && data.metadata !== null ? data.metadata as Record<string, any> : {};
        
        const workflow: OnboardingWorkflow = {
          id: data.id,
          tenant_id: data.tenant_id,
          workflow_name: 'Tenant Onboarding',
          workflow_type: 'standard',
          template_data: {},
          current_step: data.current_step,
          total_steps: data.total_steps,
          status: data.status as 'pending' | 'in_progress' | 'completed' | 'failed',
          metadata,
          created_at: data.created_at,
          updated_at: data.updated_at
        };

        this.setCache(cacheKey, workflow);
        return workflow;
      }
      
      return null;
    } catch (error) {
      console.error('EnhancedOnboardingService: Failed to fetch workflow:', error);
      throw new Error(`Failed to fetch onboarding workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createOnboardingWorkflow(tenantId: string, workflowData: Partial<OnboardingWorkflow>): Promise<OnboardingWorkflow> {
    try {
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('subscription_plan')
        .eq('id', tenantId)
        .single();

      const subscriptionPlan = tenantData?.subscription_plan || 'Kisan_Basic';
      
      const { data, error } = await supabase
        .from('onboarding_workflows')
        .insert({
          tenant_id: tenantId,
          current_step: workflowData.current_step || 1,
          total_steps: workflowData.total_steps || 6,
          status: workflowData.status || 'pending',
          metadata: {
            ...workflowData.metadata,
            workflow_name: workflowData.workflow_name || 'Tenant Onboarding',
            workflow_type: workflowData.workflow_type || 'standard',
            template_data: workflowData.template_data || {},
            subscription_plan: subscriptionPlan
          }
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      const metadata = typeof data.metadata === 'object' && data.metadata !== null ? data.metadata as Record<string, any> : {};
      
      const workflow: OnboardingWorkflow = {
        id: data.id,
        tenant_id: data.tenant_id,
        workflow_name: metadata.workflow_name || 'Tenant Onboarding',
        workflow_type: metadata.workflow_type || 'standard',
        template_data: metadata.template_data || {},
        current_step: data.current_step,
        total_steps: data.total_steps,
        status: data.status as 'pending' | 'in_progress' | 'completed' | 'failed',
        metadata,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      this.setCache(`workflow-${tenantId}`, workflow);
      return workflow;
    } catch (error) {
      console.error('EnhancedOnboardingService: Failed to create workflow:', error);
      throw new Error(`Failed to create onboarding workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getOnboardingSteps(workflowId: string): Promise<OnboardingStep[]> {
    const cacheKey = `steps-${workflowId}`;
    const cached = this.getCached<OnboardingStep[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('onboarding_steps')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('step_number');

      if (error) throw new Error(error.message);
      
      const steps = (data || []).map(step => this.transformDbStepToFrontend(step));
      this.setCache(cacheKey, steps);
      
      return steps;
    } catch (error) {
      console.error('EnhancedOnboardingService: Failed to fetch steps:', error);
      throw new Error(`Failed to fetch onboarding steps: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async completeStep(stepId: string, stepData: any, tenantId?: string): Promise<OnboardingStep> {
    try {
      const { data, error } = await supabase
        .from('onboarding_steps')
        .update({
          step_status: 'completed',
          step_data: stepData || {},
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', stepId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      // Invalidate cache
      if (data?.workflow_id) {
        this.cache.delete(`steps-${data.workflow_id}`);
      }
      
      return this.transformDbStepToFrontend(data);
    } catch (error) {
      console.error('EnhancedOnboardingService: Failed to complete step:', error);
      throw new Error(`Failed to complete step: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateStepStatus(stepId: string, status: OnboardingStep['step_status'], stepData?: any, tenantId?: string) {
    try {
      const updateData: any = {
        step_status: status,
        step_data: stepData || {},
        updated_at: new Date().toISOString()
      };

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (status === 'in_progress') {
        updateData.started_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('onboarding_steps')
        .update(updateData)
        .eq('id', stepId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      // Invalidate cache
      if (data?.workflow_id) {
        this.cache.delete(`steps-${data.workflow_id}`);
      }
      
      return this.transformDbStepToFrontend(data);
    } catch (error) {
      console.error('EnhancedOnboardingService: Failed to update step status:', error);
      throw new Error(`Failed to update step status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async ensureWorkflowConsistency(tenantId: string): Promise<void> {
    try {
      const workflow = await this.getOnboardingWorkflow(tenantId);
      if (!workflow) return;
      
      const steps = await this.getOnboardingSteps(workflow.id);
      const allCompleted = steps.every(s => s.step_status === 'completed');
      
      if (allCompleted && workflow.status !== 'completed' && steps.length > 0) {
        await this.completeWorkflow(workflow.id, tenantId);
        
        await supabase
          .from('tenants')
          .update({ onboarding_completed: true })
          .eq('id', tenantId);
      }
    } catch (error) {
      console.error('EnhancedOnboardingService: Error ensuring workflow consistency:', error);
    }
  }

  async isOnboardingComplete(tenantId: string): Promise<boolean> {
    try {
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('onboarding_completed')
        .eq('id', tenantId)
        .single();
      
      if (!tenantError && tenantData?.onboarding_completed === true) {
        return true;
      }
      
      const workflow = await this.getOnboardingWorkflow(tenantId);
      if (!workflow) return false;
      
      if (workflow.status === 'completed') return true;
      
      const steps = await this.getOnboardingSteps(workflow.id);
      return steps.length > 0 && steps.every(step => step.step_status === 'completed');
    } catch (error) {
      console.error('EnhancedOnboardingService: Error checking completion:', error);
      return false;
    }
  }

  async getOnboardingData(tenantId: string) {
    try {
      await this.ensureWorkflowConsistency(tenantId);
      
      const workflow = await this.getOnboardingWorkflow(tenantId);
      if (!workflow) return null;
      
      const steps = await this.getOnboardingSteps(workflow.id);
      
      return { workflow, steps };
    } catch (error) {
      console.error('EnhancedOnboardingService: Failed to get onboarding data:', error);
      throw new Error(`Failed to get onboarding data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async initializeOnboardingWorkflow(tenantId: string) {
    try {
      const existing = await this.getOnboardingWorkflow(tenantId);
      if (existing) {
        return this.getOnboardingData(tenantId);
      }
      
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('subscription_plan')
        .eq('id', tenantId)
        .single();

      const subscriptionPlan = tenantData?.subscription_plan || 'Kisan_Basic';
      
      const workflow = await this.createOnboardingWorkflow(tenantId, {
        current_step: 1,
        total_steps: 6,
        status: 'pending',
        metadata: { subscription_plan: subscriptionPlan }
      });
      
      await onboardingTemplateService.createStepsFromTemplate(workflow.id, tenantId, subscriptionPlan);
      
      return this.getOnboardingData(tenantId);
    } catch (error) {
      console.error('EnhancedOnboardingService: Failed to initialize workflow:', error);
      throw new Error(`Failed to initialize onboarding workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      
      // Invalidate cache
      if (tenantId) {
        this.cache.delete(`workflow-${tenantId}`);
      }
      
      const metadata = typeof data.metadata === 'object' && data.metadata !== null ? data.metadata as Record<string, any> : {};
      
      return {
        id: data.id,
        tenant_id: data.tenant_id,
        workflow_name: metadata.workflow_name || 'Tenant Onboarding',
        workflow_type: metadata.workflow_type || 'standard',
        template_data: metadata.template_data || {},
        current_step: data.current_step,
        total_steps: data.total_steps,
        status: data.status as 'pending' | 'in_progress' | 'completed' | 'failed',
        metadata,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('EnhancedOnboardingService: Failed to complete workflow:', error);
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
