
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTenantContext } from '@/contexts/TenantContext';
import { CheckCircle2, Circle, Building2, Settings, Users, Rocket } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  current: boolean;
}

export const TenantOnboardingWizard: React.FC = () => {
  const { currentTenant } = useTenantContext();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps: OnboardingStep[] = [
    {
      id: 'business-setup',
      title: 'Business Setup',
      description: 'Configure your business information and branding',
      icon: <Building2 className="w-5 h-5" />,
      completed: false,
      current: currentStepIndex === 0,
    },
    {
      id: 'features-config',
      title: 'Features Configuration', 
      description: 'Select and configure platform features',
      icon: <Settings className="w-5 h-5" />,
      completed: false,
      current: currentStepIndex === 1,
    },
    {
      id: 'team-setup',
      title: 'Team Setup',
      description: 'Invite team members and set permissions',
      icon: <Users className="w-5 h-5" />,
      completed: false,
      current: currentStepIndex === 2,
    },
    {
      id: 'launch',
      title: 'Launch',
      description: 'Review settings and launch your tenant',
      icon: <Rocket className="w-5 h-5" />,
      completed: false,
      current: currentStepIndex === 3,
    },
  ];

  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const currentStep = steps[currentStepIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to {currentTenant?.name}</h1>
          <p className="text-muted-foreground text-lg">
            Let's get your tenant set up and ready to go
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Setup Progress</span>
            <span className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Navigation */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 
                    ${step.completed 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : step.current 
                        ? 'border-primary text-primary' 
                        : 'border-muted text-muted-foreground'
                    }
                  `}>
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      h-px w-24 ml-4
                      ${step.completed ? 'bg-primary' : 'bg-muted'}
                    `} />
                  )}
                </div>
                <div className="text-center mt-2">
                  <p className={`text-sm font-medium ${
                    step.current ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                  {currentStep.icon}
                </div>
                <div>
                  <CardTitle className="text-xl">{currentStep.title}</CardTitle>
                  <CardDescription>{currentStep.description}</CardDescription>
                </div>
                <Badge variant="outline" className="ml-auto">
                  {currentStepIndex + 1} / {steps.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step Content - This would be dynamically rendered based on current step */}
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Step content for "{currentStep.title}" would go here
                </p>
                <p className="text-sm text-muted-foreground">
                  This is a placeholder for the actual step configuration
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentStepIndex === 0}
                >
                  Previous
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={currentStepIndex === steps.length - 1}
                >
                  {currentStepIndex === steps.length - 1 ? 'Complete Setup' : 'Next'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
