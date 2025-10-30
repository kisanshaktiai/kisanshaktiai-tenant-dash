import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wand2 } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import LivePreview from './LivePreview';

interface QuickTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const quickThemes: QuickTheme[] = [
  {
    name: 'Neo Minimal',
    colors: { primary: '210 100% 50%', secondary: '140 60% 45%', accent: '280 50% 50%' }
  },
  {
    name: 'Nature Fresh',
    colors: { primary: '120 60% 50%', secondary: '60 60% 50%', accent: '40 60% 50%' }
  },
  {
    name: 'Ocean Depth',
    colors: { primary: '200 100% 50%', secondary: '180 60% 50%', accent: '160 60% 50%' }
  },
  {
    name: 'Dark Elegance',
    colors: { primary: '265 100% 50%', secondary: '265 60% 30%', accent: '45 90% 50%' }
  },
  {
    name: 'Sunrise Warmth',
    colors: { primary: '20 100% 50%', secondary: '40 100% 50%', accent: '60 90% 50%' }
  }
];

interface MobileThemeEditorProps {
  mobileTheme: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    surface_color: string;
    text_color: string;
    border_color: string;
    success_color: string;
    warning_color: string;
    error_color: string;
    info_color: string;
  };
  appName: string;
  logo?: string;
  onChange: (field: string, value: string) => void;
}

export const MobileThemeEditor: React.FC<MobileThemeEditorProps> = ({
  mobileTheme,
  appName,
  logo,
  onChange
}) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  
  const applyQuickTheme = (theme: QuickTheme) => {
    setSelectedTheme(theme.name);
    onChange('primary_color', theme.colors.primary);
    onChange('secondary_color', theme.colors.secondary);
    onChange('accent_color', theme.colors.accent);
    
    // Auto-generate supporting colors
    onChange('success_color', '142 76% 36%');
    onChange('warning_color', '45 93% 47%');
    onChange('error_color', '0 84% 60%');
    onChange('info_color', '199 89% 48%');
  };

  const handleAutoGenerateVariants = () => {
    // Generate semantic colors based on primary
    const baseHue = parseInt(mobileTheme.primary_color.split(' ')[0] || '210');
    onChange('secondary_color', `${baseHue} 60% 35%`);
    onChange('accent_color', `${(baseHue + 180) % 360} 90% 50%`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side - Theme Editor */}
      <div className="space-y-6">
        {/* Quick Start Themes */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start Themes</CardTitle>
            <CardDescription>Select a preset theme to start with</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickThemes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => applyQuickTheme(theme)}
                  className={`text-left p-3 rounded-lg border transition-all hover:shadow-md ${
                    selectedTheme === theme.name 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-1">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                      />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: `hsl(${theme.colors.secondary})` }}
                      />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: `hsl(${theme.colors.accent})` }}
                      />
                    </div>
                  </div>
                  <div className="font-medium text-sm">{theme.name}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Core Theme Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Core Theme Colors</CardTitle>
            <CardDescription>Main brand colors for your mobile app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <ColorPicker
                label="Primary"
                value={`hsl(${mobileTheme.primary_color})`}
                onChange={(color) => {
                  const hsl = color.replace('hsl(', '').replace(')', '');
                  onChange('primary_color', hsl);
                }}
              />
              <ColorPicker
                label="Primary Variant"
                value={`hsl(${mobileTheme.primary_color})`}
                onChange={(color) => {
                  const hsl = color.replace('hsl(', '').replace(')', '');
                  onChange('primary_variant', hsl);
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ColorPicker
                label="Secondary"
                value={`hsl(${mobileTheme.secondary_color})`}
                onChange={(color) => {
                  const hsl = color.replace('hsl(', '').replace(')', '');
                  onChange('secondary_color', hsl);
                }}
              />
              <ColorPicker
                label="Secondary Variant"
                value={`hsl(${mobileTheme.secondary_color})`}
                onChange={(color) => {
                  const hsl = color.replace('hsl(', '').replace(')', '');
                  onChange('secondary_variant', hsl);
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ColorPicker
                label="Tertiary"
                value={`hsl(${mobileTheme.accent_color})`}
                onChange={(color) => {
                  const hsl = color.replace('hsl(', '').replace(')', '');
                  onChange('tertiary_color', hsl);
                }}
              />
              <ColorPicker
                label="Accent"
                value={`hsl(${mobileTheme.accent_color})`}
                onChange={(color) => {
                  const hsl = color.replace('hsl(', '').replace(')', '');
                  onChange('accent_color', hsl);
                }}
              />
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleAutoGenerateVariants}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Auto-generate Variants
            </Button>
          </CardContent>
        </Card>

        {/* Neutral Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Neutral Colors</CardTitle>
            <CardDescription>Background and surface colors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <ColorPicker
                label="Background"
                value={`hsl(${mobileTheme.background_color})`}
                onChange={(color) => {
                  const hsl = color.replace('hsl(', '').replace(')', '');
                  onChange('background_color', hsl);
                }}
              />
              <ColorPicker
                label="Surface"
                value={`hsl(${mobileTheme.surface_color || '0 0% 100%'})`}
                onChange={(color) => {
                  const hsl = color.replace('hsl(', '').replace(')', '');
                  onChange('surface_color', hsl);
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ColorPicker
                label="On Background"
                value={`hsl(${mobileTheme.text_color})`}
                onChange={(color) => {
                  const hsl = color.replace('hsl(', '').replace(')', '');
                  onChange('text_color', hsl);
                }}
              />
              <ColorPicker
                label="On Surface"
                value={`hsl(${mobileTheme.text_color})`}
                onChange={(color) => {
                  const hsl = color.replace('hsl(', '').replace(')', '');
                  onChange('on_surface_color', hsl);
                }}
              />
            </div>

            <ColorPicker
              label="Border"
              value={`hsl(${mobileTheme.border_color || '0 0% 94%'})`}
              onChange={(color) => {
                const hsl = color.replace('hsl(', '').replace(')', '');
                onChange('border_color', hsl);
              }}
            />
          </CardContent>
        </Card>

        {/* Status/Feedback Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Status/Feedback Colors</CardTitle>
            <CardDescription>Colors for system feedback</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <ColorPicker
                label="Success"
                value={`hsl(${mobileTheme.success_color})`}
                onChange={(color) => {
                  const hsl = color.replace('hsl(', '').replace(')', '');
                  onChange('success_color', hsl);
                }}
              />
              <ColorPicker
                label="Warning"
                value={`hsl(${mobileTheme.warning_color})`}
                onChange={(color) => {
                  const hsl = color.replace('hsl(', '').replace(')', '');
                  onChange('warning_color', hsl);
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ColorPicker
                label="Error"
                value={`hsl(${mobileTheme.error_color})`}
                onChange={(color) => {
                  const hsl = color.replace('hsl(', '').replace(')', '');
                  onChange('error_color', hsl);
                }}
              />
              <ColorPicker
                label="Info"
                value={`hsl(${mobileTheme.info_color})`}
                onChange={(color) => {
                  const hsl = color.replace('hsl(', '').replace(')', '');
                  onChange('info_color', hsl);
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Mobile Preview */}
      <div className="lg:sticky lg:top-6">
        <Card>
          <CardHeader>
            <CardTitle>Mobile App Preview</CardTitle>
            <CardDescription>See how your theme looks on a real mobile app</CardDescription>
          </CardHeader>
          <CardContent>
            <LivePreview
              colors={{
                primary: `hsl(${mobileTheme.primary_color})`,
                secondary: `hsl(${mobileTheme.secondary_color})`,
                accent: `hsl(${mobileTheme.accent_color})`,
                background: `hsl(${mobileTheme.background_color})`,
                text: `hsl(${mobileTheme.text_color})`
              }}
              appName={appName}
              logo={logo}
            />
            
            <div className="mt-6 flex justify-center gap-4">
              <Button variant="outline" size="sm">Login</Button>
              <Button variant="default" size="sm">Dashboard</Button>
              <Button variant="secondary" size="sm">List</Button>
              <Button variant="ghost" size="sm">Profile</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileThemeEditor;