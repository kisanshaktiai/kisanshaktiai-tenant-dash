import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Leaf, ShoppingBag, User, Menu, Bell, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LivePreviewProps {
  settings: any;
  mode: 'mobile' | 'tablet' | 'desktop';
}

export const LivePreview: React.FC<LivePreviewProps> = ({ settings, mode }) => {
  const getPreviewWidth = () => {
    switch (mode) {
      case 'mobile': return 'max-w-[375px]';
      case 'tablet': return 'max-w-[768px]';
      default: return 'w-full';
    }
  };

  const styles = {
    '--preview-primary': settings.primary_color,
    '--preview-secondary': settings.secondary_color,
    '--preview-accent': settings.accent_color,
    '--preview-background': settings.background_color,
    '--preview-text': settings.text_color,
    '--preview-border': settings.border_color || '#e5e7eb',
    '--preview-muted': settings.muted_color || '#f3f4f6',
    fontFamily: settings.font_family || 'Inter',
  } as React.CSSProperties;

  return (
    <div className={cn("mx-auto", getPreviewWidth())}>
      <div 
        className="rounded-lg overflow-hidden border shadow-lg"
        style={styles}
      >
        {/* App Header */}
        <div 
          className="p-4 flex items-center justify-between"
          style={{ 
            backgroundColor: settings.primary_color,
            color: '#ffffff'
          }}
        >
          <div className="flex items-center gap-3">
            <Menu className="h-5 w-5" />
            {settings.logo_override_url ? (
              <img src={settings.logo_override_url} alt="App Logo" className="h-8 w-auto" />
            ) : (
              <span className="font-bold text-lg">{settings.app_name || 'Farmer App'}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5" />
            <Bell className="h-5 w-5" />
          </div>
        </div>

        {/* App Content */}
        <div 
          className="p-4 space-y-4"
          style={{ 
            backgroundColor: settings.background_color,
            color: settings.text_color 
          }}
        >
          {/* Welcome Section */}
          <Card className="p-4" style={{ borderColor: settings.border_color }}>
            <h2 className="text-lg font-semibold mb-2">Welcome, Farmer!</h2>
            <p className="text-sm opacity-80">{settings.tagline || 'Your agricultural companion'}</p>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Card 
              className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
              style={{ 
                borderColor: settings.border_color,
                backgroundColor: settings.muted_color 
              }}
            >
              <Leaf className="h-8 w-8 mx-auto mb-2" style={{ color: settings.primary_color }} />
              <span className="text-sm font-medium">My Crops</span>
            </Card>
            <Card 
              className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
              style={{ 
                borderColor: settings.border_color,
                backgroundColor: settings.muted_color 
              }}
            >
              <ShoppingBag className="h-8 w-8 mx-auto mb-2" style={{ color: settings.accent_color }} />
              <span className="text-sm font-medium">Products</span>
            </Card>
          </div>

          {/* Info Cards */}
          <Card className="p-4" style={{ borderColor: settings.border_color }}>
            <h3 className="font-medium mb-2">Today's Weather</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">28°C</p>
                <p className="text-sm opacity-80">Partly Cloudy</p>
              </div>
              <div className="text-right">
                <p className="text-sm">Humidity: 65%</p>
                <p className="text-sm">Wind: 12 km/h</p>
              </div>
            </div>
          </Card>

          {/* Action Button */}
          <Button 
            className="w-full"
            style={{ 
              backgroundColor: settings.primary_color,
              color: '#ffffff'
            }}
          >
            View Dashboard
          </Button>
        </div>

        {/* Bottom Navigation */}
        <div 
          className="p-3 flex items-center justify-around border-t"
          style={{ 
            backgroundColor: settings.background_color,
            borderColor: settings.border_color 
          }}
        >
          <button className="flex flex-col items-center gap-1 p-2">
            <Home className="h-5 w-5" style={{ color: settings.primary_color }} />
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2">
            <Leaf className="h-5 w-5" style={{ color: settings.text_color }} />
            <span className="text-xs">Crops</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2">
            <ShoppingBag className="h-5 w-5" style={{ color: settings.text_color }} />
            <span className="text-xs">Shop</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2">
            <User className="h-5 w-5" style={{ color: settings.text_color }} />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};