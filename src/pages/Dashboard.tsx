
import React from 'react';
import { CustomizableDashboard } from '@/components/dashboard/CustomizableDashboard';
import { useRealTimeDashboard } from '@/hooks/data/useRealTimeDashboard';
import { usePostLoginOnboardingCheck } from '@/hooks/usePostLoginOnboardingCheck';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap } from 'lucide-react';

const Dashboard = () => {
  const { isLive, activeChannels } = useRealTimeDashboard();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  // Initialize post-login onboarding check
  usePostLoginOnboardingCheck({
    delayMs: 30000, // 30 seconds after login
    skipOnOnboardingPage: true,
    showNotification: true
  });

  if (!currentTenant) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 shadow-soft border-0 bg-gradient-to-br from-card via-card to-muted/20">
          <CardContent className="flex flex-col items-center space-y-4 p-0">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">Loading Dashboard</h3>
              <p className="text-muted-foreground">Initializing tenant context...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/10">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Enhanced Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Welcome back to {currentTenant.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="capitalize font-medium">
                    {currentTenant.type?.replace('_', ' ') || 'Organization'}
                  </Badge>
                  {currentTenant.subscription_plan && (
                    <Badge variant="secondary" className="capitalize">
                      {currentTenant.subscription_plan.replace('_', ' ')} Plan
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Live Status Card */}
          <Card className="lg:w-auto w-full border-0 shadow-soft bg-gradient-to-r from-card to-muted/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-medium">Live Updates</span>
                </div>
                <LiveIndicator isConnected={isLive} activeChannels={activeChannels} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Dashboard Grid */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-2xl -z-10" />
          <CustomizableDashboard tenantId={currentTenant.id} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
