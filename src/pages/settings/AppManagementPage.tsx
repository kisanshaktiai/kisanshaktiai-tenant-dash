
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';
import { AppManagementSystem } from '@/components/app-management/AppManagementSystem';

const AppManagementPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="App Management"
        description="Configure and manage your white-label farmer mobile application"
      />
      <PageContent>
        <AppManagementSystem />
      </PageContent>
    </PageLayout>
  );
};

export default AppManagementPage;
