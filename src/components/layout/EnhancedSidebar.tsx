
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { usePermissions } from '@/hooks/usePermissions';
import { navigationConfig, NavigationItem } from '@/config/navigation';
import {
  Activity,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Zap
} from 'lucide-react';

interface EnhancedSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const SidebarSection: React.FC<{
  title: string;
  items: NavigationItem[];
  isCollapsed: boolean;
}> = ({ title, items, isCollapsed }) => {
  const { hasPermission } = usePermissions();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredItems = items.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  if (!filteredItems.length) return null;

  return (
    <div className="mb-6">
      {!isCollapsed && (
        <div 
          className="flex items-center justify-between px-3 py-2 cursor-pointer group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
            {title}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        </div>
      )}
      
      {(isCollapsed || isExpanded) && (
        <div className="space-y-1 px-2">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.href || 
                           location.pathname.startsWith(item.href + '/');
            
            return (
              <NavLink
                key={item.id}
                to={item.href}
                className={cn(
                  "group relative flex items-center rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                  "hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm",
                  isActive 
                    ? "bg-gradient-to-r from-primary/15 to-primary/10 text-primary font-semibold shadow-sm border-r-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative flex items-center">
                  <item.icon className={cn(
                    "h-5 w-5 transition-all duration-200 flex-shrink-0",
                    isActive ? "text-primary" : "text-current"
                  )} />
                  {item.isNew && (
                    <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber-500 animate-pulse" />
                  )}
                </div>
                
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 ml-3">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <Badge 
                          variant={isActive ? "default" : "secondary"} 
                          className="ml-2 text-xs px-2 py-0.5 h-auto"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {item.description && !isActive && (
                      <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                )}

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                )}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({ 
  isCollapsed, 
  onToggle 
}) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const { userRole } = usePermissions();

  // Group navigation items by category
  const mainItems = navigationConfig.filter(item => item.category === 'main');
  const managementItems = navigationConfig.filter(item => item.category === 'management');
  const analyticsItems = navigationConfig.filter(item => item.category === 'analytics');
  const integrationItems = navigationConfig.filter(item => item.category === 'integrations');
  const settingsItems = navigationConfig.filter(item => item.category === 'settings');

  return (
    <div className={cn(
      "flex flex-col h-full bg-gradient-to-b from-card via-card to-card/95 border-r border-border/50 backdrop-blur-sm transition-all duration-300",
      isCollapsed ? "w-16" : "w-72"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-gradient-to-r from-background/50 to-muted/20">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0 hover:bg-accent rounded-lg"
          >
            {isCollapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
          
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs px-2 py-1">
                Live
              </Badge>
            </div>
          )}
        </div>

        {!isCollapsed ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg border border-primary/20">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-foreground truncate">
                  {currentTenant?.name || 'KisanShakti'}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs px-2 py-0.5 capitalize">
                    {currentTenant?.subscription_plan || 'Free'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
                <span className="font-medium">Live System</span>
              </div>
              <Badge variant="secondary" className="text-xs px-2 py-0.5 capitalize">
                {userRole.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-sm">
                {currentTenant?.name?.charAt(0) || 'K'}
              </span>
            </div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        <SidebarSection title="Dashboard" items={mainItems} isCollapsed={isCollapsed} />
        <SidebarSection title="Management" items={managementItems} isCollapsed={isCollapsed} />
        <SidebarSection title="Analytics" items={analyticsItems} isCollapsed={isCollapsed} />
        <SidebarSection title="Integrations" items={integrationItems} isCollapsed={isCollapsed} />
        <SidebarSection title="Settings" items={settingsItems} isCollapsed={isCollapsed} />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 bg-gradient-to-r from-muted/30 to-background/50">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span className="font-medium">Version 2.1.0</span>
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">Beta</Badge>
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
      </div>
    </div>
  );
};
