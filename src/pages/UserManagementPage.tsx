
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';

const UserManagementPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="User Management"
        description="Manage team members, roles, and permissions"
      />

      <PageContent>
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Invite and manage your team members
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

export default UserManagementPage;
export { UserManagementPage };
