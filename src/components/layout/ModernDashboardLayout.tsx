
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Store,
  BarChart3,
  Megaphone,
  Settings,
  CreditCard,
  LogOut,
  ChevronDown,
  Bell,
  Search,
  Menu
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const navigationItems = [
  { title: 'Dashboard', url: '/dashboard', icon: BarChart3 },
  { title: 'Farmers', url: '/farmers', icon: Users },
  { title: 'Dealers', url: '/dealers', icon: Store },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'Campaigns', url: '/campaigns', icon: Megaphone },
  { title: 'Settings', url: '/settings', icon: Settings },
  { title: 'Subscription', url: '/subscription', icon: CreditCard },
];

const AppSidebar = () => {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string) => currentPath === path;
  
  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible>
      <SidebarContent className="bg-gradient-to-b from-card to-card/95 border-r border-border/50">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-medium px-4 py-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

const TopBar = () => {
  const { user, signOut } = useAuth();
  const { currentTenant, userTenants, switchTenant, isMultiTenant } = useTenant();

  const getUserInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const handleTenantSwitch = async (tenantId: string) => {
    await switchTenant(tenantId);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-8 w-8" />
          
          {/* Tenant Selector */}
          {isMultiTenant && currentTenant && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 font-semibold">
                  {currentTenant.name}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Switch Tenant</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userTenants.map((userTenant) => {
                  if (!userTenant.tenant || !('id' in userTenant.tenant)) return null;
                  
                  return (
                    <DropdownMenuItem
                      key={userTenant.tenant.id}
                      onClick={() => handleTenantSwitch(userTenant.tenant.id)}
                      className="flex items-center justify-between"
                    >
                      <span>{userTenant.tenant.name}</span>
                      {userTenant.tenant.id === currentTenant?.id && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Single Tenant Display */}
          {!isMultiTenant && currentTenant && (
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-lg">{currentTenant.name}</h1>
              <Badge variant="outline" className="text-xs">
                {currentTenant.subscription_plan}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.email || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {user?.email ? getUserInitials(user.email) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export const ModernDashboardLayout: React.FC = () => {
  return (
    <SidebarProvider collapsedWidth={56}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-muted/20">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <TopBar />
          
          <main className="flex-1 p-6 bg-gradient-to-br from-background/50 to-muted/10">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
