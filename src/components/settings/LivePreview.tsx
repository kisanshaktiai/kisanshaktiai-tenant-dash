import React from 'react';
import { Card } from '@/components/ui/card';

export interface LivePreviewProps {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  appName?: string;
  logo?: string;
}

const LivePreviewComponent: React.FC<LivePreviewProps> = ({ colors, appName = 'AgriTech Platform', logo }) => {
  return (
    <div className="w-full max-w-[320px] mx-auto">
      {/* Desktop/Browser Frame */}
      <div className="bg-gray-900 rounded-t-lg p-1">
        <div className="flex items-center gap-1.5 px-2 py-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <div className="flex-1 mx-4">
            <div className="bg-gray-800 rounded-sm h-4 flex items-center px-2">
              <span className="text-[8px] text-gray-400">app.agritech.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* App Preview */}
      <div 
        className="border-x border-b border-gray-900 rounded-b-lg overflow-hidden"
        style={{ backgroundColor: colors.background }}
      >
        {/* Header */}
        <div 
          className="h-14 px-4 flex items-center justify-between shadow-sm"
          style={{ backgroundColor: colors.primary }}
        >
          <div className="flex items-center gap-2">
            {logo ? (
              <img src={logo} alt="Logo" className="w-8 h-8 rounded object-cover" />
            ) : (
              <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {appName?.charAt(0) || 'A'}
                </span>
              </div>
            )}
            <span className="text-white font-semibold text-sm">{appName}</span>
          </div>
          <div className="flex gap-2">
            <div className="w-5 h-5 bg-white/20 rounded-full" />
            <div className="w-5 h-5 bg-white/20 rounded-full" />
          </div>
        </div>

        {/* Navigation */}
        <div className="border-b border-gray-200 bg-white/80">
          <div className="flex">
            <div 
              className="flex-1 py-2 text-center text-xs font-medium border-b-2"
              style={{ 
                color: colors.primary,
                borderColor: colors.primary 
              }}
            >
              Dashboard
            </div>
            <div className="flex-1 py-2 text-center text-xs text-gray-500">
              Farmers
            </div>
            <div className="flex-1 py-2 text-center text-xs text-gray-500">
              Products
            </div>
            <div className="flex-1 py-2 text-center text-xs text-gray-500">
              Analytics
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 min-h-[300px]">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div 
              className="p-3 rounded-lg text-white"
              style={{ backgroundColor: colors.secondary }}
            >
              <div className="text-[10px] opacity-80">Total Farmers</div>
              <div className="text-lg font-bold">1,234</div>
              <div className="text-[9px] opacity-60">+12% this month</div>
            </div>
            <div 
              className="p-3 rounded-lg text-white"
              style={{ backgroundColor: colors.accent }}
            >
              <div className="text-[10px] opacity-80">Active Campaigns</div>
              <div className="text-lg font-bold">42</div>
              <div className="text-[9px] opacity-60">8 ending soon</div>
            </div>
          </div>

          {/* Activity List */}
          <div className="space-y-2">
            <div className="text-xs font-medium" style={{ color: colors.text }}>
              Recent Activity
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: colors.primary + '20' }}
                />
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 rounded w-3/4" />
                  <div className="h-1.5 bg-gray-100 rounded w-1/2 mt-1" />
                </div>
                <div 
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ 
                    backgroundColor: colors.accent + '20',
                    color: colors.accent 
                  }}
                >
                  New
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <button 
            className="w-full py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: colors.primary }}
          >
            Add New Farmer
          </button>
        </div>
      </div>
    </div>
  );
};

export const LivePreview = React.memo(LivePreviewComponent, (prevProps, nextProps) => {
  return (
    prevProps.colors.primary === nextProps.colors.primary &&
    prevProps.colors.secondary === nextProps.colors.secondary &&
    prevProps.colors.accent === nextProps.colors.accent &&
    prevProps.colors.background === nextProps.colors.background &&
    prevProps.colors.text === nextProps.colors.text &&
    prevProps.appName === nextProps.appName &&
    prevProps.logo === nextProps.logo
  );
});