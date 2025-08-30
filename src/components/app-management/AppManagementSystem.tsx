
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTenantContextOptimized } from '@/contexts/TenantContextOptimized';
import { useToast } from '@/hooks/use-toast';
import {
  Smartphone,
  Download,
  Settings,
  Users,
  BarChart3,
  Shield,
  Bell,
  Palette,
  Globe,
  Zap,
  Eye,
  RefreshCw,
  ExternalLink,
  QrCode
} from 'lucide-react';

interface AppFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: React.ComponentType<{ className?: string }>;
  premium?: boolean;
}

const appFeatures: AppFeature[] = [
  {
    id: 'weather',
    name: 'Weather Forecast',
    description: 'Real-time weather data and forecasting',
    enabled: true,
    icon: Globe
  },
  {
    id: 'crop_advisory',
    name: 'Crop Advisory',
    description: 'AI-powered crop recommendations',
    enabled: true,
    icon: Zap,
    premium: true
  },
  {
    id: 'market_prices',
    name: 'Market Prices',
    description: 'Live market price updates',
    enabled: true,
    icon: BarChart3
  },
  {
    id: 'expert_chat',
    name: 'Expert Chat',
    description: 'Direct communication with agricultural experts',
    enabled: false,
    icon: Users,
    premium: true
  },
  {
    id: 'disease_detection',
    name: 'Disease Detection',
    description: 'AI-powered crop disease identification',
    enabled: false,
    icon: Shield,
    premium: true
  },
  {
    id: 'notifications',
    name: 'Push Notifications',
    description: 'Important alerts and reminders',
    enabled: true,
    icon: Bell
  }
];

export const AppManagementSystem: React.FC = () => {
  const { currentTenant } = useTenantContextOptimized();
  const { toast } = useToast();
  const [features, setFeatures] = useState(appFeatures);
  const [appConfig, setAppConfig] = useState({
    appName: currentTenant?.name ? `${currentTenant.name} Farmer` : 'Farmer App',
    appDescription: 'Your trusted agricultural companion',
    supportEmail: currentTenant?.owner_email || '',
    supportPhone: '',
    appVersion: '1.0.0',
    minAppVersion: '1.0.0'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleFeatureToggle = (featureId: string) => {
    setFeatures(prevFeatures =>
      prevFeatures.map(feature =>
        feature.id === featureId
          ? { ...feature, enabled: !feature.enabled }
          : feature
      )
    );
  };

  const handleSaveConfiguration = async () => {
    setIsLoading(true);
    try {
      // Here you would save the configuration to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      toast({
        title: "App configuration saved",
        description: "Your farmer app settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to save configuration",
        description: "There was an error saving your app settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAppPreview = () => {
    toast({
      title: "Preview Generated",
      description: "Opening app preview in new tab...",
    });
    // Here you would open a preview of the mobile app
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              <CardTitle>White Label Farmer App Management</CardTitle>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Globe className="w-3 h-3" />
              Multi-Tenant
            </Badge>
          </div>
          <CardDescription>
            Configure and manage your branded mobile application for farmers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">1,247</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Download className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">3,421</div>
              <div className="text-sm text-muted-foreground">Total Downloads</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">4.8</div>
              <div className="text-sm text-muted-foreground">App Rating</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={generateAppPreview} className="gap-2">
              <Eye className="w-4 h-4" />
              Preview App
            </Button>
            <Button variant="outline" className="gap-2">
              <QrCode className="w-4 h-4" />
              Generate QR Code
            </Button>
            <Button variant="outline" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              App Store Links
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="features" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>App Features</CardTitle>
              <CardDescription>
                Enable or disable features for your farmer mobile app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {features.map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <feature.icon className="w-5 h-5 text-primary" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{feature.name}</span>
                          {feature.premium && (
                            <Badge variant="secondary" className="text-xs">Premium</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={feature.enabled}
                      onCheckedChange={() => handleFeatureToggle(feature.id)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>App Branding</CardTitle>
              <CardDescription>
                Your app will automatically inherit the theme from your tenant branding settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="w-4 h-4 text-primary" />
                  <span className="font-medium">Theme Synchronization</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Changes made in the Theme Customization section will automatically apply to your mobile app.
                  This ensures consistent branding across all your tenant touchpoints.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="app-name">App Display Name</Label>
                  <Input
                    id="app-name"
                    value={appConfig.appName}
                    onChange={(e) => setAppConfig(prev => ({ ...prev, appName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="app-version">App Version</Label>
                  <Input
                    id="app-version"
                    value={appConfig.appVersion}
                    onChange={(e) => setAppConfig(prev => ({ ...prev, appVersion: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="app-description">App Description</Label>
                <Textarea
                  id="app-description"
                  value={appConfig.appDescription}
                  onChange={(e) => setAppConfig(prev => ({ ...prev, appDescription: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>App Configuration</CardTitle>
              <CardDescription>
                Configure support and technical settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={appConfig.supportEmail}
                    onChange={(e) => setAppConfig(prev => ({ ...prev, supportEmail: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="support-phone">Support Phone</Label>
                  <Input
                    id="support-phone"
                    value={appConfig.supportPhone}
                    onChange={(e) => setAppConfig(prev => ({ ...prev, supportPhone: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="min-version">Minimum App Version</Label>
                <Input
                  id="min-version"
                  value={appConfig.minAppVersion}
                  onChange={(e) => setAppConfig(prev => ({ ...prev, minAppVersion: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Users with older versions will be prompted to update
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>App Analytics</CardTitle>
              <CardDescription>
                Monitor your mobile app performance and user engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Analytics dashboard coming soon...</p>
                <p className="text-sm">Track user engagement, feature usage, and app performance.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveConfiguration} disabled={isLoading} className="gap-2">
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Settings className="w-4 h-4" />
          )}
          Save Configuration
        </Button>
      </div>
    </div>
  );
};
