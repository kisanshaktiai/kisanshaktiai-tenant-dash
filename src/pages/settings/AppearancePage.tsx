
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAppearanceSettings } from '@/hooks/useAppearanceSettings';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Upload,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle
} from 'lucide-react';

const presetColors = [
  { 
    name: 'Emerald (Default)', 
    primary: '#10b981', 
    secondary: '#059669', 
    accent: '#14b8a6',
    description: 'Fresh green theme perfect for agriculture'
  },
  { 
    name: 'Ocean Blue', 
    primary: '#3b82f6', 
    secondary: '#2563eb', 
    accent: '#1d4ed8',
    description: 'Professional blue theme'
  },
  { 
    name: 'Royal Purple', 
    primary: '#8b5cf6', 
    secondary: '#7c3aed', 
    accent: '#6d28d9',
    description: 'Modern purple theme'
  },
  { 
    name: 'Sunset Orange', 
    primary: '#f97316', 
    secondary: '#ea580c', 
    accent: '#c2410c',
    description: 'Warm orange theme'
  },
  { 
    name: 'Rose Pink', 
    primary: '#f43f5e', 
    secondary: '#e11d48', 
    accent: '#be123c',
    description: 'Elegant rose theme'
  },
  { 
    name: 'Forest Teal', 
    primary: '#14b8a6', 
    secondary: '#0d9488', 
    accent: '#0f766e',
    description: 'Calm teal theme'
  }
];

const fontOptions = [
  { name: 'Inter (Default)', value: 'Inter' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Open Sans', value: 'Open Sans' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Lato', value: 'Lato' },
  { name: 'Montserrat', value: 'Montserrat' }
];

const AppearancePage = () => {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, isLoading, isUpdating } = useAppearanceSettings();
  const [previewMode, setPreviewMode] = useState(false);

  const handleColorChange = (colorType: string, value: string) => {
    updateSettings({
      [colorType]: value
    });
  };

  const handlePresetSelect = (preset: typeof presetColors[0]) => {
    console.log('Applying color preset:', preset);
    updateSettings({
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      accent_color: preset.accent
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement actual file upload to storage
      updateSettings({
        logo_override_url: URL.createObjectURL(file)
      });
    }
  };

  const handleReset = () => {
    updateSettings({
      theme_mode: 'system',
      primary_color: '#10b981',
      secondary_color: '#059669',
      accent_color: '#14b8a6',
      background_color: '#ffffff',
      text_color: '#1f2937',
      font_family: 'Inter',
      success_color: '#10b981',
      warning_color: '#f59e0b',
      info_color: '#3b82f6',
      destructive_color: '#ef4444',
      logo_override_url: null
    });
  };

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader title="Appearance" description="Customize the look and feel of your dashboard" />
        <PageContent>
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader 
        title="Appearance" 
        description="Customize colors, theme, and branding for your tenant dashboard"
      />
      
      <PageContent className="space-y-8">
        {/* Theme Mode */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              Theme Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'light', label: 'Light', icon: Sun, desc: 'Clean white interface' },
                { value: 'dark', label: 'Dark', icon: Moon, desc: 'Modern dark interface' },
                { value: 'system', label: 'System', icon: Monitor, desc: 'Follow system preference' }
              ].map((themeOption) => (
                <Button
                  key={themeOption.value}
                  variant={theme === themeOption.value ? 'default' : 'outline'}
                  onClick={() => {
                    setTheme(themeOption.value as any);
                    updateSettings({ theme_mode: themeOption.value as any });
                  }}
                  className="h-24 flex-col gap-2 p-4"
                  disabled={isUpdating}
                >
                  <themeOption.icon className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-medium">{themeOption.label}</div>
                    <div className="text-xs text-muted-foreground">{themeOption.desc}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Primary Color Customization */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Primary Colors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Color Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { key: 'primary_color', label: 'Primary Color', description: 'Main brand color' },
                { key: 'secondary_color', label: 'Secondary Color', description: 'Supporting brand color' },
                { key: 'accent_color', label: 'Accent Color', description: 'Highlight color' }
              ].map(({ key, label, description }) => (
                <div key={key} className="space-y-3">
                  <div>
                    <Label className="font-medium">{label}</Label>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl border-2 shadow-medium ring-2 ring-offset-2 ring-primary/20"
                      style={{ backgroundColor: settings?.[key as keyof typeof settings] || '#10b981' }}
                    />
                    <Input
                      type="color"
                      value={settings?.[key as keyof typeof settings] || '#10b981'}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="flex-1 h-12"
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Color Presets */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Color Presets</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presetColors.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    onClick={() => handlePresetSelect(preset)}
                    className="h-auto p-4 flex items-center gap-4 hover:scale-[1.02] transition-all justify-start"
                    disabled={isUpdating}
                  >
                    <div className="flex gap-2">
                      {[preset.primary, preset.secondary, preset.accent].map((color, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-lg border-2 shadow-sm ring-1 ring-black/5"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-sm text-muted-foreground">{preset.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Semantic Colors */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="w-5 h-5" />
              Semantic Colors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  key: 'success_color', 
                  label: 'Success', 
                  icon: CheckCircle,
                  description: 'Success states',
                  defaultColor: '#10b981'
                },
                { 
                  key: 'warning_color', 
                  label: 'Warning', 
                  icon: AlertTriangle,
                  description: 'Warning states',
                  defaultColor: '#f59e0b'
                },
                { 
                  key: 'info_color', 
                  label: 'Info', 
                  icon: Info,
                  description: 'Information states',
                  defaultColor: '#3b82f6'
                },
                { 
                  key: 'destructive_color', 
                  label: 'Error', 
                  icon: XCircle,
                  description: 'Error states',
                  defaultColor: '#ef4444'
                }
              ].map(({ key, label, icon: Icon, description, defaultColor }) => (
                <div key={key} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <div>
                      <Label className="font-medium">{label}</Label>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded-lg border shadow-sm"
                      style={{ backgroundColor: settings?.[key as keyof typeof settings] || defaultColor }}
                    />
                    <Input
                      type="color"
                      value={settings?.[key as keyof typeof settings] || defaultColor}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="flex-1"
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logo Override */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Custom Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Upload Custom Logo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                disabled={isUpdating}
              />
              {settings?.logo_override_url && (
                <div className="mt-3 p-4 border-2 border-dashed border-muted rounded-xl bg-muted/30">
                  <img 
                    src={settings.logo_override_url} 
                    alt="Custom logo preview" 
                    className="h-16 object-contain"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Typography</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Label>Font Family</Label>
              <Select 
                value={settings?.font_family || 'Inter'} 
                onValueChange={(value) => updateSettings({ font_family: value })}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select font family" />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t bg-card/50 rounded-lg p-6">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isUpdating}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset to Default
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="preview-mode"
                checked={previewMode}
                onCheckedChange={setPreviewMode}
                disabled={isUpdating}
              />
              <Label htmlFor="preview-mode" className="text-sm flex items-center gap-1">
                {previewMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Live Preview
              </Label>
            </div>
            
            {isUpdating && (
              <Badge variant="secondary" className="gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Saving...
              </Badge>
            )}
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default AppearancePage;
