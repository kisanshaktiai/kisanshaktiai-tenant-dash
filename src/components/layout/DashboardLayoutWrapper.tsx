
import React from 'react';
import { Layout } from './Layout';

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
}

export const DashboardLayoutWrapper: React.FC<DashboardLayoutWrapperProps> = ({ children }) => {
  return (
    <Layout>
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </Layout>
  );
};
