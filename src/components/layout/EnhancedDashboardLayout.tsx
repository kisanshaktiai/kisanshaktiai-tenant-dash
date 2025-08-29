
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ModernSidebar } from './ModernSidebar';
import { EnhancedTopbar } from './EnhancedTopbar';
import NotificationPanel from '../notifications/NotificationPanel';
import { CommandPalette } from '../ui/command-palette';
import { useTenantRealtime } from '@/hooks/data/useTenantRealtime';
import { cn } from '@/lib/utils';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EnhancedDashboardLayout: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const { isConnected, activeChannels } = useTenantRealtime();

  return (
    <div className="h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Enhanced Command Palette */}
      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
      />
      
      <PanelGroup direction="horizontal" className="h-full">
        {/* Sidebar Panel */}
        <Panel
          defaultSize={isMinimized ? 5 : 18}
          minSize={isMinimized ? 5 : 15}
          maxSize={isMinimized ? 5 : 25}
          className={cn(
            "transition-all duration-300 relative",
            isMinimized && "min-w-[64px] max-w-[64px]"
          )}
        >
          <div className="relative h-full">
            <ModernSidebar isMinimized={isMinimized} />
            
            {/* Modern Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "absolute -right-3 top-6 z-20 h-6 w-6 rounded-full border bg-background/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200",
                "hover:bg-accent hover:border-accent-foreground/20"
              )}
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <Maximize2 className="h-3 w-3" />
              ) : (
                <Minimize2 className="h-3 w-3" />
              )}
            </Button>
          </div>
        </Panel>

        {!isMinimized && (
          <PanelResizeHandle className="w-1 bg-border/50 hover:bg-primary/30 transition-colors duration-200" />
        )}

        {/* Main Content Panel */}
        <Panel defaultSize={isMinimized ? 95 : 82} minSize={60}>
          <div className="flex h-full flex-col">
            {/* Enhanced Topbar */}
            <EnhancedTopbar
              onOpenCommandPalette={() => setShowCommandPalette(true)}
              onToggleNotifications={() => setShowNotifications(!showNotifications)}
              isRealTimeConnected={isConnected}
              activeChannels={activeChannels}
            />

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
              <main className="flex-1 overflow-auto">
                <div className="container mx-auto p-6 space-y-6 max-w-none">
                  <Outlet />
                </div>
              </main>

              {/* Notification Panel */}
              {showNotifications && (
                <div className="w-80 border-l bg-card/95 backdrop-blur-sm shadow-xl">
                  <NotificationPanel />
                </div>
              )}
            </div>

            {/* Enhanced Status Bar */}
            <div className="border-t bg-gradient-to-r from-muted/50 via-background/80 to-muted/30 backdrop-blur-sm px-6 py-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full transition-all duration-200",
                      isConnected ? "bg-emerald-500 shadow-lg shadow-emerald-500/30 animate-pulse" : "bg-red-500"
                    )} />
                    <span className="text-muted-foreground font-medium">
                      {isConnected ? `Connected • ${activeChannels} active channels` : 'Disconnected'}
                    </span>
                  </div>
                  <div className="h-3 w-px bg-border" />
                  <span className="text-muted-foreground">Multi-Tenant SaaS Platform</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>KisanShakti AI</span>
                  <span>© 2025</span>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};
