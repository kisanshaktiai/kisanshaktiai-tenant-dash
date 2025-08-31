
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';
import { usePermissions } from '@/hooks/usePermissions';
import { navigationConfig, NavigationItem } from '@/config/navigation';
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

  const filteredItems = items.filter(item => 
    !item.permission || hasPermission(item.permission as any)
  );

  if (!filteredItems.length) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider px-2">
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.href || 
                           location.pathname.startsWith(item.href + '/');
            
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.description}
                  className={cn(
                    "group relative overflow-hidden transition-all duration-200",
                    "hover:bg-accent/80 hover:text-accent-foreground",
                    isActive && "bg-primary/10 text-primary font-medium shadow-sm border-r-2 border-primary"
                  )}
                >
                  <NavLink to={item.href} className="flex items-center gap-3 w-full">
                    <div className="relative">
                      <item.icon className={cn(
                        "h-4 w-4 transition-all duration-200",
                        isActive ? "text-primary" : "text-current"
                      )} />
                      {item.isNew && (
                        <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber-500 animate-pulse" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{item.title}</span>
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

  // Group navigation items by category
  const mainItems = navigationConfig.filter(item => item.category === 'main');
  const managementItems = navigationConfig.filter(item => item.category === 'management');
  const analyticsItems = navigationConfig.filter(item => item.category === 'analytics');
  const integrationItems = navigationConfig.filter(item => item.category === 'integrations');
  const settingsItems = navigationConfig.filter(item => item.category === 'settings');

  return (
    <Sidebar 
      variant="inset" 
      className="border-r bg-gradient-to-b from-card via-card to-card/95"
    >
      {/* Header */}
      <SidebarHeader className="p-4 border-b bg-gradient-to-r from-background/50 to-muted/20">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-bold text-lg">
                  {currentTenant?.name?.charAt(0) || 'KS'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-foreground truncate">
                  {currentTenant?.name || 'KisanShakti'}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {currentTenant?.subscription_plan?.toUpperCase() || 'KISAN'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
                <span>Live System</span>
              </div>
              <Badge variant="secondary" className="text-xs px-2 py-0.5 capitalize">
                {userRole.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-lg">
                {currentTenant?.name?.charAt(0) || 'KS'}
              </span>
            </div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2">
        <div className="space-y-4">
          <SidebarSection title="Dashboard" items={mainItems} />
          <SidebarSection title="Management" items={managementItems} />
          <SidebarSection title="Analytics" items={analyticsItems} />
          <SidebarSection title="Integrations" items={integrationItems} />
          <SidebarSection title="Settings" items={settingsItems} />
        </div>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 border-t bg-gradient-to-r from-muted/30 to-background/50">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Version 2.1.0</span>
                <Badge variant="outline" className="text-xs">Beta</Badge>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <span>© 2025 KisanShakti AI</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
            <div className="text-xs text-muted-foreground font-mono">v2.1</div>
          </div>
        )}
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
};
