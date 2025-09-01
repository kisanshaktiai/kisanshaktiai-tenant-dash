
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Check, Zap, Users, Package } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for small agricultural businesses',
    features: [
      'Up to 100 farmers',
      'Basic analytics',
      'Email support',
      'Mobile app access',
      '1 admin user'
    ],
    icon: Users,
    current: false
  },
  {
    name: 'Professional',
    price: '$99',
    period: '/month',
    description: 'Ideal for growing agricultural enterprises',
    features: [
      'Up to 1,000 farmers',
      'Advanced analytics',
      'Priority support',
      'API access',
      '5 admin users',
      'Custom branding'
    ],
    icon: Zap,
    current: true,
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$299',
    period: '/month',
    description: 'For large-scale agricultural operations',
    features: [
      'Unlimited farmers',
      'Custom analytics',
      '24/7 phone support',
      'Full API access',
      'Unlimited users',
      'White-label solution',
      'Dedicated account manager'
    ],
    icon: Crown,
    current: false
  }
];

export default function SubscriptionPage() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground text-base lg:text-lg max-w-2xl mx-auto">
          Select the perfect plan for your agricultural business needs. Upgrade or downgrade at any time.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-3 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const IconComponent = plan.icon;
          
          return (
            <Card key={plan.name} className={`relative ${
              plan.current 
                ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                : 'border-border hover:border-primary/50 transition-colors'
            }`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    plan.current ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                </div>
                
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
                
                <div className="flex items-baseline justify-center gap-1 mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={plan.current ? "default" : "outline"}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : 'Upgrade to ' + plan.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Billing Information */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span>Current Plan</span>
              <Badge variant="secondary">Professional</Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span>Next Billing Date</span>
              <span className="text-sm text-muted-foreground">January 15, 2025</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span>Payment Method</span>
              <span className="text-sm text-muted-foreground">**** **** **** 1234</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Total</span>
              <span className="font-medium">$99.00/month</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
