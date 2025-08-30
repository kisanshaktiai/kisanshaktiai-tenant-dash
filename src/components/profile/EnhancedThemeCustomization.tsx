
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useTenantTheme } from '@/contexts/TenantThemeContext';
import { useToast } from '@/hooks/use-toast';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Eye,
  RefreshCw,
  Wand2,
  Paintbrush2,
  Contrast,
  Save,
  Smartphone
} from 'lucide-react';

const presetThemes = [
  {
    name: 'Default Green',
    primary: '142 76% 36%',
    secondary: '142 76% 30%',
    accent: '160 76% 42%',
    background: '0 0% 100%',
    foreground: '222 84% 5%'
  },
  {
    name: 'Ocean Blue',
    primary: '199 89% 48%',
    secondary: '200 89% 42%',
    accent: '201 89% 54%',
    background: '0 0% 100%',
    foreground: '222 84% 5%'
  },
  {
    name: 'Sunset Orange',
    primary: '24 95% 53%',
    secondary: '21 95% 47%',
    accent: '27 95% 59%',
    background: '0 0% 100%',
    foreground: '222 84% 5%'
  },
  {
    name: 'Royal Purple',
    primary: '262 83% 58%',
    secondary: '263 83% 52%',
    accent: '261 83% 64%',
    background: '0 0% 100%',
    foreground: '222 84% 5%'
  },
  {
    name: 'Rose Pink',
    primary: '346 77% 50%',
    secondary: '347 77% 44%',
    accent: '345 77% 56%',
    background: '0 0% 100%',
    foreground: '222 84% 5%'
  },
  {
    name: 'Dark Mode',
    primary: '142 76% 36%',
    secondary: '142 76% 30%',
    accent: '160 76% 42%',
    background: '222 84% 5%',
    foreground: '210 40% 98%'
  }
];

const fontOptions = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Poppins',
  'Lato',
  'Montserrat',
  'Source Sans Pro',
  'Nunito'
];

export const EnhancedThemeCustomization: React.FC = () => {
  const { theme: systemTheme, setTheme: setSystemTheme } = useTheme();
  const { theme, updateTheme, resetTheme, isLoading } = useTenantTheme();
  const { toast } = useToast();
  
  const [localTheme, setLocalTheme] = useState(theme);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleColorChange = (colorType: keyof typeof localTheme, value: string) => {
    const newTheme = { ...localTheme, [colorType]: value };
    setLocalTheme(newTheme);
    setHasUnsavedChanges(true);
    
    if (previewMode) {
      applyPreviewTheme(newTheme);
    }
  };

  const applyPreviewTheme = (themeToApply: typeof localTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', themeToApply.primary);
    root.style.setProperty('--secondary', themeToApply.secondary);
    root.style.setProperty('--accent', themeToApply.accent);
    root.style.setProperty('--background', themeToApply.background);
    root.style.setProperty('--foreground', themeToApply.foreground);
    root.style.setProperty('--font-family', themeToApply.fontFamily);
  };

  const handlePresetSelect = (preset: typeof presetThemes[0]) => {
    const newTheme = {
      ...localTheme,
      primary: preset.primary,
      secondary: preset.secondary,
      accent: preset.accent,
      background: preset.background,
      foreground: preset.foreground
    };
    setLocalTheme(newTheme);
    setHasUnsavedChanges(true);
    
    if (previewMode) {
      applyPreviewTheme(newTheme);
    }
  };

  const handlePreviewToggle = (enabled: boolean) => {
    setPreviewMode(enabled);
    if (enabled) {
      applyPreviewTheme(localTheme);
    } else {
      // Reset to current saved theme
      applyPreviewTheme(theme);
    }
  };

  const handleSave = async () => {
    try {
      await updateTheme(localTheme);
      setHasUnsavedChanges(false);
      toast({
        title: "Theme updated successfully",
        description: "Your custom theme has been saved and applied across the portal.",
      });
    } catch (error) {
      toast({
        title: "Failed to update theme",
        description: "There was an error saving your theme preferences.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    resetTheme();
    setLocalTheme(theme);
    setHasUnsavedChanges(false);
    toast({
      title: "Theme reset",
      description: "Theme has been reset to default values.",
    });
  };

  // Convert HSL to hex for color inputs
  const hslToHex = (hsl: string): string => {
    const [h, s, l] = hsl.split(' ').map((val, i) => {
      if (i === 0) return parseInt(val) / 360;
      return parseInt(val.replace('%', '')) / 100;
    });

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 1/6) {
      r = c; g = x; b = 0;
    } else if (1/6 <= h && h < 2/6) {
      r = x; g = c; b = 0;
    } else if (2/6 <= h && h < 3/6) {
      r = 0; g = c; b = x;
    } else if (3/6 <= h && h < 4/6) {
      r = 0; g = x; b = c;
    } else if (4/6 <= h && h < 5/6) {
      r = x; g = 0; b = c;
    } else if (5/6 <= h && h < 1) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* System Theme Mode */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Contrast className="w-5 h-5 text-primary" />
            <CardTitle>System Theme Mode</CardTitle>
          </div>
          <CardDescription>
            Choose between light, dark, or system preference
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'system', label: 'System', icon: Monitor }
            ].map((themeOption) => (
              <Button
                key={themeOption.value}
                variant={systemTheme === themeOption.value ? 'default' : 'outline'}
                onClick={() => setSystemTheme(themeOption.value as any)}
                className="h-20 flex-col gap-2"
              >
                <themeOption.icon className="w-5 h-5" />
                <span className="text-sm">{themeOption.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tenant Brand Customization */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <CardTitle>Brand Customization</CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="preview-mode" className="text-sm">Live Preview</Label>
                <Switch
                  id="preview-mode"
                  checked={previewMode}
                  onCheckedChange={handlePreviewToggle}
                />
              </div>
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="gap-1">
                  <Eye className="w-3 h-3" />
                  Unsaved Changes
                </Badge>
              )}
            </div>
          </div>
          <CardDescription>
            Customize your tenant portal's brand colors and typography
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Customization */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(localTheme).filter(([key]) => key !== 'fontFamily').map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="capitalize text-sm font-medium">
                  {key.replace(/([A-Z])/g, ' $1')}
                </Label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-10 h-10 rounded-lg border shadow-sm"
                    style={{ backgroundColor: `hsl(${value})` }}
                  />
                  <Input
                    id={key}
                    type="color"
                    value={hslToHex(value)}
                    onChange={(e) => {
                      const hex = e.target.value;
                      const hsl = hexToHsl(hex);
                      handleColorChange(key as keyof typeof localTheme, hsl);
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Preset Themes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-primary" />
              <Label className="text-sm font-medium">Preset Themes</Label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {presetThemes.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  onClick={() => handlePresetSelect(preset)}
                  className="h-auto p-3 flex-col gap-2 hover:scale-[1.02] transition-all"
                >
                  <div className="flex gap-1">
                    {[preset.primary, preset.secondary, preset.accent].map((color, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: `hsl(${color})` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium">{preset.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Typography */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Paintbrush2 className="w-4 h-4 text-primary" />
              <Label className="text-sm font-medium">Typography</Label>
            </div>
            <Select 
              value={localTheme.fontFamily} 
              onValueChange={(value) => handleColorChange('fontFamily', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font family" />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mobile App Preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary" />
              <Label className="text-sm font-medium">Mobile App Impact</Label>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                These theme changes will automatically apply to your white-label farmer mobile app. 
                The app will reflect your brand colors and typography for a consistent experience.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2"
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4" />
              Reset to Default
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isLoading || !hasUnsavedChanges}
                className="gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to convert hex to HSL
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
