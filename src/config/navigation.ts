
import {
  LayoutDashboard,
  Users,
  Package,
  Store,
  Megaphone,
  BarChart3,
  Settings,
  Zap,
  User,
  Building2,
  UserPlus,
  CreditCard
} from 'lucide-react';
import { Permission } from '@/types/permissions';

export interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon: any;
  permission?: Permission;
  badge?: string;
  description?: string;
  category: 'main' | 'management' | 'analytics' | 'settings' | 'integrations';
  isNew?: boolean;
  children?: NavigationItem[];
}

export const navigationConfig: NavigationItem[] = [
  // Main Dashboard
  {
    id: 'dashboard',
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and insights',
    category: 'main'
  },

  // Core Management
  {
    id: 'farmers',
    title: 'Farmer Management',
    href: '/farmers',
    icon: Users,
    permission: 'farmers.view' as const,
    badge: 'Live',
    description: 'Manage farmer network',
    category: 'management'
  },
  {
    id: 'products',
    title: 'Product Catalog',
    href: '/products',
    icon: Package,
    permission: 'products.view' as const,
    description: 'Product & inventory management',
    category: 'management'
  },
  {
    id: 'dealers',
    title: 'Dealer Network',
    href: '/dealers',
    icon: Store,
    permission: 'dealers.view' as const,
    description: 'Distribution network',
    category: 'management'
  },
  {
    id: 'campaigns',
    title: 'Campaign Center',
    href: '/campaigns',
    icon: Megaphone,
    permission: 'campaigns.view' as const,
    description: 'Marketing campaigns',
    category: 'management'
  },

  // Analytics & Reports
  {
    id: 'analytics',
    title: 'Analytics Suite',
    href: '/analytics',
    icon: BarChart3,
    permission: 'analytics.view' as const,
    description: 'Data insights & reports',
    category: 'analytics'
  },

  // Integrations
  {
    id: 'integrations',
    title: 'Integrations',
    href: '/integrations',
    icon: Zap,
    permission: 'integrations.view' as const,
    badge: 'New',
    description: 'API & third-party connections',
    category: 'integrations',
    isNew: true
  },

  // Settings & Configuration
  {
    id: 'profile',
    title: 'Profile',
    href: '/profile',
    icon: User,
    description: 'User profile & settings',
    category: 'settings'
  },
  {
    id: 'settings',
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    permission: 'settings.view' as const,
    description: 'System configuration',
    category: 'settings',
    children: [
      {
        id: 'organization',
        title: 'Organization',
        href: '/settings/organization',
        icon: Building2,
        description: 'Organization settings',
        category: 'settings'
      },
      {
        id: 'users',
        title: 'User Management',
        href: '/settings/users',
        icon: UserPlus,
        description: 'Team & permissions',
        category: 'settings'
      }
    ]
  },
  {
    id: 'subscription',
    title: 'Subscription',
    href: '/subscription',
    icon: CreditCard,
    description: 'Billing & plans',
    category: 'settings'
  }
];

export const getNavigationByCategory = (category: string) => {
  return navigationConfig.filter(item => item.category === category);
};

export const getAllNavigationItems = () => {
  const flatItems: NavigationItem[] = [];
  
  navigationConfig.forEach(item => {
    flatItems.push(item);
    if (item.children) {
      flatItems.push(...item.children);
    }
  });
  
  return flatItems;
};
