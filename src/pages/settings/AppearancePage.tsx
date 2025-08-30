
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { AdvancedThemeCustomization } from '@/components/appearance/AdvancedThemeCustomization';

export const AppearancePage: React.FC = () => {
  return (
    <PageLayout maxWidth="none" padding="md">
      <AdvancedThemeCustomization />
    </PageLayout>
  );
};
