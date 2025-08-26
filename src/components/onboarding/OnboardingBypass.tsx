
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useTenantContext } from '@/contexts/TenantContext';
import { useAppSelector } from '@/store/hooks';
import { Rocket, Settings, SkipForward, Play } from 'lucide-react';

export const OnboardingBypass: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenantContext();
  const { user } = useAppSelector((state) => state.auth);

  const handleBypassOnboarding = () => {
    // Navigate directly to dashboard, bypassing onboarding
    navigate('/dashboard', { replace: true });
  };

  const handleStartOnboarding = () => {
    // Reload the onboarding page to start the process
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to {currentTenant?.name || 'Your Tenant'}</h1>
          <p className="text-muted-foreground text-lg">
            Choose how you'd like to proceed with your setup
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Start Onboarding Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                  <Play className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="default" className="bg-primary">Recommended</Badge>
              </div>
              <CardTitle className="text-xl">Complete Setup Wizard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Follow our guided setup process to configure your tenant with all the essential settings, 
                branding, and initial data.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Business information & branding
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Feature selection & configuration
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Team setup & permissions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Initial data import
                </li>
              </ul>
              <Button 
                onClick={handleStartOnboarding} 
                className="w-full"
                size="lg"
              >
                <Settings className="w-4 h-4 mr-2" />
                Start Setup Wizard
              </Button>
            </CardContent>
          </Card>

          {/* Skip Onboarding Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted/20">
                  <SkipForward className="w-6 h-6 text-muted-foreground" />
                </div>
                <Badge variant="outline">Quick Start</Badge>
              </div>
              <CardTitle className="text-xl">Skip to Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Skip the setup process and go directly to your dashboard. You can always 
                configure settings later from the settings page.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                  Access dashboard immediately
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                  Configure settings later
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                  Start using core features
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                  Return to setup anytime
                </li>
              </ul>
              <Button 
                onClick={handleBypassOnboarding} 
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Skip to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            You can always access the setup wizard later from your dashboard settings.
          </p>
        </div>
      </div>
    </div>
  );
};
