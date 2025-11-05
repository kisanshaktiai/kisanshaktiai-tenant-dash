import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrganizationSubscription } from '@/hooks/organization/useOrganizationSubscription';
import { useOrganizationAnalytics } from '@/hooks/organization/useOrganizationAnalytics';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { DummyPaymentGateway } from '@/components/subscription/DummyPaymentGateway';
import { PaymentService } from '@/services/PaymentService';
import { SubscriptionService } from '@/services/SubscriptionService';
import { CheckCircle, Crown, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export const TenantSubscriptionTab = () => {
  const { getTenantId, currentTenant } = useTenantIsolation();
  const { user } = useAuth();
  const { subscription, isLoading: subLoading, error: subError } = useOrganizationSubscription();
  const { analytics, isLoading: analyticsLoading, error: analyticsError } = useOrganizationAnalytics();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  // Show error if no tenant
  if (!currentTenant) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No organization found. Please select an organization.</p>
        </CardContent>
      </Card>
    );
  }

  // Show errors
  if (subError || analyticsError) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-destructive">Error loading subscription data: {(subError || analyticsError)?.message}</p>
        </CardContent>
      </Card>
    );
  }

  const tenantPlans = [
    {
      id: 'starter',
      name: 'Starter Plan',
      price: 2999,
      interval: 'monthly',
      description: 'Perfect for small teams getting started',
      features: [
        'Up to 1,000 farmers',
        'Up to 50 dealers',
        'Basic analytics',
        'Email support',
        '10 GB storage',
      ],
      limits: {
        max_farmers: 1000,
        max_dealers: 50,
        max_storage_gb: 10,
      },
    },
    {
      id: 'growth',
      name: 'Growth Plan',
      price: 9999,
      interval: 'monthly',
      description: 'Scale your operations',
      features: [
        'Up to 5,000 farmers',
        'Up to 200 dealers',
        'Advanced analytics',
        'Priority support',
        '50 GB storage',
        'Custom branding',
      ],
      limits: {
        max_farmers: 5000,
        max_dealers: 200,
        max_storage_gb: 50,
      },
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 24999,
      interval: 'monthly',
      description: 'For large-scale operations',
      features: [
        'Unlimited farmers',
        'Unlimited dealers',
        'AI-powered insights',
        'Dedicated support',
        '200 GB storage',
        'White-label solution',
        'API access',
      ],
      limits: {
        max_farmers: null,
        max_dealers: null,
        max_storage_gb: 200,
      },
    },
  ];

  const handleUpgradePlan = async (plan: any) => {
    if (!user) {
      toast.error('Please login to continue');
      return;
    }

    setUpgrading(true);
    setSelectedPlan(plan);

    try {
      // Create payment intent
      const intent = await PaymentService.createPaymentIntent({
        tenantId: getTenantId(),
        userId: user.id,
        subscriptionType: 'tenant',
        planId: plan.id,
        amount: plan.price,
        billingInterval: 'monthly',
      });

      setPaymentIntent(intent);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast.error('Failed to initiate payment');
    } finally {
      setUpgrading(false);
    }
  };

  const handlePaymentSuccess = async (result: any) => {
    try {
      // Create or upgrade subscription
      if (subscription) {
        await SubscriptionService.upgradeTenantPlan({
          subscriptionId: subscription.id,
          newPlanId: selectedPlan.id,
        });
      } else {
        await SubscriptionService.createTenantSubscription({
          tenantId: getTenantId(),
          planId: selectedPlan.id,
          billingInterval: 'monthly',
        });
      }

      // Generate invoice
      await PaymentService.generateInvoice({
        tenantId: getTenantId(),
        subscriptionId: subscription?.id || '',
        amount: selectedPlan.price,
        currency: 'INR',
        description: `Subscription to ${selectedPlan.name}`,
      });

      toast.success('Subscription updated successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (subLoading || analyticsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const currentPlanId = subscription?.plan?.id;

  return (
    <div className="space-y-8">
      {/* Current Subscription */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Current Subscription
            </CardTitle>
            <CardDescription>Your active subscription details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{subscription.plan?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(subscription.plan?.price || 0)}/month
                </p>
              </div>
              <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                {subscription.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Period</p>
                  <p className="font-medium">
                    {new Date(subscription.current_period_start).toLocaleDateString()} - {' '}
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Billing</p>
                  <p className="font-medium capitalize">{subscription.billing_interval}</p>
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            {analytics && (
              <div className="pt-4 border-t space-y-3">
                <h4 className="font-semibold text-sm">Usage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Farmers</span>
                    <span className="font-medium">
                      {analytics.total_farmers} / {subscription.max_farmers || '∞'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Dealers</span>
                    <span className="font-medium">
                      {analytics.total_dealers} / {subscription.max_dealers || '∞'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Storage</span>
                    <span className="font-medium">
                      {(analytics.storage_used_mb / 1024).toFixed(1)} GB / {subscription.max_storage_gb || '∞'} GB
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {subscription ? 'Upgrade Your Plan' : 'Choose a Plan'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tenantPlans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;

            return (
              <Card
                key={plan.id}
                className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''} ${
                  isCurrent ? 'ring-2 ring-primary' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}

                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {formatCurrency(plan.price)}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={isCurrent ? 'outline' : 'default'}
                    disabled={isCurrent || upgrading}
                    onClick={() => handleUpgradePlan(plan)}
                  >
                    {isCurrent ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Current Plan
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        {subscription ? 'Upgrade' : 'Get Started'}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && paymentIntent && selectedPlan && (
        <DummyPaymentGateway
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          intentId={paymentIntent.id}
          amount={selectedPlan.price}
          currency="INR"
          planName={selectedPlan.name}
          onSuccess={handlePaymentSuccess}
          onFailure={(error) => {
            toast.error(error);
            setShowPaymentModal(false);
          }}
        />
      )}
    </div>
  );
};
