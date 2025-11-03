import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useOrganizationFeatures } from '@/hooks/organization/useOrganizationFeatures';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Package, 
  Store, 
  MessageSquare, 
  Phone, 
  Cloud, 
  Satellite, 
  Cpu,
  ShoppingCart,
  CreditCard,
  Zap,
  BarChart3
} from 'lucide-react';

const FeaturesTab = () => {
  const { features, isLoading, toggleFeature, isUpdating } = useOrganizationFeatures();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  const featureCategories = [
    {
      title: 'Core Features',
      description: 'Essential features for your organization',
      features: [
        { key: 'farmer_management', label: 'Farmer Management', icon: Users, description: 'Manage your farmer network' },
        { key: 'dealer_management', label: 'Dealer Management', icon: Store, description: 'Manage dealer network and distribution' },
        { key: 'product_catalog', label: 'Product Catalog', icon: Package, description: 'Showcase agricultural products' },
        { key: 'mobile_app', label: 'Mobile App Access', icon: Phone, description: 'Access via mobile applications' },
      ],
    },
    {
      title: 'Communication',
      description: 'Stay connected with your network',
      features: [
        { key: 'sms_enabled', label: 'SMS Messaging', icon: MessageSquare, description: 'Send SMS to farmers and dealers' },
        { key: 'whatsapp_enabled', label: 'WhatsApp Integration', icon: MessageSquare, description: 'WhatsApp Business API integration' },
        { key: 'voice_calls_enabled', label: 'Voice Calls', icon: Phone, description: 'Voice call capabilities' },
      ],
    },
    {
      title: 'Analytics & Insights',
      description: 'Make data-driven decisions',
      features: [
        { key: 'analytics_basic', label: 'Basic Analytics', icon: BarChart3, description: 'Essential metrics and reports' },
        { key: 'analytics_advanced', label: 'Advanced Analytics', icon: BarChart3, description: 'Predictive analytics and AI insights', premium: true },
      ],
    },
    {
      title: 'Advanced Technology',
      description: 'Cutting-edge features',
      features: [
        { key: 'weather_forecast', label: 'Weather Forecast', icon: Cloud, description: 'Real-time weather updates', premium: true },
        { key: 'satellite_imagery', label: 'Satellite Imagery', icon: Satellite, description: 'Satellite-based crop monitoring', premium: true },
        { key: 'iot_integration', label: 'IoT Integration', icon: Cpu, description: 'Connect IoT devices', premium: true },
      ],
    },
    {
      title: 'Commerce & Payments',
      description: 'Enable transactions',
      features: [
        { key: 'marketplace_enabled', label: 'Marketplace', icon: ShoppingCart, description: 'Buy and sell products' },
        { key: 'ecommerce_enabled', label: 'E-commerce', icon: ShoppingCart, description: 'Full e-commerce capabilities', premium: true },
        { key: 'payment_gateway', label: 'Payment Gateway', icon: CreditCard, description: 'Accept online payments' },
      ],
    },
    {
      title: 'Integration & API',
      description: 'Connect with external systems',
      features: [
        { key: 'api_access', label: 'API Access', icon: Zap, description: 'RESTful API access', premium: true },
        { key: 'webhooks_enabled', label: 'Webhooks', icon: Zap, description: 'Real-time event notifications', premium: true },
      ],
    },
  ];

  const handleToggle = async (key: string, currentValue: boolean) => {
    await toggleFeature(key as any, !currentValue);
  };

  return (
    <div className="space-y-6">
      {featureCategories.map((category) => (
        <Card key={category.title}>
          <CardHeader>
            <CardTitle>{category.title}</CardTitle>
            <CardDescription>{category.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {category.features.map((feature) => {
              const Icon = feature.icon;
              const isEnabled = Boolean(features?.[feature.key as keyof typeof features]);

              return (
                <div
                  key={feature.key}
                  className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={feature.key} className="cursor-pointer font-medium">
                          {feature.label}
                        </Label>
                        {feature.premium && (
                          <Badge variant="secondary" className="text-xs">
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={feature.key}
                    checked={isEnabled}
                    onCheckedChange={() => handleToggle(feature.key, isEnabled)}
                    disabled={isUpdating}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FeaturesTab;
