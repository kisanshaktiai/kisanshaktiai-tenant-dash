
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';

const OrganizationSettingsPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Organization Settings"
        description="Manage your organization profile and settings"
      />

      <PageContent>
        <Card>
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
            <CardDescription>
              Update your organization details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This feature is under development.
            </p>
          </CardContent>
        </Card>
      </PageContent>
    </PageLayout>
  );
};

export default OrganizationSettingsPage;
export { OrganizationSettingsPage };
