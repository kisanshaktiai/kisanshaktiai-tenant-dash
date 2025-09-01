
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { MobileOptimizedSidebar } from './MobileOptimizedSidebar';
import { EnhancedTopbar } from './EnhancedTopbar';
import NotificationPanel from '../notifications/NotificationPanel';
import { CommandPalette } from '../ui/command-palette';
import { useTenantRealtime } from '@/hooks/data/useTenantRealtime';
import { SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export const EnhancedDashboardLayout: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const { isConnected, activeChannels } = useTenantRealtime();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/10">
        {/* Enhanced Command Palette */}
        <CommandPalette
          open={showCommandPalette}
          onOpenChange={setShowCommandPalette}
        />
        
        <div className="flex min-h-screen w-full">
          <MobileOptimizedSidebar />
          
          <div className="flex flex-col flex-1 min-w-0">
            {/* Enhanced Topbar */}
            <EnhancedTopbar
              onOpenCommandPalette={() => setShowCommandPalette(true)}
              onToggleNotifications={() => setShowNotifications(!showNotifications)}
              isRealTimeConnected={isConnected}
              activeChannels={activeChannels}
            />

            {/* Main Content Area */}
            <div className="flex flex-1 min-h-0">
              <main className="flex-1 overflow-auto">
                {/* Mobile-optimized padding */}
                <div className="p-2 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 w-full max-w-none">
                  <Outlet />
                </div>
              </main>

              {/* Notification Panel - Hidden on mobile, sliding on tablet+ */}
              {showNotifications && (
                <div className={cn(
                  "border-l bg-card/95 backdrop-blur-sm shadow-xl transition-all duration-300",
                  "hidden lg:block w-80",
                  "md:block md:w-72"
                )}>
                  <NotificationPanel />
                </div>
              )}
            </div>

            {/* Enhanced Status Bar - More compact on mobile */}
            <div className="border-t bg-gradient-to-r from-muted/50 via-background/80 to-muted/30 backdrop-blur-sm px-2 sm:px-4 lg:px-6 py-1.5 sm:py-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className={cn(
                      "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all duration-200",
                      isConnected ? "bg-emerald-500 shadow-lg shadow-emerald-500/30 animate-pulse" : "bg-red-500"
                    )} />
                    <span className="text-muted-foreground font-medium text-xs hidden xs:inline">
                      {isConnected ? `Connected • ${activeChannels} channels` : 'Disconnected'}
                    </span>
                    <span className="text-muted-foreground font-medium text-xs xs:hidden">
                      {isConnected ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="h-3 w-px bg-border hidden sm:block" />
                  <span className="text-muted-foreground text-xs hidden sm:inline">Multi-Tenant SaaS</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground text-xs">
                  <span className="hidden xs:inline">KisanShakti AI</span>
                  <span className="xs:hidden">KS</span>
                  <span className="hidden sm:inline">© 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
