
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  setCurrentStep, 
  nextStep, 
  prevStep,
  setOnboardingComplete,
  updateStepData,
} from '@/store/slices/onboardingSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { SubscriptionPlanStep } from '@/components/onboarding/steps/SubscriptionPlanStep';
import { BusinessVerificationStep } from '@/components/onboarding/steps/BusinessVerificationStep';
import { BrandingConfigurationStep } from '@/components/onboarding/steps/BrandingConfigurationStep';
import { FeatureSelectionStep } from '@/components/onboarding/steps/FeatureSelectionStep';
import { TeamInvitesStep } from '@/components/onboarding/steps/TeamInvitesStep';
import { DataImportStep } from '@/components/onboarding/steps/DataImportStep';
import { OnboardingSummaryStep } from '@/components/onboarding/steps/OnboardingSummaryStep';

const TenantOnboardingWizard = () => {
  const dispatch = useAppDispatch();
  const { currentStep, totalSteps, stepData, isOnboardingComplete } = useAppSelector(
    (state) => state.onboarding
  );
  
  const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({});
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);

  const steps = [
    { id: 0, title: 'Subscription Plan', component: SubscriptionPlanStep },
    { id: 1, title: 'Business Verification', component: BusinessVerificationStep },
    { id: 2, title: 'Branding Configuration', component: BrandingConfigurationStep },
    { id: 3, title: 'Feature Selection', component: FeatureSelectionStep },
    { id: 4, title: 'Team Invites', component: TeamInvitesStep },
    { id: 5, title: 'Data Import', component: DataImportStep },
    { id: 6, title: 'Summary', component: OnboardingSummaryStep },
  ];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      dispatch(nextStep());
    } else {
      dispatch(setOnboardingComplete(true));
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      dispatch(prevStep());
    }
  };

  const handleStepDataChange = (data: any) => {
    dispatch(updateStepData({ step: currentStep.toString(), data }));
  };

  const handleValidationChange = (isValid: boolean) => {
    setIsCurrentStepValid(isValid);
    setStepValidation(prev => ({ ...prev, [currentStep]: isValid }));
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;
  const CurrentStepComponent = steps[currentStep]?.component;

  if (isOnboardingComplete) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <Card className="text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Welcome to Your Dashboard!</h2>
            <p className="text-muted-foreground mb-6">
              Your tenant setup is complete. You can now start managing your farmer network.
            </p>
            <Button onClick={() => window.location.reload()}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Setup Your Tenant</CardTitle>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      {/* Step Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {steps.map((step) => (
          <Button
            key={step.id}
            variant={currentStep === step.id ? "default" : "outline"}
            size="sm"
            onClick={() => dispatch(setCurrentStep(step.id))}
            className="text-xs"
          >
            {step.id < currentStep && (
              <CheckCircle className="h-3 w-3 mr-1" />
            )}
            {step.title}
          </Button>
        ))}
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep]?.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {CurrentStepComponent && currentStep === 0 && (
            <SubscriptionPlanStep
              step={{
                id: `step-${currentStep}`,
                workflow_id: 'temp-workflow-id',
                step_number: currentStep + 1,
                step_name: steps[currentStep]?.title || 'Subscription Plan',
                step_description: 'Choose your subscription plan',
                step_status: 'pending',
                is_required: true,
                estimated_time_minutes: 5,
                step_data: stepData[currentStep.toString()] || {},
                started_at: null,
                completed_at: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }}
              onComplete={handleStepDataChange}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isLoading={false}
            />
          )}
          {CurrentStepComponent && currentStep !== 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {steps[currentStep]?.title} component will be implemented here
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!isCurrentStepValid && currentStep === 0}
        >
          {currentStep === totalSteps - 1 ? 'Complete Setup' : 'Next'}
          {currentStep < totalSteps - 1 && (
            <ArrowRight className="h-4 w-4 ml-2" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default TenantOnboardingWizard;
