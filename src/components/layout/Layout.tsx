
import React from 'react';
import { EnhancedTenantLayout } from './EnhancedTenantLayout';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return <EnhancedTenantLayout>{children}</EnhancedTenantLayout>;
};
