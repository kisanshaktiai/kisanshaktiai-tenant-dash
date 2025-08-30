
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { EnhancedSidebar } from './EnhancedSidebar';
import { EnhancedTopbar } from './EnhancedTopbar';
import NotificationPanel from '../notifications/NotificationPanel';
import { CommandPalette } from '../ui/command-palette';
import { useTenantRealtime } from '@/hooks/data/useTenantRealtime';
import { cn } from '@/lib/utils';

export const EnhancedDashboardLayout: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isConnected, activeChannels } = useTenantRealtime();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/10">
      {/* Enhanced Command Palette */}
      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
      />
      
      <div className="flex min-h-screen w-full">
        <EnhancedSidebar 
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
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
              <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 w-full max-w-none">
                <Outlet />
              </div>
            </main>

            {/* Notification Panel */}
            {showNotifications && (
              <div className="w-80 border-l bg-card/95 backdrop-blur-sm shadow-xl hidden lg:block">
                <NotificationPanel />
              </div>
            )}
          </div>

          {/* Enhanced Status Bar */}
          <div className="border-t bg-gradient-to-r from-muted/50 via-background/80 to-muted/30 backdrop-blur-sm px-4 lg:px-6 py-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 lg:gap-4">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-2 w-2 rounded-full transition-all duration-200",
                    isConnected ? "bg-emerald-500 shadow-lg shadow-emerald-500/30 animate-pulse" : "bg-red-500"
                  )} />
                  <span className="text-muted-foreground font-medium hidden sm:inline">
                    {isConnected ? `Connected • ${activeChannels} active channels` : 'Disconnected'}
                  </span>
                  <span className="text-muted-foreground font-medium sm:hidden">
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="h-3 w-px bg-border hidden sm:block" />
                <span className="text-muted-foreground hidden sm:inline">Multi-Tenant SaaS Platform</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>KisanShakti AI</span>
                <span className="hidden sm:inline">© 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
