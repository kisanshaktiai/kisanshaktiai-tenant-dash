
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, BarChart3, MessageSquare, Satellite } from 'lucide-react';
import { OnboardingStep } from '@/services/OnboardingService';

interface FeatureSelectionStepProps {
  step: OnboardingStep;
  onComplete: (stepData?: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
}

const featureGroups = [
  {
    category: 'Core Features',
    icon: Users,
    features: [
      { id: 'farmer_management', name: 'Farmer Management', description: 'Manage farmer profiles and data', enabled: true, required: true },
      { id: 'basic_analytics', name: 'Basic Analytics', description: 'Essential reporting and insights', enabled: true, required: true },
      { id: 'mobile_app', name: 'Mobile App Access', description: 'iOS and Android applications', enabled: true, required: true }
    ]
  },
  {
    category: 'Communication',
    icon: MessageSquare,
    features: [
      { id: 'sms_notifications', name: 'SMS Notifications', description: 'Send SMS to farmers', enabled: true },
      { id: 'whatsapp_integration', name: 'WhatsApp Integration', description: 'WhatsApp Business API', enabled: false },
      { id: 'voice_calls', name: 'Voice Calling', description: 'Automated voice messages', enabled: false }
    ]
  },
  {
    category: 'Advanced Analytics',
    icon: BarChart3,
    features: [
      { id: 'advanced_analytics', name: 'Advanced Analytics', description: 'Detailed insights and reporting', enabled: false },
      { id: 'predictive_analytics', name: 'Predictive Analytics', description: 'AI-powered predictions', enabled: false },
      { id: 'custom_reports', name: 'Custom Reports', description: 'Build custom dashboards', enabled: false }
    ]
  },
  {
    category: 'Technology',
    icon: Satellite,
    features: [
      { id: 'weather_forecast', name: 'Weather Forecasting', description: 'Local weather data and alerts', enabled: false },
      { id: 'satellite_imagery', name: 'Satellite Imagery', description: 'Crop monitoring via satellite', enabled: false },
      { id: 'iot_integration', name: 'IoT Integration', description: 'Connect sensors and devices', enabled: false }
    ]
  }
];

export const FeatureSelectionStep: React.FC<FeatureSelectionStepProps> = ({
  step,
  onComplete,
  isLoading
}) => {
  const [selectedFeatures, setSelectedFeatures] = useState(() => {
    const saved = step.step_data?.selectedFeatures || {};
    const initial: Record<string, boolean> = {};
    
    featureGroups.forEach(group => {
      group.features.forEach(feature => {
        initial[feature.id] = saved[feature.id] ?? feature.enabled;
      });
    });
    
    return initial;
  });

  const handleFeatureToggle = (featureId: string, required: boolean = false) => {
    if (required) return; // Don't allow toggling required features
    
    setSelectedFeatures(prev => ({
      ...prev,
      [featureId]: !prev[featureId]
    }));
  };

  const handleContinue = () => {
    onComplete({ selectedFeatures });
  };

  if (step.step_status === 'completed') {
    const enabledCount = Object.values(step.step_data?.selectedFeatures || {}).filter(Boolean).length;
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Features Configured</h3>
        <p className="text-muted-foreground">
          You've enabled {enabledCount} features for your organization.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Choose Your Features</h3>
        <p className="text-muted-foreground">
          Select the features you want to enable. You can modify these later in settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featureGroups.map((group) => {
          const GroupIcon = group.icon;
          return (
            <Card key={group.category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GroupIcon className="w-5 h-5" />
                  {group.category}
                </CardTitle>
                <CardDescription>
                  Configure {group.category.toLowerCase()} for your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.features.map((feature) => (
                  <div 
                    key={feature.id} 
                    className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50"
                  >
                    <Checkbox
                      id={feature.id}
                      checked={selectedFeatures[feature.id]}
                      onCheckedChange={() => handleFeatureToggle(feature.id, feature.required)}
                      disabled={feature.required}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <label 
                          htmlFor={feature.id}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {feature.name}
                        </label>
                        {feature.required && (
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleContinue} 
          disabled={isLoading}
          className="min-w-32"
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};
