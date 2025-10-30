
import React from 'react';
import { MobileOptimizedSidebar } from './MobileOptimizedSidebar';

interface DashboardSidebarProps {
  isMinimized?: boolean;
}

/**
 * @deprecated Use MobileOptimizedSidebar instead
 * This component is kept for backward compatibility
 */
export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  isMinimized = false 
}) => {
  console.warn('DashboardSidebar is deprecated. Use MobileOptimizedSidebar instead.');
  
  return <MobileOptimizedSidebar />;
};
