
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';
import { usePermissions } from '@/hooks/usePermissions';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Package,
  Store,
  Megaphone,
  BarChart3,
  Settings,
  Activity,
  Menu,
  X
} from 'lucide-react';

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: string | null;
  badge?: string;
}

const navigationItems: NavigationItem[] = [
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
    permission: 'farmers.view',
    badge: 'Live'
  },
  {
    title: 'Products',
    href: '/products',
    icon: Package,
    permission: 'products.view'
  },
  {
    title: 'Dealers',
    href: '/dealers',
    icon: Store,
    permission: 'dealers.view'
  },
  {
    title: 'Campaigns',
    href: '/campaigns',
    icon: Megaphone,
    permission: 'campaigns.view'
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    permission: 'analytics.view'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    permission: 'settings.view'
  }
];

export const MobileOptimizedSidebar: React.FC = () => {
  const location = useLocation();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { hasPermission, userRole } = usePermissions();
  const { state } = useSidebar();

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar 
      className={cn(
        "transition-all duration-300 ease-in-out border-r bg-sidebar",
        isCollapsed ? "w-14" : "w-60"
      )}
      collapsible="icon"
    >
      {/* Header */}
      <SidebarHeader className="p-3 border-b border-sidebar-border">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-sidebar-foreground truncate">
                {currentTenant?.name || 'KisanShakti'}
              </h2>
              <SidebarTrigger className="h-6 w-6" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                {currentTenant?.subscription_plan?.toUpperCase() || 'KISAN'}
              </Badge>
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-emerald-500" />
                <span className="text-sidebar-foreground/70">Live</span>
              </div>
            </div>
            <div className="text-xs text-sidebar-foreground/60">
              {userRole.replace('_', ' ')}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <SidebarTrigger className="h-6 w-6" />
            <div className="w-6 h-6 bg-sidebar-primary rounded-md flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-xs">KS</span>
            </div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          </div>
        )}
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70 px-2 mb-2">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const canAccess = !item.permission || hasPermission(item.permission as any);
                
                if (!canAccess) return null;

                const active = isActive(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={isCollapsed ? item.title : undefined}
                      className={cn(
                        "w-full transition-colors duration-200",
                        active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                        !active && "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <NavLink
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-2 py-2 rounded-md",
                          isCollapsed ? "justify-center" : "justify-start"
                        )}
                      >
                        <IconComponent className={cn("h-4 w-4 shrink-0")} />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-sm truncate">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3 border-t border-sidebar-border">
        {!isCollapsed ? (
          <div className="text-xs text-sidebar-foreground/60 space-y-1">
            <div>Version 2.0.1</div>
            <div>© 2025 KisanShakti AI</div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};
