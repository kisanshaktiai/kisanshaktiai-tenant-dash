import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useOrganizationSubscription } from '@/hooks/organization/useOrganizationSubscription';
import { useOrganizationMetrics } from '@/hooks/organization/useOrganizationMetrics';
import { TenantSubscriptionTab } from './TenantSubscriptionTab';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, Users, Store, Package, TrendingUp } from 'lucide-react';
import PlanComparisonTable from './PlanComparisonTable';

const SubscriptionTab = () => {
  return <TenantSubscriptionTab />;
};

const SubscriptionTabOld = () => {
  const { subscription, isLoading: subLoading } = useOrganizationSubscription();
  const { metrics, isLoading: metricsLoading } = useOrganizationMetrics();

  if (subLoading || metricsLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  const farmerUsage = subscription?.max_farmers
    ? ((metrics?.total_farmers || 0) / subscription.max_farmers) * 100
    : 0;

  const dealerUsage = subscription?.max_dealers
    ? ((metrics?.total_dealers || 0) / subscription.max_dealers) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {subscription?.plan?.name || 'Free Plan'}
              </CardTitle>
              <CardDescription>
                Your current subscription plan
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              ${subscription?.plan?.price || 0}/month
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Billing Cycle: {subscription?.plan?.billing_cycle || 'Monthly'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={subscription?.status === 'active' ? 'default' : 'secondary'}
              >
                {subscription?.status || 'Active'}
              </Badge>
            </div>
          </div>
          {subscription?.current_period_end && (
            <p className="text-sm text-muted-foreground">
              Next billing date:{' '}
              {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Usage Meters */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Usage & Limits
          </CardTitle>
          <CardDescription>
            Track your resource usage against plan limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Farmers Usage */}
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <Label className="font-medium">Farmers</Label>
              </div>
              <span className="text-sm font-medium">
                {metrics?.total_farmers || 0} / {subscription?.max_farmers || '∞'}
              </span>
            </div>
            <div className="relative">
              <Progress value={farmerUsage} className="h-3" />
              {farmerUsage > 0 && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium">
                  {Math.round(farmerUsage)}%
                </span>
              )}
            </div>
            {farmerUsage > 80 && (
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 animate-pulse">
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  ⚠️ You're approaching your farmer limit. Consider upgrading your plan.
                </p>
              </div>
            )}
          </div>

          {/* Dealers Usage */}
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Store className="h-4 w-4 text-green-500" />
                </div>
                <Label className="font-medium">Dealers</Label>
              </div>
              <span className="text-sm font-medium">
                {metrics?.total_dealers || 0} / {subscription?.max_dealers || '∞'}
              </span>
            </div>
            <div className="relative">
              <Progress value={dealerUsage} className="h-3" />
              {dealerUsage > 0 && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium">
                  {Math.round(dealerUsage)}%
                </span>
              )}
            </div>
          </div>

          {/* Products (Unlimited in all plans) */}
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Package className="h-4 w-4 text-purple-500" />
                </div>
                <Label className="font-medium">Products</Label>
              </div>
              <span className="text-sm font-medium">
                {metrics?.total_products || 0} / ∞
              </span>
            </div>
            <Progress value={5} className="h-3" />
            <p className="text-xs text-muted-foreground">
              ✓ Unlimited products in all plans
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <PlanComparisonTable />

      {/* Upgrade CTA */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-background">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Need more features?</h3>
              <p className="text-sm text-muted-foreground">
                Upgrade to unlock advanced analytics, API access, and more
              </p>
            </div>
            <Button size="lg">
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={className}>{children}</span>
);

export default SubscriptionTab;
