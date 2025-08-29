
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAppSelector } from '@/store/hooks';
import { usePermissions } from '@/hooks/usePermissions';
import { navigationConfig, NavigationItem } from '@/config/navigation';
import {
  ChevronDown,
  ChevronRight,
  Activity,
  Sparkles
} from 'lucide-react';

interface ModernSidebarProps {
  isMinimized?: boolean;
  onToggleMinimized?: () => void;
}

const SidebarSection: React.FC<{
  title: string;
  items: NavigationItem[];
  isMinimized: boolean;
}> = ({ title, items, isMinimized }) => {
  const location = useLocation();
  const { hasPermission } = usePermissions();

  if (!items.length) return null;

  return (
    <div className="space-y-1">
      {!isMinimized && (
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
            {title}
          </h3>
        </div>
      )}
      <div className="space-y-1">
        {items.map((item) => (
          <SidebarItem 
            key={item.id} 
            item={item} 
            isMinimized={isMinimized}
            isActive={location.pathname === item.href || location.pathname.startsWith(item.href + '/')}
            hasPermission={!item.permission || hasPermission(item.permission)}
          />
        ))}
      </div>
    </div>
  );
};

const SidebarItem: React.FC<{
  item: NavigationItem;
  isMinimized: boolean;
  isActive: boolean;
  hasPermission: boolean;
}> = ({ item, isMinimized, isActive, hasPermission }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (!hasPermission) return null;

  const ItemContent = (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative",
      "hover:bg-accent/50 hover:text-accent-foreground",
      isActive 
        ? "bg-primary/10 text-primary border-r-2 border-primary font-medium shadow-sm" 
        : "text-muted-foreground hover:text-foreground",
      isMinimized ? "justify-center px-2" : "justify-start"
    )}>
      <div className="relative">
        <item.icon className={cn(
          "transition-all duration-200",
          isMinimized ? "h-5 w-5" : "h-4 w-4",
          isActive ? "text-primary" : "text-current"
        )} />
        {item.isNew && (
          <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber-500 animate-pulse" />
        )}
      </div>
      
      {!isMinimized && (
        <>
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
            {item.description && (
              <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">
                {item.description}
              </p>
            )}
          </div>
          
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0.5 hover:bg-transparent"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(!isOpen);
              }}
            >
              {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          )}
        </>
      )}
    </div>
  );

  if (hasChildren && !isMinimized) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-1">
        <CollapsibleTrigger asChild>
          <button className="w-full text-left">
            {ItemContent}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-4 space-y-1 border-l border-border/30 pl-3">
          {item.children?.map((child) => (
            <NavLink
              key={child.id}
              to={child.href}
              className={({ isActive: childActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200",
                "hover:bg-accent/30 hover:text-accent-foreground",
                childActive
                  ? "bg-primary/5 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <child.icon className="h-3.5 w-3.5" />
              <span>{child.title}</span>
            </NavLink>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  const content = isMinimized ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink to={item.href} className="block">
          {ItemContent}
        </NavLink>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex flex-col gap-1">
        <span className="font-medium">{item.title}</span>
        {item.description && (
          <span className="text-xs text-muted-foreground">{item.description}</span>
        )}
      </TooltipContent>
    </Tooltip>
  ) : (
    <NavLink to={item.href} className="block">
      {ItemContent}
    </NavLink>
  );

  return content;
};

export const ModernSidebar: React.FC<ModernSidebarProps> = ({ 
  isMinimized = false 
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
      "flex flex-col h-full bg-gradient-to-b from-card via-card to-card/95 border-r transition-all duration-300 shadow-sm",
      isMinimized ? "w-16" : "w-72"
    )}>
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-background/50 to-muted/20">
        {!isMinimized ? (
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
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-6">
          <SidebarSection title="Dashboard" items={mainItems} isMinimized={isMinimized} />
          <SidebarSection title="Management" items={managementItems} isMinimized={isMinimized} />
          <SidebarSection title="Analytics" items={analyticsItems} isMinimized={isMinimized} />
          <SidebarSection title="Integrations" items={integrationItems} isMinimized={isMinimized} />
          <SidebarSection title="Settings" items={settingsItems} isMinimized={isMinimized} />
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-gradient-to-r from-muted/30 to-background/50">
        {!isMinimized ? (
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
      </div>
    </div>
  );
};
