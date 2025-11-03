import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Zap } from 'lucide-react';

const PlanComparisonTable = () => {
  const plans = [
    {
      name: 'Free',
      price: 0,
      period: 'month',
      description: 'Perfect for getting started',
      badge: null,
      features: {
        farmers: '100',
        dealers: '10',
        products: 'Unlimited',
        storage: '1 GB',
        analytics: 'Basic',
        sms: false,
        whatsapp: false,
        api: false,
        support: 'Community',
      },
    },
    {
      name: 'Professional',
      price: 49,
      period: 'month',
      description: 'For growing organizations',
      badge: 'Most Popular',
      features: {
        farmers: '1,000',
        dealers: '100',
        products: 'Unlimited',
        storage: '10 GB',
        analytics: 'Advanced',
        sms: true,
        whatsapp: true,
        api: false,
        support: 'Email & Chat',
      },
    },
    {
      name: 'Enterprise',
      price: 199,
      period: 'month',
      description: 'For large-scale operations',
      badge: 'Best Value',
      features: {
        farmers: 'Unlimited',
        dealers: 'Unlimited',
        products: 'Unlimited',
        storage: '100 GB',
        analytics: 'Advanced + AI',
        sms: true,
        whatsapp: true,
        api: true,
        support: 'Priority 24/7',
      },
    },
  ];

  const featureRows = [
    { key: 'farmers', label: 'Farmers' },
    { key: 'dealers', label: 'Dealers' },
    { key: 'products', label: 'Products' },
    { key: 'storage', label: 'Storage' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'sms', label: 'SMS Notifications' },
    { key: 'whatsapp', label: 'WhatsApp Integration' },
    { key: 'api', label: 'API Access' },
    { key: 'support', label: 'Support' },
  ];

  const renderFeatureValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-green-500 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-muted-foreground mx-auto" />
      );
    }
    return <span className="text-sm">{value}</span>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Compare Plans
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="lg:hidden space-y-4">
          {plans.map((plan) => (
            <Card key={plan.name} className="relative overflow-hidden">
              {plan.badge && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <div className="space-y-2">
                  {featureRows.map((feature) => (
                    <div key={feature.key} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{feature.label}</span>
                      {renderFeatureValue(plan.features[feature.key as keyof typeof plan.features])}
                    </div>
                  ))}
                </div>
                <Button className="w-full">
                  {plan.name === 'Free' ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-4 px-4"></th>
                {plans.map((plan) => (
                  <th key={plan.name} className="py-4 px-4">
                    <div className="space-y-2">
                      {plan.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {plan.badge}
                        </Badge>
                      )}
                      <div>
                        <p className="font-bold text-lg">{plan.name}</p>
                        <p className="text-xs text-muted-foreground font-normal">
                          {plan.description}
                        </p>
                      </div>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-sm text-muted-foreground">/{plan.period}</span>
                      </div>
                      <Button className="w-full" size="sm">
                        {plan.name === 'Free' ? 'Current Plan' : 'Upgrade'}
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureRows.map((feature, index) => (
                <tr
                  key={feature.key}
                  className={index % 2 === 0 ? 'bg-muted/50' : ''}
                >
                  <td className="py-3 px-4 font-medium text-sm">{feature.label}</td>
                  {plans.map((plan) => (
                    <td key={plan.name} className="py-3 px-4 text-center">
                      {renderFeatureValue(plan.features[feature.key as keyof typeof plan.features])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Custom Plan CTA */}
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Need a custom plan?</h4>
              <p className="text-sm text-muted-foreground">
                Contact us for tailored solutions for your organization
              </p>
            </div>
            <Button variant="outline">Contact Sales</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanComparisonTable;
