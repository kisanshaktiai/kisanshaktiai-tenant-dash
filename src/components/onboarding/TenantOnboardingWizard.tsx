
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { nextStep, prevStep, updateStepData, setOnboardingComplete } from '@/store/slices/onboardingSlice';

// Import step components
import { SubscriptionPlanStep } from './steps/SubscriptionPlanStep';
import { BusinessVerificationStep } from './steps/BusinessVerificationStep';
import { BrandingConfigurationStep } from './steps/BrandingConfigurationStep';
import { FeatureSelectionStep } from './steps/FeatureSelectionStep';
import { TeamInvitesStep } from './steps/TeamInvitesStep';
import { DataImportStep } from './steps/DataImportStep';
import { OnboardingSummaryStep } from './steps/OnboardingSummaryStep';

const steps = [
  { id: 'subscription', title: 'Subscription Plan', component: SubscriptionPlanStep },
  { id: 'verification', title: 'Business Verification', component: BusinessVerificationStep },
  { id: 'branding', title: 'Branding Setup', component: BrandingConfigurationStep },
  { id: 'features', title: 'Feature Selection', component: FeatureSelectionStep },
  { id: 'team', title: 'Team Invites', component: TeamInvitesStep },
  { id: 'data', title: 'Data Import', component: DataImportStep },
  { id: 'summary', title: 'Summary', component: OnboardingSummaryStep },
];

export const TenantOnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentStep, stepData, isCompleted } = useAppSelector((state) => state.onboarding);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isStepValid, setIsStepValid] = useState(false);

  const currentStepIndex = steps.findIndex((step, index) => index === currentStep);
  const CurrentStepComponent = steps[currentStepIndex]?.component;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    if (isCompleted) {
      navigate('/app/dashboard');
    }
  }, [isCompleted, navigate]);

  const handleNext = async () => {
    if (currentStepIndex < steps.length - 1) {
      dispatch(nextStep());
    } else {
      // Complete onboarding
      try {
        setIsLoading(true);
        // Mock completion - replace with actual completion logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        dispatch(setOnboardingComplete(true));
        navigate('/app/dashboard');
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      dispatch(prevStep());
    }
  };

  const handleStepDataChange = (data: any) => {
    dispatch(updateStepData({ step: steps[currentStepIndex]?.id || 'unknown', data }));
  };

  const handleStepValidation = (isValid: boolean) => {
    setIsStepValid(isValid);
  };

  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="w-full px-4 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Complete Your Setup</h1>
          <p className="text-muted-foreground text-base lg:text-lg">
            Let's get your organization ready to manage farmers effectively
          </p>
        </div>

        {/* Progress */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Step {currentStepIndex + 1} of {steps.length}
              </CardTitle>
              <Badge variant="outline">
                {Math.round(progress)}% Complete
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
        </Card>

        {/* Steps Navigation */}
        <div className="hidden md:flex justify-center">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                      isCompleted 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : isActive 
                        ? 'border-primary text-primary' 
                        : 'border-muted-foreground/30 text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`text-xs font-medium ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-px mx-2 ${
                      isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStepIndex]?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {CurrentStepComponent && (
              <CurrentStepComponent
                data={stepData[steps[currentStepIndex]?.id] || {}}
                onDataChange={handleStepDataChange}
                onValidationChange={handleStepValidation}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isStepValid || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLastStep ? (
              'Complete Setup'
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
