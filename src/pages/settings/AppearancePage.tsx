
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';
import { useAppearanceSettings } from '@/hooks/useAppearanceSettings';
import { AppearanceSettingsUpdate } from '@/services/AppearanceSettingsService';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Upload,
  RefreshCw,
  Eye,
  Paintbrush2,
  Image
} from 'lucide-react';

const themePresets = [
  {
    name: 'Ocean Blue',
    primary: '#0ea5e9',
    secondary: '#0284c7', 
    accent: '#06b6d4',
    background: '#ffffff',
    text: '#1e293b'
  },
  {
    name: 'Forest Green',
    primary: '#10b981',
    secondary: '#059669',
    accent: '#14b8a6', 
    background: '#ffffff',
    text: '#1f2937'
  },
  {
    name: 'Sunset Orange',
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#f59e0b',
    background: '#ffffff', 
    text: '#1c1917'
  },
  {
    name: 'Royal Purple',
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#a855f7',
    background: '#ffffff',
    text: '#1e1b4b'
  }
];

export default function AppearancePage() {
  const { settings, isLoading, updateSettings, isUpdating } = useAppearanceSettings();
  const [previewMode, setPreviewMode] = useState(false);
  const [localSettings, setLocalSettings] = useState<AppearanceSettingsUpdate>({});

  // Initialize local settings when component mounts or settings change
  React.useEffect(() => {
    if (settings) {
      setLocalSettings({
        theme_mode: settings.theme_mode,
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        accent_color: settings.accent_color,
        background_color: settings.background_color,
        text_color: settings.text_color,
        font_family: settings.font_family,
        logo_override_url: settings.logo_override_url
      });
    }
  }, [settings]);

  const handleSettingChange = (key: keyof AppearanceSettingsUpdate, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    
    if (previewMode) {
      applyPreviewStyles(newSettings);
    }
  };

  const applyPreviewStyles = (settingsToApply: AppearanceSettingsUpdate) => {
    const root = document.documentElement;
    if (settingsToApply.primary_color) root.style.setProperty('--primary', settingsToApply.primary_color);
    if (settingsToApply.secondary_color) root.style.setProperty('--secondary', settingsToApply.secondary_color);
    if (settingsToApply.accent_color) root.style.setProperty('--accent', settingsToApply.accent_color);
    if (settingsToApply.background_color) root.style.setProperty('--background', settingsToApply.background_color);
    if (settingsToApply.text_color) root.style.setProperty('--foreground', settingsToApply.text_color);
  };

  const handlePresetSelect = (preset: typeof themePresets[0]) => {
    const presetSettings = {
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      accent_color: preset.accent,
      background_color: preset.background,
      text_color: preset.text
    };
    
    setLocalSettings(prev => ({ ...prev, ...presetSettings }));
    
    if (previewMode) {
      applyPreviewStyles(presetSettings);
    }
  };

  const handleSave = () => {
    updateSettings(localSettings);
  };

  const handleReset = () => {
    const defaultSettings = {
      theme_mode: 'system' as const,
      primary_color: '#10b981',
      secondary_color: '#059669', 
      accent_color: '#14b8a6',
      background_color: '#ffffff',
      text_color: '#1f2937',
      font_family: 'Inter'
    };
    
    setLocalSettings(defaultSettings);
    
    if (previewMode) {
      applyPreviewStyles(defaultSettings);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader title="Appearance" description="Customize your dashboard appearance" />
        <PageContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader 
        title="Appearance" 
        description="Customize the look and feel of your dashboard"
      />

      <PageContent className="space-y-6">
        {/* Theme Mode */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              <CardTitle>Theme Mode</CardTitle>
            </div>
            <CardDescription>
              Choose between light, dark, or system theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'system', label: 'System', icon: Monitor }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={localSettings.theme_mode === option.value ? 'default' : 'outline'}
                  onClick={() => handleSettingChange('theme_mode', option.value)}
                  className="h-20 flex-col gap-2"
                >
                  <option.icon className="w-5 h-5" />
                  <span className="text-sm">{option.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Color Customization */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                <CardTitle>Colors</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="preview-mode" className="text-sm">Live Preview</Label>
                <Switch
                  id="preview-mode"
                  checked={previewMode}
                  onCheckedChange={setPreviewMode}
                />
              </div>
            </div>
            <CardDescription>
              Customize the color scheme for your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Color Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'primary_color', label: 'Primary Color' },
                { key: 'secondary_color', label: 'Secondary Color' },
                { key: 'accent_color', label: 'Accent Color' },
                { key: 'background_color', label: 'Background Color' },
                { key: 'text_color', label: 'Text Color' }
              ].map((color) => (
                <div key={color.key} className="space-y-2">
                  <Label className="text-sm font-medium">{color.label}</Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded-lg border shadow-sm"
                      style={{ backgroundColor: localSettings[color.key as keyof AppearanceSettingsUpdate] as string }}
                    />
                    <Input
                      type="color"
                      value={localSettings[color.key as keyof AppearanceSettingsUpdate] as string || '#000000'}
                      onChange={(e) => handleSettingChange(color.key as keyof AppearanceSettingsUpdate, e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Theme Presets */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Theme Presets</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {themePresets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    onClick={() => handlePresetSelect(preset)}
                    className="h-auto p-3 flex-col gap-2"
                  >
                    <div className="flex gap-1">
                      {[preset.primary, preset.secondary, preset.accent].map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium">{preset.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography & Logo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Paintbrush2 className="w-5 h-5 text-primary" />
                <CardTitle>Typography</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Font Family</Label>
                <Select 
                  value={localSettings.font_family || 'Inter'} 
                  onValueChange={(value) => handleSettingChange('font_family', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter (Default)</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                <CardTitle>Logo Override</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Logo URL (Optional)</Label>
                <Input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={localSettings.logo_override_url || ''}
                  onChange={(e) => handleSettingChange('logo_override_url', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Override the default logo with a custom image
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleReset}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Default
              </Button>
              
              <div className="flex gap-2 items-center">
                {previewMode && (
                  <Badge variant="secondary" className="gap-1">
                    <Eye className="w-3 h-3" />
                    Live Preview Active
                  </Badge>
                )}
                <Button
                  onClick={handleSave}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Palette className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageContent>
    </PageLayout>
  );
}
