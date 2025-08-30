
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { ModernSidebar } from './ModernSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ModernSidebar />
        <SidebarInset>
          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
