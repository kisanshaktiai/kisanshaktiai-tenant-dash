
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';
import { EnhancedThemeCustomization } from '@/components/profile/EnhancedThemeCustomization';
import { User, Settings, Palette, Smartphone } from 'lucide-react';

const ProfilePage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Profile Settings"
        description="Manage your account preferences and tenant customization"
      />
      <PageContent>
        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="w-4 h-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="app-management" className="gap-2">
              <Smartphone className="w-4 h-4" />
              App Management
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Settings className="w-4 h-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Profile management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <EnhancedThemeCustomization />
          </TabsContent>

          <TabsContent value="app-management">
            <Card>
              <CardHeader>
                <CardTitle>Mobile App Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Smartphone className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Please visit the dedicated App Management page for full configuration options.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Additional preferences coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageContent>
    </PageLayout>
  );
};

export default ProfilePage;
