import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Users, Package, UserCheck, BarChart3, Settings, 
  Home, MessageSquare, Calendar, MapPin, FileText,
  Sprout, TrendingUp, Bell, HelpCircle
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';

const navigationItems = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: Home },
      { title: 'Analytics', url: '/dashboard/analytics', icon: BarChart3 },
      { title: 'Notifications', url: '/dashboard/notifications', icon: Bell },
    ]
  },
  {
    title: 'Network Management',
    items: [
      { title: 'Farmers', url: '/dashboard/farmers', icon: Users },
      { title: 'Dealers', url: '/dashboard/dealers', icon: UserCheck },
      { title: 'Land Management', url: '/dashboard/lands', icon: MapPin },
      { title: 'Crop Monitoring', url: '/dashboard/crops', icon: Sprout },
    ]
  },
  {
    title: 'Business Operations',
    items: [
      { title: 'Product Catalog', url: '/dashboard/products', icon: Package },
      { title: 'Campaigns', url: '/dashboard/campaigns', icon: Calendar },
      { title: 'Performance', url: '/dashboard/performance', icon: TrendingUp },
      { title: 'Reports', url: '/dashboard/reports', icon: FileText },
    ]
  },
  {
    title: 'Communication',
    items: [
      { title: 'Messages', url: '/dashboard/messages', icon: MessageSquare },
      { title: 'Community Forum', url: '/dashboard/forum', icon: Users },
    ]
  }
];

const DashboardSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { user } = useAppSelector((state) => state.auth);
  const { unreadNotificationCount } = useAppSelector((state) => state.ui);

  const isActive = (path: string) => currentPath === path;
  const getNavClasses = (path: string) => 
    isActive(path) 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      : "hover:bg-sidebar-accent/50";

  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          {currentTenant?.branding?.logo_url ? (
            <img 
              src={currentTenant.branding.logo_url} 
              alt={currentTenant.name}
              className="h-8 w-8 rounded-md object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-md bg-gradient-primary flex items-center justify-center">
              <Sprout className="h-5 w-5 text-white" />
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm truncate">
                {currentTenant?.name || 'AgriTenant Hub'}
              </h2>
              <p className="text-xs text-sidebar-foreground/70 capitalize">
                {currentTenant?.type?.replace('_', ' ') || 'Dashboard'}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        {navigationItems.map((section) => (
          <SidebarGroup key={section.title}>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70 px-4 mb-2">
                {section.title}
              </SidebarGroupLabel>
            )}
            
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={`${getNavClasses(item.url)} flex items-center gap-3 px-4 py-2 rounded-md transition-colors`}
                      >
                        <item.icon className="h-5 w-5" />
                        {!collapsed && (
                          <span className="flex-1">{item.title}</span>
                        )}
                        {!collapsed && item.title === 'Notifications' && unreadNotificationCount > 0 && (
                          <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                            {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink 
                to="/dashboard/settings" 
                className={`${getNavClasses('/dashboard/settings')} flex items-center gap-3 px-4 py-2 rounded-md transition-colors`}
              >
                <Settings className="h-5 w-5" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink 
                to="/dashboard/help" 
                className={`${getNavClasses('/dashboard/help')} flex items-center gap-3 px-4 py-2 rounded-md transition-colors`}
              >
                <HelpCircle className="h-5 w-5" />
                {!collapsed && <span>Help & Support</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {!collapsed && user && (
          <div className="mt-4 p-3 rounded-md bg-sidebar-accent/30">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-xs text-sidebar-foreground/70">
                  {currentTenant?.subscription_plan || 'Trial'}
                </p>
              </div>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;