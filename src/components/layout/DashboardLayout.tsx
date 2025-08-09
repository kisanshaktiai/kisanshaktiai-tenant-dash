
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar';

const DashboardLayout = () => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar isMinimized={isMinimized} />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

