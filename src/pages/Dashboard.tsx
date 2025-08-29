
import React from 'react';
import { CustomizableDashboard } from '@/components/dashboard/CustomizableDashboard';
import { useRealTimeDashboard } from '@/hooks/data/useRealTimeDashboard';
import { usePostLoginOnboardingCheck } from '@/hooks/usePostLoginOnboardingCheck';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Sparkles } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-[70vh] px-6">
        <Card className="p-12 shadow-strong border-0 bg-gradient-to-br from-card/95 via-card to-background/90 backdrop-blur-sm max-w-md mx-auto">
          <CardContent className="flex flex-col items-center space-y-6 p-0">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Activity className="h-8 w-8 text-primary-foreground animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-harvest rounded-full flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-primary-foreground" />
              </div>
            </div>
            <div className="text-center space-y-3">
              <h3 className="font-bold text-2xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Loading Dashboard
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Initializing tenant context...
              </p>
              <div className="flex justify-center pt-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-muted/5">
      <div className="container mx-auto px-8 py-10 space-y-10">
        {/* Enhanced Header Section with Modern Cards */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow border border-primary/20">
                  <Zap className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-growth rounded-full border-2 border-background flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent leading-tight">
                  Welcome back to {currentTenant.name}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className="capitalize font-semibold px-4 py-2 text-sm bg-gradient-to-r from-secondary/50 to-muted/30 border-border/60">
                    {currentTenant.type?.replace('_', ' ') || 'Organization'}
                  </Badge>
                  {currentTenant.subscription_plan && (
                    <Badge variant="secondary" className="capitalize font-semibold px-4 py-2 text-sm bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20">
                      {currentTenant.subscription_plan.replace('_', ' ')} Plan
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-sm px-4 py-2 bg-gradient-to-r from-success/10 to-success/5 text-success border-success/30">
                    <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></div>
                    Active
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed ml-18">
              Monitor your agricultural network and drive growth with intelligent insights
            </p>
          </div>
          
          {/* Enhanced Live Status Card */}
          <Card className="xl:w-auto w-full border-0 shadow-medium bg-gradient-to-br from-card/95 to-background/80 backdrop-blur-sm hover:shadow-strong transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-success animate-ping opacity-75"></div>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-foreground">Live Updates</span>
                    <p className="text-xs text-muted-foreground">Real-time sync active</p>
                  </div>
                </div>
                <div className="text-right">
                  <LiveIndicator isConnected={isLive} activeChannels={activeChannels} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeChannels} channels
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Dashboard Grid with Modern Styling */}
        <div className="relative">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 rounded-3xl -z-10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.1),transparent)] rounded-3xl -z-10"></div>
          
          {/* Dashboard Content with Enhanced Padding */}
          <div className="relative bg-gradient-to-br from-card/40 via-card/20 to-transparent rounded-3xl border border-border/40 backdrop-blur-sm p-8">
            <CustomizableDashboard tenantId={currentTenant.id} />
          </div>
        </div>

        {/* Enhanced Footer Section */}
        <div className="flex items-center justify-center pt-8">
          <Card className="border-0 shadow-soft bg-gradient-to-r from-muted/30 via-background/50 to-muted/20 backdrop-blur-sm">
            <CardContent className="px-8 py-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="font-medium">KisanShakti AI Platform</span>
                </div>
                <div className="h-4 w-px bg-border"></div>
                <span>Empowering Agricultural Innovation</span>
                <div className="h-4 w-px bg-border"></div>
                <span className="font-semibold">© 2025</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
