
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
        "hover:text-sidebar-foreground/80 transition-colors"
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
                    "group relative overflow-hidden transition-all duration-200 rounded-lg mx-2",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm",
                    isActive && [
                      "bg-sidebar-primary/10 text-sidebar-primary font-medium shadow-sm",
                      "border-l-3 border-sidebar-primary ml-2 pl-4"
                    ],
                    !isActive && "text-sidebar-foreground/80 hover:text-sidebar-foreground",
                    isCollapsed && "justify-center mx-1 pl-0 border-l-0"
                  )}
                >
                  <NavLink to={item.href} className="flex items-center gap-3 w-full py-2 px-3">
                    <div className="relative flex-shrink-0">
                      <item.icon className={cn(
                        "h-4 w-4 transition-all duration-200",
                        isActive ? "text-sidebar-primary" : "text-current"
                      )} />
                      {item.isNew && !isCollapsed && (
                        <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber-500 animate-pulse" />
                      )}
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">{item.title}</span>
                          {item.badge && (
                            <Badge 
                              variant={isActive ? "default" : "secondary"} 
                              className="text-xs px-1.5 py-0.5 h-auto"
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
        "border-r border-sidebar-border bg-sidebar-background",
        "shadow-soft transition-all duration-200"
      )}
    >
      {/* Header */}
      <SidebarHeader className={cn(
        "p-4 border-b border-sidebar-border bg-gradient-to-r from-primary/5 to-primary/10",
        "transition-all duration-200",
        isCollapsed && "p-2"
      )}>
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-medium ring-2 ring-primary/20">
                <span className="text-primary-foreground font-bold text-lg">
                  {currentTenant?.name?.charAt(0) || 'KS'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-sidebar-foreground truncate">
                  {currentTenant?.name || 'KisanShakti'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs px-2 py-0.5 bg-primary/10 border-primary/20">
                    {currentTenant?.subscription_plan?.toUpperCase() || 'KISAN'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs bg-sidebar-background/50 rounded-lg p-2">
              <div className="flex items-center gap-2 text-sidebar-foreground/70">
                <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
                <span className="font-medium">Live System</span>
              </div>
              <Badge variant="secondary" className="text-xs px-2 py-0.5 capitalize bg-sidebar-accent/50">
                {userRole.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-medium ring-2 ring-primary/20">
              <span className="text-primary-foreground font-bold text-sm">
                {currentTenant?.name?.charAt(0) || 'KS'}
              </span>
            </div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse ring-2 ring-emerald-500/20"></div>
          </div>
        )}
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className={cn(
        "px-1 py-4 transition-all duration-200 bg-sidebar-background",
        "scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent"
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
        "p-4 border-t border-sidebar-border bg-sidebar-background/80 backdrop-blur-sm",
        "transition-all duration-200",
        isCollapsed && "p-2"
      )}>
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="text-xs text-sidebar-foreground/60 bg-sidebar-accent/30 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">Version 2.1.0</span>
                <Badge variant="outline" className="text-xs bg-primary/10 border-primary/20">Beta</Badge>
              </div>
              <div className="flex items-center gap-1 text-sidebar-foreground/50">
                <span>© 2025 KisanShakti AI</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-primary/20"></div>
            <div className="text-xs text-sidebar-foreground/60 font-mono">v2.1</div>
          </div>
        )}
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
};
