
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, ArrowLeft, ArrowRight, Sparkles, Building2, RefreshCw } from 'lucide-react';
import { useOnboardingQuery, useCompleteStep, useUpdateStepStatus, useCompleteWorkflow } from '@/hooks/useOnboarding';
import { useOnboardingRealtime } from '@/hooks/useOnboardingRealtime';
import { useOnboardingAutoProgress } from '@/hooks/useOnboardingAutoProgress';
import { useAppSelector } from '@/store/hooks';
import { BusinessVerificationStep } from './steps/BusinessVerificationStep';
import { SubscriptionPlanStep } from './steps/SubscriptionPlanStep';
import { BrandingConfigurationStep } from './steps/BrandingConfigurationStep';
import { FeatureSelectionStep } from './steps/FeatureSelectionStep';
import { DataImportStep } from './steps/DataImportStep';
import { TeamInvitesStep } from './steps/TeamInvitesStep';
import { OnboardingSummaryStep } from './steps/OnboardingSummaryStep';
import { tenantProfileService } from '@/services/TenantProfileService';
import { toast } from 'sonner';
import type { OnboardingStep } from '@/services/EnhancedOnboardingService';
import { calculateWorkflowProgress } from '@/utils/onboardingDataMapper';

const stepComponents = {
  'Business Verification': BusinessVerificationStep,
  'Subscription Plan': SubscriptionPlanStep,
  'Branding Configuration': BrandingConfigurationStep,
  'Feature Selection': FeatureSelectionStep,
  'Data Import': DataImportStep,
  'Team Setup': TeamInvitesStep,
  'Summary': OnboardingSummaryStep,
};

const MissingStepsPanel = ({ onRetry }: { onRetry: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
    <Card className="w-full max-w-md">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Loading Onboarding Steps</h3>
        <p className="text-muted-foreground text-sm mb-6">
          We're preparing your onboarding experience. This might take a moment if you just started.
        </p>
        <Button onClick={onRetry} variant="outline" className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Steps
        </Button>
      </CardContent>
    </Card>
  </div>
);

const TenantOnboardingFlow: React.FC = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { data: onboardingData, isLoading, error, refetch } = useOnboardingQuery();
  const completeStepMutation = useCompleteStep();
  const updateStepMutation = useUpdateStepStatus();
  const completeWorkflowMutation = useCompleteWorkflow();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [preloadedSteps, setPreloadedSteps] = useState<Set<number>>(new Set());
  const currentStepRef = useRef<HTMLDivElement>(null);

  // Enable real-time updates
  useOnboardingRealtime();

  // Enable auto-progress detection
  useOnboardingAutoProgress(
    onboardingData?.steps || [], 
    onboardingData?.workflow?.id
  );

  const steps = onboardingData?.steps || [];
  const workflow = onboardingData?.workflow;
  const currentStep = steps[currentStepIndex];

  // Add summary step if not present and we have real steps
  const allSteps = [...steps];
  if (allSteps.length > 0 && !allSteps.find(s => s.step_name === 'Summary')) {
    const summaryStep: OnboardingStep = {
      id: 'summary',
      workflow_id: workflow?.id || '',
      step_order: allSteps.length + 1,
      step_name: 'Summary',
      step_type: 'summary',
      step_config: {},
      step_data: {},
      step_status: 'pending' as const,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      step_number: allSteps.length + 1,
      step_description: 'Review and complete your setup',
      is_required: true,
      estimated_time_minutes: 5,
      started_at: null
    };
    allSteps.push(summaryStep);
  }

  // Preload next step component
  useEffect(() => {
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < allSteps.length && !preloadedSteps.has(nextStepIndex)) {
      const nextStep = allSteps[nextStepIndex];
      const NextStepComponent = stepComponents[nextStep.step_name as keyof typeof stepComponents];
      
      if (NextStepComponent) {
        setTimeout(() => {
          setPreloadedSteps(prev => new Set([...prev, nextStepIndex]));
        }, 100);
      }
    }
  }, [currentStepIndex, allSteps, preloadedSteps]);

  // Focus management
  useEffect(() => {
    if (currentStepRef.current && !showWelcome) {
      currentStepRef.current.focus();
    }
  }, [currentStepIndex, showWelcome]);

  // Update current step index based on progress
  useEffect(() => {
    if (allSteps.length === 0) return;

    const firstIncompleteIndex = allSteps.findIndex(step => 
      step.step_status !== 'completed' && step.step_status !== 'skipped'
    );

    if (firstIncompleteIndex !== -1 && firstIncompleteIndex !== currentStepIndex) {
      setCurrentStepIndex(firstIncompleteIndex);
    } else if (firstIncompleteIndex === -1) {
      setCurrentStepIndex(allSteps.length - 1);
    }
  }, [allSteps, currentStepIndex]);

  const handleStepComplete = async (stepData?: any) => {
    if (!currentStep || !currentTenant?.id) return;

    try {
      // Handle Summary step differently - complete the workflow
      if (currentStep.step_name === 'Summary' && workflow) {
        await completeWorkflowMutation.mutateAsync(workflow.id);
        await refetch();
        return;
      }

      // Save data to appropriate tenant tables based on step
      switch (currentStep.step_name) {
        case 'Business Verification':
          if (stepData) {
            await tenantProfileService.updateBusinessVerification(currentTenant.id, stepData);
          }
          break;

        case 'Subscription Plan':
          if (stepData?.selectedPlan) {
            await tenantProfileService.updateTenantBasics(currentTenant.id, {
              name: currentTenant.name,
              subscription_plan: stepData.selectedPlan
            } as any);
          }
          break;

        case 'Branding Configuration':
          if (stepData) {
            await tenantProfileService.upsertBranding(currentTenant.id, stepData);
          }
          break;

        case 'Feature Selection':
          if (stepData?.selectedFeatures) {
            await tenantProfileService.upsertFeatures(currentTenant.id, stepData.selectedFeatures);
          }
          break;

        case 'Data Import':
          if (stepData && !stepData.skipped) {
            await tenantProfileService.createDataMigrationJob(currentTenant.id, stepData);
          }
          break;

        case 'Team Setup':
          if (stepData?.invites?.length > 0) {
            await tenantProfileService.inviteTeamMembers(currentTenant.id, stepData.invites);
          }
          break;
      }

      // Complete the step
      await completeStepMutation.mutateAsync({
        stepId: currentStep.id,
        stepData
      });

      // Move to next step if available
      if (currentStepIndex < allSteps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      }

    } catch (error) {
      console.error('Error completing step:', error);
      toast.error('Failed to save progress. Please try again.');
    }
  };

  const handleStepNavigation = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < allSteps.length) {
      setCurrentStepIndex(stepIndex);
    }
  };

  const progress = allSteps.length > 0 
    ? calculateWorkflowProgress(allSteps)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-8 h-8 animate-spin mx-auto mb-4 rounded-full border-2 border-primary border-t-transparent" />
            <h3 className="text-lg font-semibold mb-2">Loading your onboarding...</h3>
            <p className="text-muted-foreground text-sm">
              Please wait while we prepare your setup experience.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Setup Error</h3>
            <p className="text-muted-foreground text-sm mb-4">
              There was an issue loading your onboarding. Please refresh the page or contact support.
            </p>
            <Button onClick={() => refetch()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show friendly retry panel if no steps are available
  if (!isLoading && allSteps.length === 0) {
    return <MissingStepsPanel onRetry={() => refetch()} />;
  }

  // Welcome screen
  if (showWelcome && currentTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5 p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">
              Welcome to {currentTenant.name}! 🌾
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Let's get your agricultural platform set up in just a few steps. 
              We'll help you configure everything you need to start managing your farmer network.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 text-sm">
              <div className="p-4 bg-muted/50 rounded-lg">
                <Building2 className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium">Verify Business</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium">Choose Features</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <Clock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium">Import Data</p>
              </div>
            </div>

            <Button 
              size="lg" 
              onClick={() => setShowWelcome(false)}
              className="px-8 focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Start Setup
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentStep) {
    return <MissingStepsPanel onRetry={() => refetch()} />;
  }

  const StepComponent = stepComponents[currentStep.step_name as keyof typeof stepComponents];

  if (!StepComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Unknown step: {currentStep.step_name}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Setup Your Platform</h1>
              <p className="text-muted-foreground">
                Step {currentStepIndex + 1} of {allSteps.length}: {currentStep.step_name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium">{progress}% Complete</div>
                <div className="text-xs text-muted-foreground">
                  {allSteps.filter(s => s.step_status === 'completed').length} of {allSteps.length} steps
                </div>
              </div>
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Step Navigation */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center mb-8 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {allSteps.map((step, index) => (
              <div key={step.id} className="contents">
                <button
                  onClick={() => handleStepNavigation(index)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    index === currentStepIndex
                      ? 'bg-primary text-primary-foreground'
                      : step.step_status === 'completed'
                      ? 'bg-success/10 text-success hover:bg-success/20'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  aria-label={`Step ${index + 1}: ${step.step_name} ${step.step_status === 'completed' ? '(completed)' : ''}`}
                >
                  {step.step_status === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-current" />
                  )}
                  <span className="hidden sm:inline">{step.step_name}</span>
                </button>
                {index < allSteps.length - 1 && (
                  <div className="w-8 h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="max-w-6xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div ref={currentStepRef} tabIndex={-1} className="focus:outline-none">
                <StepComponent
                  step={currentStep}
                  onComplete={handleStepComplete}
                  onNext={() => handleStepNavigation(currentStepIndex + 1)}
                  onPrevious={() => handleStepNavigation(currentStepIndex - 1)}
                  onEditStep={handleStepNavigation}
                  isLoading={completeStepMutation.isPending || updateStepMutation.isPending}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t bg-background/80 backdrop-blur-sm sticky bottom-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline"
              onClick={() => handleStepNavigation(currentStepIndex - 1)}
              disabled={currentStepIndex === 0}
              className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {allSteps.filter(s => s.step_status === 'completed').length} completed
              </Badge>
              <Badge variant="outline">
                {allSteps.filter(s => s.step_status === 'pending').length} remaining
              </Badge>
            </div>

            <Button 
              onClick={() => handleStepNavigation(currentStepIndex + 1)}
              disabled={currentStepIndex === allSteps.length - 1 || currentStep.step_status !== 'completed'}
              className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantOnboardingFlow;
