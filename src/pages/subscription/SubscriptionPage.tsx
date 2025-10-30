import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Check, 
  Zap, 
  Users, 
  Package,
  MessageSquare,
  Cloud,
  BarChart3,
  MapPin,
  Wifi,
  Database,
  Shield,
  CreditCard,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

// Farmer subscription plans with agricultural features
const farmerPlans = {
  kisan: {
    name: 'Kisan (Basic)',
    price: '₹99',
    period: '/month',
    yearlyPrice: '₹950',
    quarterlyPrice: '₹267',
    description: 'Essential farming tools for small-scale farmers',
    features: [
      { text: 'AI Chat Assistant (100 queries/month)', icon: MessageSquare },
      { text: 'Real-time weather forecast', icon: Cloud },
      { text: 'Soil health reports (2 per month)', icon: BarChart3 },
      { text: 'Basic AI crop recommendations', icon: Zap },
      { text: 'Up to 3 land plots', icon: MapPin },
      { text: 'Mobile app access', icon: Package },
      { text: 'Community forum access', icon: Users }
    ],
    color: 'from-green-500 to-green-600',
    popular: false,
    limitations: [
      'Limited satellite imagery',
      'Basic market prices only',
      'Email support only'
    ]
  },
  shakti: {
    name: 'Shakti (Growth)',
    price: '₹199',
    period: '/month',
    yearlyPrice: '₹1,910',
    quarterlyPrice: '₹537',
    description: 'Complete farming solution for progressive farmers',
    features: [
      { text: 'AI Chat Assistant (500 queries/month)', icon: MessageSquare },
      { text: 'Satellite NDVI analysis', icon: Database },
      { text: 'Marketplace access', icon: Package },
      { text: 'Unlimited soil reports', icon: BarChart3 },
      { text: 'Up to 10 land plots', icon: MapPin },
      { text: 'Disease identification AI', icon: Shield },
      { text: 'Yield prediction models', icon: TrendingUp },
      { text: 'SMS alerts', icon: Wifi },
      { text: 'Priority support', icon: Users }
    ],
    color: 'from-blue-500 to-blue-600',
    popular: true,
    limitations: [
      'Weekly satellite updates',
      'Regional market access'
    ]
  },
  ai: {
    name: 'AI (Premium)',
    price: '₹299',
    period: '/month',
    yearlyPrice: '₹2,870',
    quarterlyPrice: '₹807',
    description: 'Enterprise-grade AI farming intelligence',
    features: [
      { text: 'Unlimited AI Chat Assistant', icon: MessageSquare },
      { text: 'Daily satellite imagery', icon: Database },
      { text: 'IoT sensor integration', icon: Wifi },
      { text: 'API access for custom apps', icon: Shield },
      { text: 'Unlimited land plots', icon: MapPin },
      { text: 'Advanced weather modeling', icon: Cloud },
      { text: 'Personalized farming calendar', icon: Calendar },
      { text: 'Expert consultation (2 hrs/month)', icon: Users },
      { text: 'White-label mobile app', icon: Package },
      { text: '24/7 dedicated support', icon: Zap }
    ],
    color: 'from-purple-500 to-purple-600',
    popular: false,
    limitations: []
  }
};

export default function SubscriptionPage() {
  const { currentTenant } = useAppSelector(state => state.tenant);
  const [billingPeriod, setBillingPeriod] = React.useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const currentPlan = 'shakti'; // This would come from tenant data

  const getPrice = (plan: any) => {
    switch(billingPeriod) {
      case 'yearly':
        return { price: plan.yearlyPrice, period: '/year', discount: '20% off' };
      case 'quarterly':
        return { price: plan.quarterlyPrice, period: '/quarter', discount: '10% off' };
      default:
        return { price: plan.price, period: plan.period, discount: null };
    }
  };

  const calculateSavings = (monthly: string, current: string) => {
    const monthlyNum = parseInt(monthly.replace('₹', '').replace(',', ''));
    const currentNum = parseInt(current.replace('₹', '').replace(',', ''));
    const periods = billingPeriod === 'yearly' ? 12 : billingPeriod === 'quarterly' ? 3 : 1;
    return (monthlyNum * periods) - currentNum;
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          Farmer Subscription Plans
        </h1>
        <p className="text-muted-foreground text-base lg:text-lg max-w-3xl mx-auto">
          Choose the perfect plan to empower farmers with AI-driven insights, real-time data, and expert recommendations
        </p>
      </div>

      {/* Billing Period Toggle */}
      <div className="flex justify-center">
        <Tabs value={billingPeriod} onValueChange={(v: any) => setBillingPeriod(v)}>
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="quarterly">
              Quarterly
              <Badge className="ml-2" variant="secondary">Save 10%</Badge>
            </TabsTrigger>
            <TabsTrigger value="yearly">
              Yearly
              <Badge className="ml-2" variant="secondary">Save 20%</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-3 max-w-7xl mx-auto">
        {Object.entries(farmerPlans).map(([key, plan]) => {
          const pricing = getPrice(plan);
          const isCurrent = key === currentPlan;
          const savings = billingPeriod !== 'monthly' ? calculateSavings(plan.price, pricing.price) : 0;
          
          return (
            <Card 
              key={key} 
              className={`relative overflow-hidden ${
                isCurrent 
                  ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/50 transition-all hover:shadow-lg'
              }`}
            >
              {/* Gradient Header */}
              <div className={`h-2 bg-gradient-to-r ${plan.color}`} />
              
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                
                <div className="flex flex-col items-center gap-1 mt-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">{pricing.price}</span>
                    <span className="text-muted-foreground">{pricing.period}</span>
                  </div>
                  {pricing.discount && (
                    <Badge variant="secondary" className="mt-1">
                      {pricing.discount} - Save ₹{savings}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Included Features:</h4>
                  <ul className="space-y-2">
                    {plan.features.slice(0, 6).map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <li key={index} className="flex items-start gap-3">
                          <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-sm">{feature.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                  {plan.features.length > 6 && (
                    <p className="text-sm text-muted-foreground">
                      +{plan.features.length - 6} more features
                    </p>
                  )}
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="font-semibold text-xs text-muted-foreground">Limitations:</h4>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="text-xs text-muted-foreground">
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <Button 
                  className="w-full" 
                  variant={isCurrent ? "default" : "outline"}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current Subscription Details */}
      <div className="grid gap-6 lg:grid-cols-2 max-w-5xl mx-auto">
        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Current Usage</CardTitle>
            <CardDescription>Your plan usage for this billing period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>AI Chat Queries</span>
                <span className="font-medium">423 / 500</span>
              </div>
              <Progress value={84.6} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Land Plots</span>
                <span className="font-medium">7 / 10</span>
              </div>
              <Progress value={70} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Soil Reports</span>
                <span className="font-medium">12 / Unlimited</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage Used</span>
                <span className="font-medium">3.2 GB / 10 GB</span>
              </div>
              <Progress value={32} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>Manage your subscription and payment details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span>Current Plan</span>
                <Badge variant="secondary">Shakti (Growth)</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>Billing Cycle</span>
                <span className="text-sm">Monthly</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>Next Billing Date</span>
                <span className="text-sm">January 15, 2025</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>Payment Method</span>
                <span className="text-sm">UPI •••• 1234</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>Auto-Renewal</span>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">Total Amount</span>
                <span className="font-medium">₹199.00/month</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1">
                <CreditCard className="h-4 w-4 mr-2" />
                Update Payment
              </Button>
              <Button variant="outline" className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                View History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Comparison */}
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>Compare All Features</CardTitle>
          <CardDescription>Detailed comparison of all subscription plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Feature</th>
                  <th className="text-center py-2 px-4">Kisan</th>
                  <th className="text-center py-2 px-4">Shakti</th>
                  <th className="text-center py-2 px-4">AI Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4">AI Chat Queries</td>
                  <td className="text-center py-2 px-4">100/month</td>
                  <td className="text-center py-2 px-4">500/month</td>
                  <td className="text-center py-2 px-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">Land Plots</td>
                  <td className="text-center py-2 px-4">3</td>
                  <td className="text-center py-2 px-4">10</td>
                  <td className="text-center py-2 px-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">Satellite Imagery</td>
                  <td className="text-center py-2 px-4">
                    <span className="text-muted-foreground">-</span>
                  </td>
                  <td className="text-center py-2 px-4">Weekly</td>
                  <td className="text-center py-2 px-4">Daily</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">IoT Integration</td>
                  <td className="text-center py-2 px-4">
                    <span className="text-muted-foreground">-</span>
                  </td>
                  <td className="text-center py-2 px-4">
                    <span className="text-muted-foreground">-</span>
                  </td>
                  <td className="text-center py-2 px-4">
                    <Check className="h-4 w-4 mx-auto text-primary" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">API Access</td>
                  <td className="text-center py-2 px-4">
                    <span className="text-muted-foreground">-</span>
                  </td>
                  <td className="text-center py-2 px-4">
                    <span className="text-muted-foreground">-</span>
                  </td>
                  <td className="text-center py-2 px-4">
                    <Check className="h-4 w-4 mx-auto text-primary" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">Support</td>
                  <td className="text-center py-2 px-4">Email</td>
                  <td className="text-center py-2 px-4">Priority</td>
                  <td className="text-center py-2 px-4">24/7 Dedicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}