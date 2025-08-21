
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Check } from 'lucide-react';
import { OnboardingStep } from '@/services/OnboardingService';
import { useTranslation } from '@/hooks/useTranslation';

interface SubscriptionPlanStepProps {
  step: OnboardingStep;
  onComplete: (stepData?: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
}

export const SubscriptionPlanStep: React.FC<SubscriptionPlanStepProps> = ({
  step,
  onComplete,
  isLoading
}) => {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState(step.step_data?.selectedPlan || 'Shakti_Growth');

  const plans = [
    {
      id: 'Kisan_Basic',
      name: t('subscription.kisanBasic'),
      price: '₹2,999',
      period: 'per month',
      description: t('subscription.kisanDesc'),
      features: [
        t('subscription.farmers', { count: 1000 }),
        t('subscription.basicAnalytics'),
        t('features.smsNotifications'),
        t('features.mobileApp'),
        'Email support'
      ]
    },
    {
      id: 'Shakti_Growth',
      name: t('subscription.shaktiGrowth'),
      price: '₹9,999',
      period: 'per month',
      description: t('subscription.shaktiDesc'),
      features: [
        t('subscription.farmers', { count: 5000 }),
        t('subscription.advancedAnalytics'),
        t('features.whatsappIntegration'),
        t('features.weatherForecast'),
        'Priority support',
        'Custom branding'
      ],
      popular: true
    },
    {
      id: 'AI_Enterprise',
      name: t('subscription.aiEnterprise'),
      price: '₹24,999',
      period: 'per month',
      description: t('subscription.aiDesc'),
      features: [
        t('subscription.unlimitedFarmers'),
        t('subscription.aiInsights'),
        t('features.satelliteImagery'),
        'API access',
        'Dedicated support',
        'White-label solution'
      ]
    }
  ];

  const handleContinue = () => {
    onComplete({ selectedPlan, planName: plans.find(p => p.id === selectedPlan)?.name });
  };

  if (step.step_status === 'completed') {
    const selectedPlanData = plans.find(p => p.id === step.step_data?.selectedPlan);
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('subscription.planSelected')}</h3>
        <p className="text-muted-foreground">
          {t('subscription.selectedPlan', { planName: selectedPlanData?.name })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">{t('subscription.choosePlan')}</h3>
        <p className="text-muted-foreground">
          {t('subscription.planDescription')}
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
                {t('subscription.mostPopular')}
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
        {t('subscription.freeTrialNote')}
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleContinue} 
          disabled={!selectedPlan || isLoading}
          className="min-w-32"
        >
          {isLoading ? t('subscription.processing') : t('subscription.continueWithPlan')}
        </Button>
      </div>
    </div>
  );
};
