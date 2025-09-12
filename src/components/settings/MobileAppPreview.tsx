import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Home, Menu, Search, Settings, User, ChevronRight, Package, TrendingUp, MapPin } from 'lucide-react';

interface MobileAppPreviewProps {
  theme: any;
  deviceType: 'iphone' | 'android' | 'tablet';
  appName?: string;
  logoUrl?: string;
}

export const MobileAppPreview: React.FC<MobileAppPreviewProps> = ({
  theme,
  deviceType = 'iphone',
  appName = 'Your App',
  logoUrl
}) => {
  const getDeviceFrame = () => {
    switch (deviceType) {
      case 'iphone':
        return 'w-[375px] h-[667px] rounded-[30px] border-8 border-gray-800';
      case 'android':
        return 'w-[375px] h-[667px] rounded-[20px] border-8 border-gray-700';
      case 'tablet':
        return 'w-[500px] h-[700px] rounded-[20px] border-8 border-gray-800';
      default:
        return 'w-[375px] h-[667px] rounded-[30px] border-8 border-gray-800';
    }
  };

  const getCoreColor = (colorKey: string) => {
    return theme?.core?.[colorKey] ? `hsl(${theme.core[colorKey]})` : '#ccc';
  };

  const getNeutralColor = (colorKey: string) => {
    return theme?.neutral?.[colorKey] ? `hsl(${theme.neutral[colorKey]})` : '#ccc';
  };

  const getStatusColor = (colorKey: string) => {
    return theme?.status?.[colorKey] ? `hsl(${theme.status[colorKey]})` : '#ccc';
  };

  return (
    <div className="flex justify-center">
      <div className={`${getDeviceFrame()} bg-black relative overflow-hidden`}>
        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-black flex justify-between items-center px-6 text-white text-xs">
          <span>9:41</span>
          <div className="flex gap-1">
            <div className="w-4 h-3 border border-white rounded-sm" />
            <div className="w-4 h-3 bg-white rounded-sm" />
            <div className="w-1 h-3 bg-white rounded-sm" />
          </div>
        </div>

        {/* App Content */}
        <div 
          className="h-full pt-6 overflow-y-auto"
          style={{ backgroundColor: getNeutralColor('background') }}
        >
          {/* Header */}
          <div 
            className="px-4 py-3 shadow-sm"
            style={{ backgroundColor: getCoreColor('primary') }}
          >
            <div className="flex items-center justify-between">
              <Menu className="w-6 h-6" style={{ color: getNeutralColor('surface') }} />
              <div className="flex items-center gap-2">
                {logoUrl && (
                  <img src={logoUrl} alt={appName} className="w-8 h-8 rounded" />
                )}
                <span className="font-semibold text-lg" style={{ color: getNeutralColor('surface') }}>
                  {appName}
                </span>
              </div>
              <Bell className="w-6 h-6" style={{ color: getNeutralColor('surface') }} />
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4">
            <div 
              className="flex items-center gap-2 p-3 rounded-lg"
              style={{ backgroundColor: getNeutralColor('surface') }}
            >
              <Search className="w-5 h-5" style={{ color: getNeutralColor('on_surface') }} />
              <input 
                type="text" 
                placeholder="Search..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: getNeutralColor('on_surface') }}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: Package, label: 'Products' },
                { icon: TrendingUp, label: 'Analytics' },
                { icon: MapPin, label: 'Farms' },
                { icon: User, label: 'Profile' }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg"
                  style={{ backgroundColor: getNeutralColor('surface') }}
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: getCoreColor('accent') }}
                  >
                    <item.icon className="w-6 h-6" style={{ color: getNeutralColor('surface') }} />
                  </div>
                  <span className="text-xs" style={{ color: getNeutralColor('on_surface') }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cards Section */}
          <div className="px-4 space-y-3">
            {/* Info Card */}
            <div 
              className="p-4 rounded-lg shadow-sm"
              style={{ backgroundColor: getNeutralColor('surface') }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold" style={{ color: getNeutralColor('on_surface') }}>
                  Today's Overview
                </h3>
                <ChevronRight className="w-5 h-5" style={{ color: getCoreColor('primary') }} />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: getStatusColor('success') }}>
                    24
                  </div>
                  <div className="text-xs" style={{ color: getNeutralColor('on_surface') }}>
                    Active
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: getStatusColor('warning') }}>
                    8
                  </div>
                  <div className="text-xs" style={{ color: getNeutralColor('on_surface') }}>
                    Pending
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: getStatusColor('info') }}>
                    156
                  </div>
                  <div className="text-xs" style={{ color: getNeutralColor('on_surface') }}>
                    Total
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button 
                className="w-full py-3 rounded-lg font-medium"
                style={{ 
                  backgroundColor: getCoreColor('primary'),
                  color: getNeutralColor('surface')
                }}
              >
                Primary Action
              </button>
              <button 
                className="w-full py-3 rounded-lg font-medium border"
                style={{ 
                  borderColor: getCoreColor('secondary'),
                  color: getCoreColor('secondary'),
                  backgroundColor: 'transparent'
                }}
              >
                Secondary Action
              </button>
            </div>

            {/* List Items */}
            <div 
              className="rounded-lg overflow-hidden"
              style={{ backgroundColor: getNeutralColor('surface') }}
            >
              {['Item 1', 'Item 2', 'Item 3'].map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 border-b last:border-0"
                  style={{ borderColor: getNeutralColor('border') }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full"
                      style={{ backgroundColor: getCoreColor('tertiary') }}
                    />
                    <div>
                      <div className="font-medium" style={{ color: getNeutralColor('on_surface') }}>
                        {item}
                      </div>
                      <div className="text-xs" style={{ color: getNeutralColor('on_surface'), opacity: 0.7 }}>
                        Description text
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: getNeutralColor('on_surface'), opacity: 0.5 }} />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div 
            className="absolute bottom-0 left-0 right-0 flex justify-around items-center py-2 border-t"
            style={{ 
              backgroundColor: getNeutralColor('surface'),
              borderColor: getNeutralColor('border')
            }}
          >
            {[Home, Search, Package, User, Settings].map((Icon, idx) => (
              <button 
                key={idx}
                className="p-2"
              >
                <Icon 
                  className="w-6 h-6" 
                  style={{ 
                    color: idx === 0 ? getCoreColor('primary') : getNeutralColor('on_surface')
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};