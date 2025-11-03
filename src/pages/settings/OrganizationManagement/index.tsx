import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Palette, 
  Settings, 
  Shield, 
  CreditCard, 
  BarChart3,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useOrganizationRealtime } from '@/hooks/organization/useOrganizationRealtime';
import { useOrganizationCollaboration } from '@/hooks/organization/useOrganizationCollaboration';
import { EditingIndicator } from './components/EditingIndicator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import OverviewTab from './components/OverviewTab';
import ProfileTab from './components/ProfileTab';
import BrandingTab from './components/BrandingTab';
import FeaturesTab from './components/FeaturesTab';
import SecurityTab from './components/SecurityTab';
import SubscriptionTab from './components/SubscriptionTab';

const OrganizationManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const realtimeStatus = useOrganizationRealtime();
  const collaboration = useOrganizationCollaboration();

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Hero Header with Real-time Status */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 border">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Organization Management</h1>
              </div>
              <div className="flex items-center gap-3">
                <EditingIndicator activeUsers={collaboration.activeUsers} />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border">
                        {realtimeStatus.isConnected ? (
                          <>
                            <Wifi className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-muted-foreground">
                              Live ({realtimeStatus.activeChannels})
                            </span>
                          </>
                        ) : (
                          <>
                            <WifiOff className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Offline</span>
                          </>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs space-y-1">
                        {realtimeStatus.isConnected ? (
                          <>
                            <div>Real-time sync enabled</div>
                            <div>{realtimeStatus.activeChannels} channels active</div>
                            {realtimeStatus.lastUpdate && (
                              <div>Last update: {new Date(realtimeStatus.lastUpdate).toLocaleTimeString()}</div>
                            )}
                          </>
                        ) : (
                          <div>Real-time sync disconnected</div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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
