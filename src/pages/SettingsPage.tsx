
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Shield, 
  Bell, 
  Palette, 
  Database, 
  Key, 
  Globe,
  ArrowRight
} from 'lucide-react';

const SettingsPage = () => {
  const navigate = useNavigate();

  const settingsCategories = [
    {
      title: 'Organization',
      description: 'Manage your organization profile and basic settings',
      icon: Building2,
      href: '/settings/organization',
      color: 'text-blue-500'
    },
    {
      title: 'User Management',
      description: 'Manage team members, roles, and permissions',
      icon: Users,
      href: '/settings/users',
      color: 'text-green-500'
    },
    {
      title: 'Security',
      description: 'Security settings, authentication, and access control',
      icon: Shield,
      href: '/settings/security',
      color: 'text-red-500'
    },
    {
      title: 'Notifications',
      description: 'Configure notification preferences and channels',
      icon: Bell,
      href: '/settings/notifications',
      color: 'text-yellow-500'
    },
    {
      title: 'Appearance',
      description: 'Customize the look and feel of your dashboard',
      icon: Palette,
      href: '/settings/appearance',
      color: 'text-purple-500'
    },
    {
      title: 'Data & Privacy',
      description: 'Data retention, privacy settings, and GDPR compliance',
      icon: Database,
      href: '/settings/data-privacy',
      color: 'text-indigo-500'
    },
    {
      title: 'API Keys',
      description: 'Manage API keys and integrations',
      icon: Key,
      href: '/settings/api-keys',
      color: 'text-orange-500'
    },
    {
      title: 'Localization',
      description: 'Language, region, and timezone preferences',
      icon: Globe,
      href: '/settings/localization',
      color: 'text-teal-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account preferences and system configuration
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCategories.map((category) => (
          <Card 
            key={category.href} 
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
            onClick={() => navigate(category.href)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-muted/50`}>
                    <category.icon className={`h-5 w-5 ${category.color}`} />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                {category.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common settings and administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start" onClick={() => navigate('/settings/organization')}>
              <Building2 className="mr-2 h-4 w-4" />
              Update Organization Info
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate('/settings/users')}>
              <Users className="mr-2 h-4 w-4" />
              Invite Team Members
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate('/subscription')}>
              <Shield className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
