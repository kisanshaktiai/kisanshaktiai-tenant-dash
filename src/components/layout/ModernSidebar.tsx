
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Store, 
  BarChart3, 
  Megaphone,
  Settings,
  ChevronRight,
  Building2,
  Leaf
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { useTenantIsolation } from '@/hooks/useTenantIsolation';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const ModernSidebar = () => {
  const { state: sidebarState } = useSidebar();
  const location = useLocation();
  const { currentTenant } = useTenantIsolation();
  const isCollapsed = sidebarState === 'collapsed';

  const mainNavigation = [
    {
      title: 'Dashboard',
      url: '/app/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      title: 'Farmers',
      url: '/app/farmers',
      icon: Users,
      badge: '1.2k',
    },
    {
      title: 'Products',
      url: '/app/products',
      icon: Package,
      badge: null,
    },
    {
      title: 'Dealers',
      url: '/app/dealers',
      icon: Store,
      badge: '43',
    },
    {
      title: 'Analytics',
      url: '/app/analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      title: 'Campaigns',
      url: '/app/campaigns',
      icon: Megaphone,
      badge: 'NEW',
    },
  ];

  const settingsNavigation = [
    {
      title: 'Organization',
      url: '/app/settings/organization',
      description: 'Company details and branding',
    },
    {
      title: 'Users',
      url: '/app/settings/users',
      description: 'Team members and permissions',
    },
    {
      title: 'Appearance',
      url: '/app/settings/appearance',
      description: 'Theme and visual preferences',
    },
    {
      title: 'Integrations',
      url: '/app/integrations',
      description: 'Third-party connections',
    },
    {
      title: 'Subscription',
      url: '/app/subscription',
      description: 'Billing and plan details',
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isSettingsSection = location.pathname.startsWith('/app/settings') || 
                           location.pathname.startsWith('/app/integrations') ||
                           location.pathname.startsWith('/app/subscription');

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar-background">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            {currentTenant?.type === 'agri_company' && <Building2 className="h-4 w-4" />}
            {currentTenant?.type === 'ngo' && <Leaf className="h-4 w-4" />}
            {!currentTenant?.type && <Building2 className="h-4 w-4" />}
          </div>
          {!isCollapsed && (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-sidebar-foreground">
                {currentTenant?.name || 'Agricultural Platform'}
              </span>
              <span className="truncate text-xs text-sidebar-foreground/70 capitalize">
                {currentTenant?.type?.replace('_', ' ') || 'Organization'}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground font-medium"
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge 
                              variant={item.badge === 'NEW' ? 'default' : 'secondary'}
                              className="ml-auto text-xs bg-sidebar-primary text-sidebar-primary-foreground"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Section */}
        <SidebarGroup>
          <Collapsible defaultOpen={isSettingsSection}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="group/label text-sidebar-foreground/70 font-medium hover:text-sidebar-foreground cursor-pointer flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {!isCollapsed && 'Settings'}
                </div>
                {!isCollapsed && (
                  <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/label:rotate-90" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {settingsNavigation.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                      >
                        <NavLink to={item.url} className="flex flex-col items-start gap-1 py-2">
                          <span className="font-medium">{item.title}</span>
                          {!isCollapsed && (
                            <span className="text-xs text-sidebar-foreground/60">
                              {item.description}
                            </span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {!isCollapsed && (
          <div className="text-xs text-sidebar-foreground/50 text-center">
            <p>Agricultural Platform v2.0</p>
            <p className="mt-1">
              <span className="text-status-active">●</span> All systems operational
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default ModernSidebar;
