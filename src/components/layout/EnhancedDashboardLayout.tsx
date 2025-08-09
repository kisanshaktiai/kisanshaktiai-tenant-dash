
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar';
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
    <div className="h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Command Palette */}
      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
      />
      
      <PanelGroup direction="horizontal" className="h-full">
        {/* Sidebar Panel */}
        <Panel
          defaultSize={18}
          minSize={15}
          maxSize={25}
          className={cn(
            "transition-all duration-300",
            isMinimized && "min-w-[60px] max-w-[60px]"
          )}
        >
          <div className="relative h-full">
            <DashboardSidebar isMinimized={isMinimized} />
            
            {/* Minimize/Maximize Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute -right-3 top-4 z-10 h-6 w-6 rounded-full border bg-background shadow-md hover:shadow-lg"
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

        <PanelResizeHandle className="w-1 bg-border hover:bg-primary/20 transition-colors" />

        {/* Main Content Panel */}
        <Panel defaultSize={82} minSize={60}>
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
                <div className="container mx-auto p-6 space-y-6">
                  <Outlet />
                </div>
              </main>

              {/* Notification Panel */}
              {showNotifications && (
                <div className="w-80 border-l bg-card shadow-lg">
                  <NotificationPanel />
                </div>
              )}
            </div>

            {/* Real-time Connection Status */}
            <div className="border-t bg-muted/30 px-4 py-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    isConnected ? "bg-success animate-pulse" : "bg-destructive"
                  )} />
                  <span>
                    {isConnected ? `Connected (${activeChannels} channels)` : 'Disconnected'}
                  </span>
                </div>
                <div>
                  KisanShakti AI © 2025
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};
