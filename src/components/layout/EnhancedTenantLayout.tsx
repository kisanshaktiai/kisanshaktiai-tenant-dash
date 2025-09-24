import React, { useState, useEffect, memo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useTenantContextOptimized } from '@/contexts/TenantContextOptimized';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell,
  LogOut,
  Moon,
  Sun,
  Globe,
  Activity,
  Settings,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/AuthService';
import { useTheme } from 'next-themes';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { toast } from 'sonner';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { navigationConfig } from '@/config/navigation';

// Group navigation items by category
const groupedNavigation = {
  main: navigationConfig.filter(item => item.category === 'main'),
  management: navigationConfig.filter(item => item.category === 'management'),
  analytics: navigationConfig.filter(item => item.category === 'analytics'),
  settings: navigationConfig.filter(item => item.category === 'settings').slice(0, 2) // Only Settings and Organization for main nav
};

const TenantSidebar = memo(() => {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTenant } = useTenantContextOptimized();
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-card border-r">
        {/* Tenant Branding */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            {currentTenant?.branding?.logo_url ? (
              <img 
                src={currentTenant.branding.logo_url} 
                alt={currentTenant.name}
                className="w-8 h-8 rounded"
              />
            ) : (
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  {currentTenant?.name?.charAt(0) || 'T'}
                </span>
              </div>
            )}
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-sm truncate">
                  {currentTenant?.name || 'Tenant Dashboard'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {currentTenant?.type?.replace('_', ' ') || 'Organization'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        {groupedNavigation.main.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groupedNavigation.main.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive(item.href)}
                    >
                      <button
                        onClick={() => navigate(item.href)}
                        className="flex items-center gap-3 w-full p-2 rounded-md transition-colors"
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Management Section */}
        {groupedNavigation.management.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groupedNavigation.management.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive(item.href)}
                    >
                      <button
                        onClick={() => navigate(item.href)}
                        className="flex items-center gap-3 w-full p-2 rounded-md transition-colors"
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Analytics Section */}
        {groupedNavigation.analytics.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Analytics</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groupedNavigation.analytics.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive(item.href)}
                    >
                      <button
                        onClick={() => navigate(item.href)}
                        className="flex items-center gap-3 w-full p-2 rounded-md transition-colors"
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings Section */}
        {groupedNavigation.settings.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groupedNavigation.settings.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive(item.href)}
                    >
                      <button
                        onClick={() => navigate(item.href)}
                        className="flex items-center gap-3 w-full p-2 rounded-md transition-colors"
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Activity Status */}
        {!isCollapsed && (
          <div className="mt-auto p-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>Live Updates</span>
              <LiveIndicator isConnected={true} activeChannels={3} />
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
});

const TopBar = memo(() => {
  const { user } = useAppSelector((state) => state.auth);
  const { currentTenant, userTenants, switchTenant } = useTenantContextOptimized();
  const { theme, setTheme } = useTheme();
  const [notifications] = useState(3); // Mock notification count
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    toast.loading('Signing out...');
    
    const result = await authService.logout({
      redirectTo: '/auth',
      clearLocalStorage: true,
      showMessage: true
    });

    if (!result.success) {
      toast.error('Failed to sign out. Please try again.');
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <h1 className="font-semibold">
              {currentTenant?.name || 'Tenant Dashboard'}
            </h1>
            {currentTenant?.subscription_plan && (
              <Badge variant="outline" className="text-xs">
                {currentTenant.subscription_plan.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Real-time Status */}
          <LiveIndicator isConnected={true} activeChannels={4} />

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {notifications}
              </Badge>
            )}
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Tenant Switcher */}
              {userTenants.length > 1 && (
                <>
                  <DropdownMenuLabel>Switch Tenant</DropdownMenuLabel>
                  {userTenants.map((userTenant) => (
                    <DropdownMenuItem
                      key={userTenant.tenant_id}
                      onClick={() => switchTenant(userTenant.tenant_id)}
                      className={currentTenant?.id === userTenant.tenant_id ? 'bg-muted' : ''}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span>{userTenant.tenant?.name}</span>
                        {currentTenant?.id === userTenant.tenant_id && (
                          <Badge variant="secondary" className="ml-auto text-xs">Current</Badge>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Globe className="mr-2 h-4 w-4" />
                <span>Language</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} disabled={isLoggingOut}>
                {isLoggingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
});

export const EnhancedTenantLayout: React.FC = () => {
  const { currentTenant, loading } = useTenantContextOptimized();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isLoading } = useAuthGuard();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state while checking authentication
  if (isLoading || !mounted || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, the AuthGuard will handle redirect
  if (!isAuthenticated) {
    return null;
  }

  if (!currentTenant) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">No tenant context available</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <TenantSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-auto p-6 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
