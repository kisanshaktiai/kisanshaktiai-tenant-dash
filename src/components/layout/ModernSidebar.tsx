
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';
import { usePermissions } from '@/hooks/usePermissions';
import { navigationConfig, NavigationItem } from '@/config/navigation';
import { useGlobalThemePersistence } from '@/hooks/useGlobalThemePersistence';
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
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import {
  Activity,
  Sparkles
} from 'lucide-react';

const SidebarSection: React.FC<{
  title: string;
  items: NavigationItem[];
}> = ({ title, items }) => {
  const { hasPermission } = usePermissions();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const filteredItems = items.filter(item => 
    !item.permission || hasPermission(item.permission as any)
  );

  if (!filteredItems.length) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className={cn(
        "text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider px-3 mb-2",
        "hover:text-sidebar-foreground/80 transition-colors duration-200"
      )}>
        {!isCollapsed && title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.href || 
                           location.pathname.startsWith(item.href + '/');
            
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={isCollapsed ? item.title : item.description}
                  className={cn(
                    "group relative overflow-hidden transition-all duration-200 rounded-xl mx-2",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                    isActive && [
                      "bg-sidebar-primary/15 text-sidebar-primary font-medium shadow-sm",
                      "border-l-4 border-sidebar-primary ml-2 pl-3",
                      "before:absolute before:inset-0 before:bg-gradient-to-r before:from-sidebar-primary/10 before:to-transparent before:rounded-xl"
                    ],
                    !isActive && [
                      "text-sidebar-foreground/80 hover:text-sidebar-foreground",
                      "hover:bg-sidebar-accent/50"
                    ],
                    isCollapsed && "justify-center mx-1 pl-0 border-l-0"
                  )}
                >
                  <NavLink to={item.href} className="flex items-center gap-3 w-full py-2.5 px-3 relative z-10">
                    <div className="relative flex-shrink-0">
                      <item.icon className={cn(
                        "h-4 w-4 transition-all duration-200",
                        isActive ? "text-sidebar-primary" : "text-current"
                      )} />
                      {item.isNew && !isCollapsed && (
                        <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-warning animate-pulse" />
                      )}
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium text-sm">{item.title}</span>
                          {item.badge && (
                            <Badge 
                              variant={isActive ? "default" : "secondary"} 
                              className={cn(
                                "text-xs px-1.5 py-0.5 h-auto font-medium",
                                isActive 
                                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                                  : "bg-sidebar-accent text-sidebar-accent-foreground"
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export const ModernSidebar: React.FC = () => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { userRole } = usePermissions();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Initialize theme persistence
  useGlobalThemePersistence();

  // Group navigation items by category
  const mainItems = navigationConfig.filter(item => item.category === 'main');
  const managementItems = navigationConfig.filter(item => item.category === 'management');
  const analyticsItems = navigationConfig.filter(item => item.category === 'analytics');
  const integrationItems = navigationConfig.filter(item => item.category === 'integrations');
  const settingsItems = navigationConfig.filter(item => item.category === 'settings');

  return (
    <Sidebar 
      variant="inset" 
      collapsible="icon"
      className={cn(
        "border-r border-sidebar-border bg-sidebar-background shadow-soft",
        "transition-all duration-300 ease-in-out"
      )}
    >
      {/* Header */}
      <SidebarHeader className={cn(
        "p-4 border-b border-sidebar-border",
        "bg-gradient-to-br from-sidebar-primary/5 via-sidebar-primary/3 to-transparent",
        "transition-all duration-300",
        isCollapsed && "p-3"
      )}>
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-11 h-11 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80",
                "rounded-2xl flex items-center justify-center shadow-medium",
                "ring-2 ring-sidebar-primary/20 transition-all duration-200",
                "hover:shadow-lg hover:ring-sidebar-primary/30"
              )}>
                <span className="text-sidebar-primary-foreground font-bold text-lg">
                  {currentTenant?.name?.charAt(0) || 'K'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-sidebar-foreground truncate">
                  {currentTenant?.name || 'KisanShakti'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs px-2 py-0.5 font-medium",
                      "bg-sidebar-primary/10 border-sidebar-primary/20 text-sidebar-primary"
                    )}
                  >
                    {currentTenant?.subscription_plan?.toUpperCase() || 'BASIC'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className={cn(
              "flex items-center justify-between text-xs rounded-xl p-3",
              "bg-sidebar-background/60 backdrop-blur-sm border border-sidebar-border/50"
            )}>
              <div className="flex items-center gap-2 text-sidebar-foreground/70">
                <Activity className="h-3 w-3 text-success animate-pulse" />
                <span className="font-medium">System Online</span>
              </div>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs px-2 py-0.5 capitalize font-medium",
                  "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                {userRole.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              "w-9 h-9 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80",
              "rounded-xl flex items-center justify-center shadow-medium",
              "ring-2 ring-sidebar-primary/20 transition-all duration-200"
            )}>
              <span className="text-sidebar-primary-foreground font-bold text-base">
                {currentTenant?.name?.charAt(0) || 'K'}
              </span>
            </div>
            <div className="w-2 h-2 bg-success rounded-full animate-pulse ring-1 ring-success/30"></div>
          </div>
        )}
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className={cn(
        "px-1 py-4 transition-all duration-300",
        "bg-sidebar-background/95 backdrop-blur-sm",
        "scrollbar-thin scrollbar-thumb-sidebar-border/50 scrollbar-track-transparent"
      )}>
        <div className="space-y-6">
          <SidebarSection title="Dashboard" items={mainItems} />
          <SidebarSection title="Management" items={managementItems} />
          <SidebarSection title="Analytics" items={analyticsItems} />
          <SidebarSection title="Integrations" items={integrationItems} />
          <SidebarSection title="Settings" items={settingsItems} />
        </div>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className={cn(
        "p-4 border-t border-sidebar-border",
        "bg-sidebar-background/90 backdrop-blur-sm",
        "transition-all duration-300",
        isCollapsed && "p-3"
      )}>
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className={cn(
              "text-xs rounded-xl p-3 border border-sidebar-border/50",
              "bg-gradient-to-br from-sidebar-accent/30 to-sidebar-accent/10"
            )}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sidebar-foreground/80">Version 2.1.0</span>
                <Badge 
                  variant="outline" 
                  className="text-xs bg-warning/10 border-warning/20 text-warning"
                >
                  Beta
                </Badge>
              </div>
              <div className="text-sidebar-foreground/60 text-xs">
                © 2025 KisanShakti AI Platform
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-1.5 h-1.5 bg-sidebar-primary rounded-full ring-1 ring-sidebar-primary/30"></div>
            <div className="text-xs text-sidebar-foreground/60 font-mono font-medium">v2.1</div>
          </div>
        )}
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
};
