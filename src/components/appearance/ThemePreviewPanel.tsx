
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Monitor,
  Tablet,
  Smartphone,
  BarChart3,
  Users,
  TrendingUp,
  Bell,
  Search,
  Menu,
  Home,
  Settings
} from 'lucide-react';

interface ThemePreviewPanelProps {
  device: 'desktop' | 'tablet' | 'mobile';
}

export const ThemePreviewPanel: React.FC<ThemePreviewPanelProps> = ({ device }) => {
  const getDeviceClass = () => {
    switch (device) {
      case 'mobile':
        return 'w-80 h-96';
      case 'tablet':
        return 'w-96 h-80';
      default:
        return 'w-full h-96';
    }
  };

  const getDeviceIcon = () => {
    switch (device) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getDeviceIcon()}
          Theme Preview - {device.charAt(0).toUpperCase() + device.slice(1)}
        </CardTitle>
        <CardDescription>
          Real-time preview of your theme changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`${getDeviceClass()} border rounded-lg overflow-hidden bg-background shadow-inner`}>
          {/* Mock Dashboard Content */}
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b bg-background">
              <div className="flex items-center gap-2">
                <Menu className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">AgriTech Dashboard</h3>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">JD</AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-3 space-y-3 overflow-hidden">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-2">
                <Card className="p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                      <Users className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">1,234</p>
                      <p className="text-xs text-muted-foreground">Farmers</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-accent/20 rounded flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">89%</p>
                      <p className="text-xs text-muted-foreground">Growth</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Chart Area */}
              <Card className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium">Performance</h4>
                  <BarChart3 className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Engagement</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-1" />
                  <div className="flex items-center justify-between text-xs">
                    <span>Adoption</span>
                    <span>60%</span>
                  </div>
                  <Progress value={60} className="h-1" />
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" className="text-xs h-8">
                  Add Farmer
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-8">
                  View Reports
                </Button>
              </div>

              {/* Bottom Navigation (Mobile) */}
              {device === 'mobile' && (
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around p-2 border-t bg-background">
                  <Home className="w-4 h-4 text-primary" />
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  <Settings className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Controls */}
        <div className="mt-4 flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            Live Preview
          </Badge>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">Real-time updates</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
