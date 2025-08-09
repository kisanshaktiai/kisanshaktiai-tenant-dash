
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, ArrowLeft, ArrowRight, Clock, Users, Sparkles } from 'lucide-react';
import { useOnboardingQuery, useCompleteStep } from '@/hooks/useOnboarding';
import { BusinessVerificationStep } from './steps/BusinessVerificationStep';
import { SubscriptionPlanStep } from './steps/SubscriptionPlanStep';
import { BrandingConfigurationStep } from './steps/BrandingConfigurationStep';
import { FeatureSelectionStep } from './steps/FeatureSelectionStep';
import { DataImportStep } from './steps/DataImportStep';
import { TeamInvitesStep } from './steps/TeamInvitesStep';
import { OnboardingStep } from '@/services/OnboardingService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const TenantOnboardingFlow = () => {
  const navigate = useNavigate();
  const { data: onboardingData, isLoading, error } = useOnboardingQuery();
  const completeStepMutation = useCompleteStep();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

  // Auto-advance to first incomplete step
  useEffect(() => {
    if (onboardingData?.steps) {
      const firstIncompleteIndex = onboardingData.steps.findIndex(
        step => step.step_status !== 'completed'
      );
      if (firstIncompleteIndex >= 0) {
        setCurrentStepIndex(firstIncompleteIndex);
      }
    }
  }, [onboardingData?.steps]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary animate-spin rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading your onboarding...</p>
        </div>
      </div>
    );
  }

  if (error || !onboardingData?.workflow || !onboardingData?.steps) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <Circle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Setup Required</h3>
              <p className="text-muted-foreground text-sm mb-4">
                We couldn't find your onboarding workflow. Let's get you started!
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { workflow, steps } = onboardingData;
  const currentStep = steps[currentStepIndex];
  const completedSteps = steps.filter(step => step.step_status === 'completed').length;
  const progressPercentage = Math.round((completedSteps / steps.length) * 100);
  const estimatedTimeRemaining = steps
    .filter(step => step.step_status !== 'completed')
    .reduce((acc, step) => acc + (step.estimated_time_minutes || 15), 0);

  const handleStepComplete = async (stepData?: any) => {
    if (!currentStep) return;

    try {
      await completeStepMutation.mutateAsync({
        stepId: currentStep.id,
        stepData
      });

      toast.success(`${currentStep.step_name} completed!`, {
        description: "Great progress! Moving to the next step.",
      });

      // Auto-advance to next incomplete step
      const nextIncompleteIndex = steps.findIndex(
        (step, index) => index > currentStepIndex && step.step_status !== 'completed'
      );
      
      if (nextIncompleteIndex >= 0) {
        setCurrentStepIndex(nextIncompleteIndex);
      } else {
        // All steps completed
        toast.success("🎉 Onboarding Complete!", {
          description: "Welcome to your new dashboard!",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to complete step:', error);
      toast.error("Failed to save progress. Please try again.");
    }
  };

  const handleStepNavigation = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
  };

  const renderStepContent = () => {
    if (!currentStep) return null;

    const stepProps = {
      step: currentStep,
      onComplete: handleStepComplete,
      onNext: () => handleStepNavigation(Math.min(currentStepIndex + 1, steps.length - 1)),
      onPrevious: () => handleStepNavigation(Math.max(currentStepIndex - 1, 0)),
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
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Unknown step: {currentStep.step_name}</p>
          </div>
        );
    }
  };

  // Welcome screen
  if (showWelcome && completedSteps === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-12 text-center space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Welcome to AgriTenant Hub!
                </h1>
                <p className="text-xl text-muted-foreground max-w-md mx-auto">
                  Let's get your organization set up with a world-class agricultural platform in just a few steps.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 my-8">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                  <p className="text-sm font-medium">Easy Setup</p>
                  <p className="text-xs text-muted-foreground">Step-by-step guidance</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-sm font-medium">~{estimatedTimeRemaining} minutes</p>
                  <p className="text-xs text-muted-foreground">Estimated completion</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6 text-purple-500" />
                  </div>
                  <p className="text-sm font-medium">Team Ready</p>
                  <p className="text-xs text-muted-foreground">Invite your team</p>
                </div>
              </div>

              <Button size="lg" onClick={() => setShowWelcome(false)} className="px-8">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Setup Progress</h1>
              <Badge variant="secondary" className="font-medium">
                {completedSteps} of {steps.length} completed
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                ~{estimatedTimeRemaining}min remaining
              </div>
              <Progress value={progressPercentage} className="w-24" />
              <span className="font-medium">{progressPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 pb-24">
        {/* Step Navigation */}
        <div className="mb-8 mt-6">
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center min-w-0 cursor-pointer group" onClick={() => handleStepNavigation(index)}>
                  <div
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
                      step.step_status === 'completed'
                        ? 'bg-success border-success text-success-foreground shadow-lg'
                        : index === currentStepIndex
                        ? 'border-primary text-primary bg-primary/10 shadow-lg scale-110'
                        : 'border-muted text-muted-foreground group-hover:border-primary/50 group-hover:text-primary/70'
                    )}
                  >
                    {step.step_status === 'completed' ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center max-w-24">
                    <p className={cn(
                      "text-xs font-medium truncate transition-colors",
                      index === currentStepIndex ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {step.step_name}
                    </p>
                    {step.estimated_time_minutes && (
                      <p className="text-xs text-muted-foreground/70">
                        ~{step.estimated_time_minutes}min
                      </p>
                    )}
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors duration-300",
                    step.step_status === 'completed' ? 'bg-success' : 'bg-muted'
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                    {currentStepIndex + 1}
                  </span>
                  {currentStep?.step_name}
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  {currentStep?.step_description}
                </CardDescription>
              </div>
              {currentStep?.estimated_time_minutes && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  ~{currentStep.estimated_time_minutes}min
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => handleStepNavigation(Math.max(currentStepIndex - 1, 0))}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {steps.length}
              </div>
              <Progress value={((currentStepIndex + 1) / steps.length) * 100} className="w-32" />
            </div>

            <div className="flex gap-2">
              {currentStep?.step_status !== 'completed' && !currentStep?.is_required && (
                <Button
                  variant="ghost"
                  onClick={() => handleStepNavigation(Math.min(currentStepIndex + 1, steps.length - 1))}
                  disabled={currentStepIndex === steps.length - 1}
                >
                  Skip for now
                </Button>
              )}
              
              {currentStepIndex === steps.length - 1 && completedSteps === steps.length ? (
                <Button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
                  Complete Setup
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => handleStepNavigation(Math.min(currentStepIndex + 1, steps.length - 1))}
                  disabled={currentStepIndex === steps.length - 1}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
