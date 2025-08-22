
import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Calendar, TrendingUp, Users } from 'lucide-react';
import SubscriptionPlanCard from '@/components/subscription/SubscriptionPlanCard';
import { mapPlanToUI, isKisanPlan, isShaktiPlan, isAIPlan } from '@/utils/subscriptionPlanMapper';

export default function SubscriptionPage() {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');

  // Convert database plan to UI plan for display
  const currentUIPlan = currentTenant ? mapPlanToUI(currentTenant.subscription_plan) : null;

  const handlePlanSelect = (planType: 'kisan' | 'shakti' | 'ai') => {
    console.log('Selected plan:', planType);
    // TODO: Implement plan selection logic
  };

  const getPlanDisplayName = (dbPlan: string) => {
    if (isKisanPlan(dbPlan)) return 'Kisan (Basic)';
    if (isShaktiPlan(dbPlan)) return 'Shakti (Growth)';
    if (isAIPlan(dbPlan)) return 'AI (Premium)';
    return dbPlan;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
          <p className="text-muted-foreground">
            Manage your farming intelligence subscription and billing
          </p>
          {currentTenant && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                Current Plan: {getPlanDisplayName(currentTenant.subscription_plan)}
              </Badge>
              <Badge variant={currentTenant.status === 'active' ? 'default' : 'destructive'}>
                {currentTenant.status}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Current Subscription Overview */}
      {currentTenant && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Subscription
            </CardTitle>
            <CardDescription>
              Your current plan details and usage information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Plan</div>
                <div className="text-lg font-semibold">
                  {getPlanDisplayName(currentTenant.subscription_plan)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <Badge variant={currentTenant.status === 'active' ? 'default' : 'destructive'}>
                  {currentTenant.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Next Billing</div>
                <div className="text-lg font-semibold">Jan 15, 2024</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Interval Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Interval</CardTitle>
          <CardDescription>
            Choose your preferred billing frequency for better savings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={billingInterval} onValueChange={(value) => setBillingInterval(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">
                Quarterly
                <Badge variant="secondary" className="ml-2">10% off</Badge>
              </TabsTrigger>
              <TabsTrigger value="annually">
                Annually
                <Badge variant="default" className="ml-2">20% off</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Choose Your Plan</h2>
          <p className="text-muted-foreground">
            Select the plan that best fits your farming needs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SubscriptionPlanCard
            planType="kisan"
            isCurrentPlan={currentUIPlan === 'kisan'}
            onSelect={() => handlePlanSelect('kisan')}
          />
          <SubscriptionPlanCard
            planType="shakti"
            isCurrentPlan={currentUIPlan === 'shakti'}
            onSelect={() => handlePlanSelect('shakti')}
          />
          <SubscriptionPlanCard
            planType="ai"
            isCurrentPlan={currentUIPlan === 'ai'}
            onSelect={() => handlePlanSelect('ai')}
          />
        </div>
      </div>

      {/* Usage Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage Analytics
          </CardTitle>
          <CardDescription>
            Track your usage against plan limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">AI Queries</div>
              <div className="text-2xl font-bold">247</div>
              <div className="text-xs text-muted-foreground">
                {isKisanPlan(currentTenant?.subscription_plan || '') ? 'of 100/month' : 
                 isShaktiPlan(currentTenant?.subscription_plan || '') ? 'of 500/month' : 'Unlimited'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Land Plots</div>
              <div className="text-2xl font-bold">2</div>
              <div className="text-xs text-muted-foreground">
                {isKisanPlan(currentTenant?.subscription_plan || '') ? 'of 3 max' : 
                 isShaktiPlan(currentTenant?.subscription_plan || '') ? 'of 10 max' : 'Unlimited'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Soil Reports</div>
              <div className="text-2xl font-bold">1</div>
              <div className="text-xs text-muted-foreground">
                {isKisanPlan(currentTenant?.subscription_plan || '') ? 'of 2/month' : 'Unlimited'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Storage Used</div>
              <div className="text-2xl font-bold">0.3 GB</div>
              <div className="text-xs text-muted-foreground">
                {isKisanPlan(currentTenant?.subscription_plan || '') ? 'of 1 GB' : 
                 isShaktiPlan(currentTenant?.subscription_plan || '') ? 'of 5 GB' : 'of 25 GB'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
