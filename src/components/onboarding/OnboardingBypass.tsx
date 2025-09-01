
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { setOnboardingComplete } from '@/store/slices/onboardingSlice';

export const OnboardingBypass: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleBypassOnboarding = () => {
    // Mark onboarding as complete in the store
    dispatch(setOnboardingComplete());
    
    // Navigate to dashboard
    navigate('/app/dashboard');
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <Card className="border-2 border-warning/20 bg-warning/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-warning" />
            <div>
              <CardTitle className="text-xl">Skip Onboarding</CardTitle>
              <CardDescription className="mt-1">
                You can complete the setup process later from settings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              By skipping the onboarding process, you'll miss out on:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Customized dashboard setup</li>
              <li>• Team member invitations</li>
              <li>• Data import assistance</li>
              <li>• Feature configuration</li>
            </ul>
            
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
              >
                Go Back
              </Button>
              <Button 
                variant="default"
                onClick={handleBypassOnboarding}
                className="gap-2"
              >
                Continue to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
