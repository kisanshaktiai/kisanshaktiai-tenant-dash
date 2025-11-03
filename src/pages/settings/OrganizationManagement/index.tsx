import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Palette, 
  Settings, 
  Shield, 
  CreditCard, 
  BarChart3 
} from 'lucide-react';
import OverviewTab from './components/OverviewTab';
import ProfileTab from './components/ProfileTab';
import BrandingTab from './components/BrandingTab';
import FeaturesTab from './components/FeaturesTab';
import SecurityTab from './components/SecurityTab';
import SubscriptionTab from './components/SubscriptionTab';

const OrganizationManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 border">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Organization Management</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Manage your organization profile, branding, features, and settings from one central dashboard
            </p>
          </div>
        </div>

        {/* Modern Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-auto p-1 bg-muted/50">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-background"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 data-[state=active]:bg-background"
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="branding" 
              className="flex items-center gap-2 data-[state=active]:bg-background"
            >
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Branding</span>
            </TabsTrigger>
            <TabsTrigger 
              value="features" 
              className="flex items-center gap-2 data-[state=active]:bg-background"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Features</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex items-center gap-2 data-[state=active]:bg-background"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger 
              value="subscription" 
              className="flex items-center gap-2 data-[state=active]:bg-background"
            >
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <BrandingTab />
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <FeaturesTab />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityTab />
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <SubscriptionTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default OrganizationManagement;
