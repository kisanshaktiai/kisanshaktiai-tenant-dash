
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface SubscriptionPlanCardProps {
  planType: 'kisan' | 'shakti' | 'ai';
  isCurrentPlan?: boolean;
  onSelect?: () => void;
}

const PLAN_DETAILS = {
  kisan: {
    name: 'Kisan (Basic)',
    description: 'Essential farming tools for small farmers',
    price: 99,
    features: [
      'AI Chat (100 queries/month)',
      'Real-time weather forecast + 7-day prediction',
      'Soil reports (2 per month)',
      'Basic AI crop schedule recommendations',
      'Community forum (read-only access)',
      'MyLand: Add up to 3 land plots',
      'SMS/WhatsApp notifications',
      'Multi-language support (11 languages)'
    ],
    popular: false
  },
  shakti: {
    name: 'Shakti (Growth)',
    description: 'Complete farming solution for growing operations',
    price: 199,
    features: [
      'AI Chat (500 queries/month)',
      'Satellite NDVI analysis (weekly updates)',
      'Advanced weather alerts',
      'Marketplace access (buy/sell)',
      'Community forum (full access)',
      'Unlimited soil reports',
      'Voice commands in regional languages',
      'MyLand: Add up to 10 land plots',
      'Crop disease prediction and alerts',
      'Market price tracking'
    ],
    popular: true
  },
  ai: {
    name: 'AI (Premium)',
    description: 'Enterprise-grade farming intelligence',
    price: 299,
    features: [
      'Unlimited AI Chat with advanced models',
      'Daily satellite imagery analysis',
      'IoT sensor integration',
      'Custom PDF reports and analytics',
      'Priority support (phone + video)',
      'Advanced predictive analytics',
      'API access for integrations',
      'MyLand: Unlimited land plots',
      'Drone imagery integration',
      'Custom AI model training',
      'Financial analytics and optimization',
      'Insurance claim assistance'
    ],
    popular: false
  }
};

export default function SubscriptionPlanCard({ planType, isCurrentPlan, onSelect }: SubscriptionPlanCardProps) {
  const plan = PLAN_DETAILS[planType];

  return (
    <Card className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge variant="default" className="px-3 py-1">
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          {isCurrentPlan && (
            <Badge variant="outline">Current Plan</Badge>
          )}
        </div>
        <CardDescription>{plan.description}</CardDescription>
        
        <div className="flex items-baseline gap-1 pt-2">
          <span className="text-3xl font-bold">₹{plan.price}</span>
          <span className="text-sm text-muted-foreground">/month</span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <div>Quarterly: ₹{Math.round(plan.price * 3 * 0.9)} (10% off)</div>
          <div>Annually: ₹{Math.round(plan.price * 12 * 0.8)} (20% off)</div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          className="w-full" 
          variant={isCurrentPlan ? "outline" : "default"}
          onClick={onSelect}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
        </Button>
      </CardContent>
    </Card>
  );
}
