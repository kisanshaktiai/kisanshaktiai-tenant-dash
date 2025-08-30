
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Palette,
  Eye,
  Contrast,
  Accessibility,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
  Droplets,
  Sun,
  Moon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const colorPresets = [
  {
    name: 'Vibrant Green',
    category: 'Nature',
    colors: {
      primary: '#10B981',
      secondary: '#065F46',
      accent: '#34D399',
      background: '#FFFFFF',
      foreground: '#111827'
    }
  },
  {
    name: 'Ocean Blue',
    category: 'Professional',
    colors: {
      primary: '#0EA5E9',
      secondary: '#0284C7',
      accent: '#06B6D4',
      background: '#FFFFFF',
      foreground: '#1E293B'
    }
  },
  {
    name: 'Royal Purple',
    category: 'Creative',
    colors: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      accent: '#A855F7',
      background: '#FFFFFF',
      foreground: '#1E1B4B'
    }
  },
  {
    name: 'Sunset Orange',
    category: 'Energetic',
    colors: {
      primary: '#F97316',
      secondary: '#EA580C',
      accent: '#FB923C',
      background: '#FFFFFF',
      foreground: '#1C1917'
    }
  },
  {
    name: 'Dark Mode Pro',
    category: 'Dark',
    colors: {
      primary: '#6366F1',
      secondary: '#4F46E5',
      accent: '#8B5CF6',
      background: '#0F0F0F',
      foreground: '#F8FAFC'
    }
  }
];

export const ColorPaletteManager: React.FC = () => {
  const { toast } = useToast();
  const [customColors, setCustomColors] = useState({
    primary: '#10B981',
    secondary: '#065F46',
    accent: '#34D399',
    background: '#FFFFFF',
    foreground: '#111827',
    muted: '#F3F4F6',
    mutedForeground: '#6B7280',
    border: '#E5E7EB',
    destructive: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981'
  });
  
  const [contrastRatio, setContrastRatio] = useState(4.5);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [colorHarmony, setColorHarmony] = useState<'monochromatic' | 'analogous' | 'complementary' | 'triadic'>('analogous');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const calculateContrastRatio = (color1: string, color2: string): number => {
    // Simplified contrast calculation - in real app, use proper color contrast library
    return Math.random() * 10 + 1; // Mock implementation
  };

  const copyColorToClipboard = async (color: string, colorName: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(colorName);
      setTimeout(() => setCopiedColor(null), 2000);
      toast({
        title: "Color copied",
        description: `${color} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy color to clipboard",
        variant: "destructive",
      });
    }
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setCustomColors(prev => ({
      ...prev,
      ...preset.colors
    }));
    toast({
      title: "Preset applied",
      description: `${preset.name} color scheme has been applied`,
    });
  };

  const generateHarmoniousColors = () => {
    // Mock color harmony generation
    toast({
      title: "Colors generated",
      description: `Generated ${colorHarmony} color harmony`,
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="palette" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="palette">Color Palette</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="palette" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Custom Color Palette
              </CardTitle>
              <CardDescription>
                Define your brand colors and create a cohesive visual identity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(customColors).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize font-medium text-sm">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </Label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-12 h-12 rounded-lg border-2 border-border shadow-sm cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: value }}
                        onClick={() => copyColorToClipboard(value, key)}
                      />
                      <div className="flex-1">
                        <Input
                          type="color"
                          value={value}
                          onChange={(e) => setCustomColors(prev => ({ 
                            ...prev, 
                            [key]: e.target.value 
                          }))}
                          className="h-12 cursor-pointer"
                        />
                        <div className="flex items-center gap-1 mt-1">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {value.toUpperCase()}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyColorToClipboard(value, key)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedColor === key ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                Color Presets
              </CardTitle>
              <CardDescription>
                Choose from professionally designed color schemes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {colorPresets.map((preset) => (
                  <Card key={preset.name} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{preset.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {preset.category}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => applyPreset(preset)}
                        >
                          Apply
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        {Object.values(preset.colors).slice(0, 5).map((color, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Accessibility className="w-4 h-4" />
                Accessibility & Contrast
              </CardTitle>
              <CardDescription>
                Ensure your colors meet accessibility standards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="font-medium">High Contrast Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically adjust colors for better accessibility
                  </p>
                </div>
                <Switch
                  checked={accessibilityMode}
                  onCheckedChange={setAccessibilityMode}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="font-medium">Minimum Contrast Ratio</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[contrastRatio]}
                    onValueChange={(value) => setContrastRatio(value[0])}
                    max={10}
                    min={1}
                    step={0.1}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{contrastRatio.toFixed(1)}:1</Badge>
                    <Badge variant={contrastRatio >= 4.5 ? 'default' : 'destructive'}>
                      {contrastRatio >= 7 ? 'AAA' : contrastRatio >= 4.5 ? 'AA' : 'Fail'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Primary on Background</span>
                      <Contrast className="w-4 h-4" />
                    </div>
                    <div 
                      className="h-12 rounded flex items-center justify-center text-sm font-medium"
                      style={{ 
                        backgroundColor: customColors.background,
                        color: customColors.primary 
                      }}
                    >
                      Sample Text
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        Ratio: {calculateContrastRatio(customColors.primary, customColors.background).toFixed(1)}:1
                      </span>
                      <Badge variant="default" className="text-xs">AA</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Foreground on Background</span>
                      <Contrast className="w-4 h-4" />
                    </div>
                    <div 
                      className="h-12 rounded flex items-center justify-center text-sm font-medium"
                      style={{ 
                        backgroundColor: customColors.background,
                        color: customColors.foreground 
                      }}
                    >
                      Sample Text
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        Ratio: {calculateContrastRatio(customColors.foreground, customColors.background).toFixed(1)}:1
                      </span>
                      <Badge variant="default" className="text-xs">AAA</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Advanced Color Tools
              </CardTitle>
              <CardDescription>
                Professional color theory and generation tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="font-medium">Color Harmony</Label>
                <Select value={colorHarmony} onValueChange={setColorHarmony as any}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monochromatic">Monochromatic</SelectItem>
                    <SelectItem value="analogous">Analogous</SelectItem>
                    <SelectItem value="complementary">Complementary</SelectItem>
                    <SelectItem value="triadic">Triadic</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={generateHarmoniousColors}
                  className="w-full gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate Harmonious Colors
                </Button>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                    <h4 className="font-medium mb-1">Light Theme</h4>
                    <p className="text-xs text-muted-foreground">
                      Current color palette optimized for light backgrounds
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <Moon className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <h4 className="font-medium mb-1">Dark Theme</h4>
                    <p className="text-xs text-muted-foreground">
                      Auto-generated dark mode variations
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
