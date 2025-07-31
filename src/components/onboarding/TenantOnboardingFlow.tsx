
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useOnboardingQuery, useCompleteStep } from '@/hooks/useOnboarding';
import { BusinessVerificationStep } from './steps/BusinessVerificationStep';
import { SubscriptionPlanStep } from './steps/SubscriptionPlanStep';
import { BrandingConfigurationStep } from './steps/BrandingConfigurationStep';
import { FeatureSelectionStep } from './steps/FeatureSelectionStep';
import { DataImportStep } from './steps/DataImportStep';
import { TeamInvitesStep } from './steps/TeamInvitesStep';
import { OnboardingStep } from '@/services/OnboardingService';

export const TenantOnboardingFlow = () => {
  const navigate = useNavigate();
  const { data: onboardingData, isLoading } = useOnboardingQuery();
  const completeStepMutation = useCompleteStep();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!onboardingData?.workflow || !onboardingData?.steps) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p>No onboarding workflow found. Please contact support.</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { workflow, steps } = onboardingData;
  const currentStep = steps[currentStepIndex];
  const completedSteps = steps.filter(step => step.step_status === 'completed').length;
  const progressPercentage = Math.round((completedSteps / steps.length) * 100);

  const handleStepComplete = async (stepData?: any) => {
    if (currentStep) {
      await completeStepMutation.mutateAsync({
        stepId: currentStep.id,
        stepData
      });

      // Move to next step if not the last one
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        // All steps completed, redirect to dashboard
        navigate('/dashboard');
      }
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const renderStepContent = () => {
    if (!currentStep) return null;

    const stepProps = {
      step: currentStep,
      onComplete: handleStepComplete,
      onNext: handleNext,
      onPrevious: handlePrevious,
      isLoading: completeStepMutation.isPending
    };

    switch (currentStep.step_name) {
      case 'Business Verification':
        return <BusinessVerificationStep {...stepProps} />;
      case 'Subscription Plan':
        return <SubscriptionPlanStep {...stepProps} />;
      case 'Branding Configuration':
        return <BrandingConfigurationStep {...stepProps} />;
      case 'Feature Selection':
        return <FeatureSelectionStep {...stepProps} />;
      case 'Data Import':
        return <DataImportStep {...stepProps} />;
      case 'Team Invites':
        return <TeamInvitesStep {...stepProps} />;
      default:
        return <div>Unknown step: {currentStep.step_name}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to AgriTenant Hub!</h1>
          <p className="text-muted-foreground">Let's get your organization set up in just a few steps</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Setup Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedSteps} of {steps.length} completed
              </span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </CardContent>
        </Card>

        {/* Step Navigation */}
        <div className="flex items-center justify-between mb-6 overflow-x-auto">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className="flex flex-col items-center min-w-0">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.step_status === 'completed'
                      ? 'bg-primary border-primary text-primary-foreground'
                      : index === currentStepIndex
                      ? 'border-primary text-primary'
                      : 'border-muted-foreground text-muted-foreground'
                  }`}
                >
                  {step.step_status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs mt-1 text-center">{step.step_name}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  step.step_status === 'completed' ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Step {currentStepIndex + 1}: {currentStep?.step_name}
            </CardTitle>
            <CardDescription>
              {currentStep?.step_description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentStep?.step_status !== 'completed' && (
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentStepIndex === steps.length - 1}
              >
                Skip for now
              </Button>
            )}
            
            {currentStepIndex === steps.length - 1 && completedSteps === steps.length ? (
              <Button onClick={() => navigate('/dashboard')}>
                Complete Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={currentStepIndex === steps.length - 1}
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
