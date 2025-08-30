
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import {
  LayoutDashboard,
  Users,
  Package,
  Store,
  Megaphone,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';

interface DashboardSidebarProps {
  isMinimized?: boolean;
}

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: null
  },
  {
    title: 'Farmers',
    href: '/farmers',
    icon: Users,
    permission: 'farmers.view' as const,
    badge: 'Live'
  },
  {
    title: 'Products',
    href: '/products',
    icon: Package,
    permission: 'products.view' as const
  },
  {
    title: 'Dealers',
    href: '/dealers',
    icon: Store,
    permission: 'dealers.view' as const
  },
  {
    title: 'Campaigns',
    href: '/campaigns',
    icon: Megaphone,
    permission: 'campaigns.view' as const
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    permission: 'analytics.view' as const
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    permission: 'settings.view' as const
  }
];

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  isMinimized = false 
}) => {
  const location = useLocation();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { hasPermission, userRole } = usePermissions();

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-card border-r transition-all duration-300",
      isMinimized ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b">
        {!isMinimized ? (
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {currentTenant?.name || 'KisanShakti'}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {currentTenant?.subscription_plan?.toUpperCase() || 'KISAN'} Plan
            </p>
            <div className="flex items-center mt-2">
              <Badge variant="outline" className="text-xs">
                {userRole.replace('_', ' ')}
              </Badge>
              <div className="ml-2 flex items-center">
                <Activity className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">KS</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const canAccess = !item.permission || hasPermission(item.permission);
            
            if (!canAccess) return null;

            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  isActive(item.href) 
                    ? "bg-accent text-accent-foreground font-medium" 
                    : "text-muted-foreground hover:text-foreground",
                  isMinimized ? "justify-center" : "justify-start"
                )}
              >
                <IconComponent className={cn("h-4 w-4", !isMinimized && "mr-3")} />
                {!isMinimized && (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        {!isMinimized ? (
          <div className="text-xs text-muted-foreground">
            <div>Version 2.0.1</div>
            <div className="mt-1">© 2025 KisanShakti AI</div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};
