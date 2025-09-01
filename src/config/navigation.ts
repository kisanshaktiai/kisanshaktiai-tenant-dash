
import { LucideIcon, 
  LayoutDashboard, 
  Users, 
  Package, 
  UserCheck, 
  Megaphone, 
  BarChart3, 
  Plug, 
  Settings, 
  User,
  CreditCard,
  Building2,
  Palette,
  UserCog
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  category: 'main' | 'management' | 'analytics' | 'integrations' | 'settings';
  permission?: string;
  badge?: string;
  isNew?: boolean;
}

export const navigationConfig: NavigationItem[] = [
  // Main Dashboard
  {
    id: 'dashboard',
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and key metrics',
    category: 'main'
  },

  // Management
  {
    id: 'farmers',
    title: 'Farmers',
    href: '/farmers',
    icon: Users,
    description: 'Manage farmer network',
    category: 'management'
  },
  {
    id: 'products',
    title: 'Products',
    href: '/products',
    icon: Package,
    description: 'Product catalog management',
    category: 'management'
  },
  {
    id: 'dealers',
    title: 'Dealers',
    href: '/dealers',
    icon: UserCheck,
    description: 'Dealer network management',
    category: 'management'
  },
  {
    id: 'campaigns',
    title: 'Campaigns',
    href: '/campaigns',
    icon: Megaphone,
    description: 'Marketing campaigns',
    category: 'management',
    badge: 'New'
  },

  // Analytics
  {
    id: 'analytics',
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Reports and insights',
    category: 'analytics'
  },

  // Integrations
  {
    id: 'integrations',
    title: 'Integrations',
    href: '/integrations',
    icon: Plug,
    description: 'Third-party integrations',
    category: 'integrations'
  },

  // Settings
  {
    id: 'profile',
    title: 'Profile',
    href: '/profile',
    icon: User,
    description: 'Personal profile settings',
    category: 'settings'
  },
  {
    id: 'settings',
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Application settings',
    category: 'settings'
  },
  {
    id: 'organization',
    title: 'Organization',
    href: '/settings/organization',
    icon: Building2,
    description: 'Organization settings',
    category: 'settings'
  },
  {
    id: 'appearance',
    title: 'Appearance',
    href: '/settings/appearance',
    icon: Palette,
    description: 'Theme and appearance',
    category: 'settings'
  },
  {
    id: 'users',
    title: 'User Management',
    href: '/settings/users',
    icon: UserCog,
    description: 'Manage team members',
    category: 'settings',
    permission: 'manage_users'
  },
  {
    id: 'subscription',
    title: 'Subscription',
    href: '/subscription',
    icon: CreditCard,
    description: 'Billing and subscription',
    category: 'settings'
  }
];
