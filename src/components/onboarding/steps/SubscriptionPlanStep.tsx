
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Check } from 'lucide-react';
import { OnboardingStep } from '@/services/OnboardingService';

interface SubscriptionPlanStepProps {
  step: OnboardingStep;
  onComplete: (stepData?: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
}

const plans = [
  {
    id: 'kisan',
    name: 'Kisan Basic',
    price: '₹2,999',
    period: 'per month',
    description: 'Perfect for small agricultural businesses',
    features: [
      'Up to 1,000 farmers',
      'Basic analytics',
      'SMS notifications',
      'Mobile app access',
      'Email support'
    ]
  },
  {
    id: 'shakti',
    name: 'Shakti Growth',
    price: '₹9,999',
    period: 'per month',
    description: 'For growing agricultural organizations',
    features: [
      'Up to 5,000 farmers',
      'Advanced analytics',
      'WhatsApp integration',
      'Weather forecasting',
      'Priority support',
      'Custom branding'
    ],
    popular: true
  },
  {
    id: 'ai',
    name: 'AI Enterprise',
    price: '₹24,999',
    period: 'per month',
    description: 'Full-featured solution with AI capabilities',
    features: [
      'Unlimited farmers',
      'AI-powered insights',
      'Satellite imagery',
      'API access',
      'Dedicated support',
      'White-label solution'
    ]
  }
];

export const SubscriptionPlanStep: React.FC<SubscriptionPlanStepProps> = ({
  step,
  onComplete,
  isLoading
}) => {
  const [selectedPlan, setSelectedPlan] = useState(step.step_data?.selectedPlan || 'shakti');

  const handleContinue = () => {
    onComplete({ selectedPlan, planName: plans.find(p => p.id === selectedPlan)?.name });
  };

  if (step.step_status === 'completed') {
    const selectedPlanData = plans.find(p => p.id === step.step_data?.selectedPlan);
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Plan Selected</h3>
        <p className="text-muted-foreground">
          You've selected the <strong>{selectedPlanData?.name}</strong> plan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Choose Your Plan</h3>
        <p className="text-muted-foreground">
          Select the plan that best fits your organization's needs. You can upgrade anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative cursor-pointer transition-all ${
              selectedPlan === plan.id 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                {selectedPlan === plan.id && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </CardTitle>
              <div className="text-2xl font-bold text-primary">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /{plan.period}
                </span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        All plans include a 14-day free trial. No credit card required.
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleContinue} 
          disabled={!selectedPlan || isLoading}
          className="min-w-32"
        >
          {isLoading ? 'Processing...' : 'Continue with Plan'}
        </Button>
      </div>
    </div>
  );
};
