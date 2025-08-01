
import { 
  Building, 
  Heart, 
  GraduationCap, 
  Landmark, 
  Users, 
  Plus,
  User,
  Building2,
  Briefcase,
  Factory,
  DollarSign,
  Clock,
  Calendar,
  Zap,
  Timer
} from 'lucide-react';
import { SelectionOption } from '../types/LeadFormTypes';

export const ORGANIZATION_TYPE_OPTIONS: SelectionOption[] = [
  {
    value: 'Agri_Company',
    label: 'Agricultural Company',
    icon: Building,
    description: 'Commercial farming, agri-business',
    color: 'emerald'
  },
  {
    value: 'NGO',
    label: 'NGO',
    icon: Heart,
    description: 'Non-profit, social impact',
    color: 'rose'
  },
  {
    value: 'University',
    label: 'University/Research',
    icon: GraduationCap,
    description: 'Academic, research institution',
    color: 'blue'
  },
  {
    value: 'Government',
    label: 'Government Agency',
    icon: Landmark,
    description: 'Public sector, policy',
    color: 'indigo'
  },
  {
    value: 'Co-Operative',
    label: 'Cooperative',
    icon: Users,
    description: 'Farmer groups, collectives',
    color: 'amber'
  },
  {
    value: 'other',
    label: 'Other',
    icon: Plus,
    description: 'Tell us about your organization',
    color: 'gray'
  }
];

export const COMPANY_SIZE_OPTIONS: SelectionOption[] = [
  {
    value: '1-10',
    label: '1-10 employees',
    icon: User,
    description: 'Startup, small team'
  },
  {
    value: '11-50',
    label: '11-50 employees',
    icon: Users,
    description: 'Growing business'
  },
  {
    value: '51-200',
    label: '51-200 employees',
    icon: Building2,
    description: 'Mid-size company'
  },
  {
    value: '201-1000',
    label: '201-1000 employees',
    icon: Briefcase,
    description: 'Large organization'
  },
  {
    value: '1000+',
    label: '1000+ employees',
    icon: Factory,
    description: 'Enterprise scale'
  }
];

export const BUDGET_RANGE_OPTIONS: SelectionOption[] = [
  {
    value: 'under_50k',
    label: 'Under ₹ 50,000',
    icon: DollarSign,
    description: 'Small pilot project',
    color: 'green'
  },
  {
    value: '50k_100k',
    label: '₹ 50,000 - ₹ 1,00,000',
    icon: DollarSign,
    description: 'Standard implementation',
    color: 'blue'
  },
  {
    value: '100k_1000k',
    label: '₹ 1,00,000 - ₹ 10,00,000',
    icon: DollarSign,
    description: 'Comprehensive solution',
    color: 'purple'
  },
  {
    value: '1000k_plus',
    label: '₹ 10,00,000+',
    icon: DollarSign,
    description: 'Enterprise deployment',
    color: 'amber'
  }
];

export const TIMELINE_OPTIONS: SelectionOption[] = [
  {
    value: 'immediate',
    label: 'Immediate',
    icon: Zap,
    description: 'Within 1 month',
    color: 'red'
  },
  {
    value: '1_month',
    label: '1-2 months',
    icon: Timer,
    description: 'Quick deployment',
    color: 'orange'
  },
  {
    value: '3_months',
    label: '3-6 months',
    icon: Clock,
    description: 'Planned rollout',
    color: 'blue'
  },
  {
    value: '6_months',
    label: '6+ months',
    icon: Calendar,
    description: 'Long-term planning',
    color: 'green'
  },
  {
    value: 'flexible',
    label: 'Flexible timeline',
    icon: Clock,
    description: 'Still exploring options',
    color: 'gray'
  }
];
