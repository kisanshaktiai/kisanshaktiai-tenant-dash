
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  Command, 
  Sun, 
  Moon, 
  LogOut,
  UserCircle,
  Building2,
  ChevronDown
} from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import ModernSidebar from './ModernSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LiveIndicator } from '@/components/ui/LiveIndicator';
import { CommandPalette } from '@/components/ui/command-palette';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppSelector } from '@/store/hooks';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useTenantRealtime } from '@/hooks/data/useTenantRealtime';
import { navigationConfig } from '@/config/navigation';
import { cn } from '@/lib/utils';

const DashboardLayout = () => {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isConnected, activeChannels } = useTenantRealtime();
  const location = useLocation();

  // Get current page title from navigation config
  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    const currentItem = navigationConfig.find(item => 
      currentPath === item.href || currentPath.startsWith(item.href + '/')
    );
    return currentItem?.title || 'Dashboard';
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/5">
        {/* Command Palette */}
        <CommandPalette
          open={showCommandPalette}
          onOpenChange={setShowCommandPalette}
        />

        <ModernSidebar />
        
        <SidebarInset className="flex-1">
          {/* Enhanced Topbar */}
          <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            {/* Left Section - Hamburger + Title */}
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 h-8 w-8" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground">
                  {getCurrentPageTitle()}
                </h1>
                <div className="text-xs text-muted-foreground">
                  {currentTenant?.name || 'KisanShakti'}
                </div>
              </div>
            </div>

            {/* Center Section - Search */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search farmers, dealers, products... (⌘K)"
                  className="pl-9 pr-12 bg-muted/50 border-0 focus-visible:bg-background transition-colors cursor-pointer"
                  onClick={() => setShowCommandPalette(true)}
                  readOnly
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                    <Command className="h-3 w-3 mr-1" />
                    K
                  </Badge>
                </div>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2">
              {/* Real-time Status */}
              <div className="hidden md:flex items-center gap-2">
                <LiveIndicator 
                  isConnected={isConnected} 
                  activeChannels={activeChannels}
                />
              </div>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-8 w-8 px-0"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="relative h-8 w-8 px-0"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-4 w-4" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  3
                </Badge>
              </Button>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 gap-2 px-2">
                    <Avatar className="h-6 w-6 ring-2 ring-primary/20">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start text-left">
                      <span className="text-sm font-medium truncate max-w-24">
                        {user?.user_metadata?.full_name || 'User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Online
                      </span>
                    </div>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {user?.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Building2 className="mr-2 h-4 w-4" />
                    Organization
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
              <Outlet />
            </div>
          </main>

          {/* Enhanced Status Bar */}
          <footer className="border-t bg-gradient-to-r from-muted/30 via-background/80 to-muted/20 backdrop-blur-sm px-4 lg:px-6 py-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-2 w-2 rounded-full transition-all duration-200",
                    isConnected ? "bg-emerald-500 shadow-lg shadow-emerald-500/30 animate-pulse" : "bg-red-500"
                  )} />
                  <span className="text-muted-foreground font-medium hidden sm:inline">
                    {isConnected ? `Connected • ${activeChannels} channels` : 'Disconnected'}
                  </span>
                  <span className="text-muted-foreground font-medium sm:hidden">
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="h-3 w-px bg-border hidden sm:block" />
                <span className="text-muted-foreground hidden sm:inline">
                  {currentTenant?.subscription_plan?.toUpperCase() || 'KISAN'} Plan
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>KisanShakti AI</span>
                <span className="hidden sm:inline">v2.1.0</span>
                <span className="hidden sm:inline">© 2025</span>
              </div>
            </div>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
