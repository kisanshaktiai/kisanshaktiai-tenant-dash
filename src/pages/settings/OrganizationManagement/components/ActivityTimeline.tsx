import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  User, 
  Settings, 
  Shield, 
  Package,
  Users,
  Palette
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityEvent {
  id: string;
  type: 'user' | 'settings' | 'security' | 'product' | 'branding';
  action: string;
  user: string;
  timestamp: Date;
  details?: string;
}

const ActivityTimeline = () => {
  // Mock data - replace with real audit logs from database
  const activities: ActivityEvent[] = [
    {
      id: '1',
      type: 'branding',
      action: 'Updated organization logo',
      user: 'Admin User',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      details: 'Changed primary brand color',
    },
    {
      id: '2',
      type: 'settings',
      action: 'Modified security settings',
      user: 'Admin User',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      details: 'Enabled two-factor authentication',
    },
    {
      id: '3',
      type: 'user',
      action: 'New team member invited',
      user: 'Admin User',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      details: 'Invited john@example.com as Manager',
    },
    {
      id: '4',
      type: 'product',
      action: 'Product catalog updated',
      user: 'Manager',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      details: 'Added 5 new products',
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'settings':
        return <Settings className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'product':
        return <Package className="h-4 w-4" />;
      case 'branding':
        return <Palette className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'settings':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'security':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'product':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'branding':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="relative space-y-4">
            {/* Timeline line */}
            <div className="absolute left-[17px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary/50 via-primary/30 to-transparent" />

            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className="relative pl-10 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon bubble */}
                <div className={`absolute left-0 p-2 rounded-full border ${getColor(activity.type)}`}>
                  {getIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="space-y-1 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    by {activity.user}
                  </p>
                  {activity.details && (
                    <p className="text-xs text-muted-foreground pt-1">
                      {activity.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityTimeline;
