
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Building2, Palette, Settings, Users, Database, Edit } from 'lucide-react';
import { OnboardingStep } from '@/services/OnboardingService';
import { useAppSelector } from '@/store/hooks';

interface OnboardingSummaryStepProps {
  step: OnboardingStep;
  onComplete: (stepData?: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
  onEditStep?: (stepNumber: number) => void;
}

export const OnboardingSummaryStep: React.FC<OnboardingSummaryStepProps> = ({
  step,
  onComplete,
  isLoading,
  onEditStep
}) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);

  const handleFinishOnboarding = () => {
    onComplete({ 
      completed: true,
      completedAt: new Date().toISOString(),
      summary: 'Onboarding completed successfully'
    });
  };

  if (step.step_status === 'completed') {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h3 className="text-2xl font-semibold mb-3">Welcome to your platform! 🎉</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your onboarding is complete. You can now start managing your agricultural operations.
        </p>
      </div>
    );
  }

  if (!currentTenant) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading tenant information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold mb-3">Review Your Setup</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Here's a summary of your organization setup. You can edit any section or proceed to complete your onboarding.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Organization Details</CardTitle>
                <CardDescription>Basic information and verification</CardDescription>
              </div>
            </div>
            {onEditStep && (
              <Button variant="ghost" size="sm" onClick={() => onEditStep(1)}>
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Organization Name</span>
              <p className="font-medium">{currentTenant.name}</p>
            </div>
            {currentTenant.owner_name && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Owner</span>
                <p className="font-medium">{currentTenant.owner_name}</p>
              </div>
            )}
            {currentTenant.owner_email && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Email</span>
                <p className="font-medium">{currentTenant.owner_email}</p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              <div className="mt-1">
                <Badge variant={currentTenant.status === 'active' ? 'default' : 'secondary'}>
                  {currentTenant.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Plan */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Subscription Plan</CardTitle>
                <CardDescription>Your current plan and limits</CardDescription>
              </div>
            </div>
            {onEditStep && (
              <Button variant="ghost" size="sm" onClick={() => onEditStep(2)}>
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Plan</span>
              <p className="font-medium capitalize">{currentTenant.subscription_plan?.replace('_', ' ')}</p>
            </div>
            {currentTenant.max_farmers && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Max Farmers</span>
                <p className="font-medium">{currentTenant.max_farmers.toLocaleString()}</p>
              </div>
            )}
            {currentTenant.max_dealers && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Max Dealers</span>
                <p className="font-medium">{currentTenant.max_dealers.toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Branding */}
        {currentTenant.branding && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <Palette className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Branding</CardTitle>
                  <CardDescription>App appearance and colors</CardDescription>
                </div>
              </div>
              {onEditStep && (
                <Button variant="ghost" size="sm" onClick={() => onEditStep(3)}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">App Name</span>
                <p className="font-medium">{currentTenant.branding.app_name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Colors</span>
                <div className="flex gap-2 mt-1">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: currentTenant.branding.primary_color }}
                    title="Primary Color"
                  />
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: currentTenant.branding.secondary_color }}
                    title="Secondary Color"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        {currentTenant.features && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <Database className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Enabled Features</CardTitle>
                  <CardDescription>Your platform capabilities</CardDescription>
                </div>
              </div>
              {onEditStep && (
                <Button variant="ghost" size="sm" onClick={() => onEditStep(4)}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(currentTenant.features)
                  .filter(([key, value]) => value === true)
                  .map(([key]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="bg-muted/50 rounded-lg p-6 text-center">
        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h4 className="font-semibold mb-2">Ready to Get Started!</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Your organization is set up and ready. You can start inviting farmers, managing products, and growing your agricultural network.
        </p>
      </div>

      <div className="flex justify-between items-center pt-6">
        <p className="text-sm text-muted-foreground">
          All steps completed • Ready to launch
        </p>
        <Button 
          onClick={handleFinishOnboarding} 
          disabled={isLoading}
          size="lg"
          className="px-8"
        >
          {isLoading ? 'Finishing...' : 'Complete Onboarding'}
        </Button>
      </div>
    </div>
  );
};
