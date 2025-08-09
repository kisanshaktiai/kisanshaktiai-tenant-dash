
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  Package, 
  BarChart3, 
  Megaphone, 
  Settings, 
  Puzzle,
  CreditCard,
  ChevronLeft,
  Leaf
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';

interface DashboardSidebarProps {
  isMinimized: boolean;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isMinimized }) => {
  const location = useLocation();
  const { currentTenant } = useAppSelector((state) => state.tenant);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      name: 'Farmers',
      href: '/farmers',
      icon: Users,
      badge: '1.2K'
    },
    {
      name: 'Dealers',
      href: '/dealers',
      icon: Building,
      badge: '45'
    },
    {
      name: 'Products',
      href: '/products',
      icon: Package,
      badge: null
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      badge: null
    },
    {
      name: 'Campaigns',
      href: '/campaigns',
      icon: Megaphone,
      badge: '3'
    },
    {
      name: 'Integrations',
      href: '/integrations',
      icon: Puzzle,
      badge: null
    },
    {
      name: 'Subscription',
      href: '/subscription',
      icon: CreditCard,
      badge: currentTenant?.subscription_plan?.includes('Basic') ? 'Basic' : null
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-card via-card to-card/95 border-r">
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary/80">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isMinimized && (
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                KisanShakti
              </h2>
              <p className="text-xs text-muted-foreground -mt-1">AI Platform</p>
            </div>
          )}
        </div>
      </div>

      {/* Tenant Info */}
      {!isMinimized && currentTenant && (
        <div className="border-b px-4 py-3">
          <div className="text-sm font-medium truncate">{currentTenant.name}</div>
          <div className="text-xs text-muted-foreground capitalize">
            {currentTenant.subscription_plan?.replace('_', ' ')} Plan
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                isMinimized && 'justify-center px-2'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5 flex-shrink-0 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                !isMinimized && 'mr-3'
              )} />
              
              {!isMinimized && (
                <>
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.badge && (
                    <Badge 
                      variant={isActive ? 'default' : 'secondary'} 
                      className="ml-auto text-xs px-1.5 py-0.5"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        {!isMinimized ? (
          <div className="text-center">
            <div className="text-xs text-muted-foreground">
              © 2025 KisanShakti AI
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Powered by Advanced AI
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};
