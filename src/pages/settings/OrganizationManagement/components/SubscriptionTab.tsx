import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useOrganizationSubscription } from '@/hooks/organization/useOrganizationSubscription';
import { useOrganizationMetrics } from '@/hooks/organization/useOrganizationMetrics';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, Users, Store, Package, TrendingUp, Check } from 'lucide-react';

const SubscriptionTab = () => {
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

  const planFeatures = [
    { name: 'Farmer Management', included: true },
    { name: 'Dealer Management', included: true },
    { name: 'Product Catalog', included: true },
    { name: 'Basic Analytics', included: true },
    { name: 'SMS Notifications', included: true },
    { name: 'Advanced Analytics', included: false },
    { name: 'WhatsApp Integration', included: false },
    { name: 'API Access', included: false },
  ];

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
      <Card>
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <Label className="font-medium">Farmers</Label>
              </div>
              <span className="text-sm text-muted-foreground">
                {metrics?.total_farmers || 0} / {subscription?.max_farmers || '∞'}
              </span>
            </div>
            <Progress value={farmerUsage} className="h-2" />
            {farmerUsage > 80 && (
              <p className="text-xs text-orange-500">
                You're approaching your farmer limit. Consider upgrading your plan.
              </p>
            )}
          </div>

          {/* Dealers Usage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-green-500" />
                <Label className="font-medium">Dealers</Label>
              </div>
              <span className="text-sm text-muted-foreground">
                {metrics?.total_dealers || 0} / {subscription?.max_dealers || '∞'}
              </span>
            </div>
            <Progress value={dealerUsage} className="h-2" />
          </div>

          {/* Products (Unlimited in all plans) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-purple-500" />
                <Label className="font-medium">Products</Label>
              </div>
              <span className="text-sm text-muted-foreground">
                {metrics?.total_products || 0} / ∞
              </span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
          <CardDescription>
            Features included in your current plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {planFeatures.map((feature) => (
              <div
                key={feature.name}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  feature.included
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-muted bg-muted/50'
                }`}
              >
                <div
                  className={`p-1 rounded-full ${
                    feature.included
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted-foreground/20'
                  }`}
                >
                  <Check className="h-3 w-3" />
                </div>
                <span
                  className={`text-sm ${
                    !feature.included && 'text-muted-foreground'
                  }`}
                >
                  {feature.name}
                </span>
                {!feature.included && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    Upgrade
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
