
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Layout,
  Maximize,
  Square,
  Circle,
  Triangle,
  CornerUpLeft,
  Move,
  Grid,
  Layers,
  Eye
} from 'lucide-react';

export const LayoutCustomizer: React.FC = () => {
  const [layout, setLayout] = useState({
    spacing: {
      container: 24,
      section: 32,
      component: 16,
      element: 8
    },
    borderRadius: {
      small: 4,
      medium: 8,
      large: 12,
      extraLarge: 16
    },
    shadows: {
      small: true,
      medium: true,
      large: false,
      glow: false
    },
    maxWidth: 'xl',
    sidebarWidth: 280,
    headerHeight: 64,
    gridGap: 24,
    animations: true
  });

  const spacingPresets = [
    { name: 'Compact', multiplier: 0.75 },
    { name: 'Default', multiplier: 1 },
    { name: 'Comfortable', multiplier: 1.25 },
    { name: 'Spacious', multiplier: 1.5 }
  ];

  const borderRadiusPresets = [
    { name: 'Sharp', multiplier: 0 },
    { name: 'Subtle', multiplier: 0.5 },
    { name: 'Rounded', multiplier: 1 },
    { name: 'Very Rounded', multiplier: 1.5 }
  ];

  const applySpacingPreset = (preset: typeof spacingPresets[0]) => {
    setLayout(prev => ({
      ...prev,
      spacing: {
        container: Math.round(24 * preset.multiplier),
        section: Math.round(32 * preset.multiplier),
        component: Math.round(16 * preset.multiplier),
        element: Math.round(8 * preset.multiplier)
      }
    }));
  };

  const applyBorderRadiusPreset = (preset: typeof borderRadiusPresets[0]) => {
    if (preset.multiplier === 0) {
      setLayout(prev => ({
        ...prev,
        borderRadius: { small: 0, medium: 0, large: 0, extraLarge: 0 }
      }));
    } else {
      setLayout(prev => ({
        ...prev,
        borderRadius: {
          small: Math.round(4 * preset.multiplier),
          medium: Math.round(8 * preset.multiplier),
          large: Math.round(12 * preset.multiplier),
          extraLarge: Math.round(16 * preset.multiplier)
        }
      }));
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="spacing" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="spacing">Spacing</TabsTrigger>
          <TabsTrigger value="borders">Borders</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="effects">Effects</TabsTrigger>
        </TabsList>

        <TabsContent value="spacing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Move className="w-4 h-4" />
                  Spacing System
                </CardTitle>
                <CardDescription>
                  Control the spacing between elements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Container Padding: {layout.spacing.container}px</Label>
                  <Slider
                    value={[layout.spacing.container]}
                    onValueChange={(value) => setLayout(prev => ({ 
                      ...prev, 
                      spacing: { ...prev.spacing, container: value[0] } 
                    }))}
                    min={8}
                    max={48}
                    step={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Section Spacing: {layout.spacing.section}px</Label>
                  <Slider
                    value={[layout.spacing.section]}
                    onValueChange={(value) => setLayout(prev => ({ 
                      ...prev, 
                      spacing: { ...prev.spacing, section: value[0] } 
                    }))}
                    min={16}
                    max={64}
                    step={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Component Gap: {layout.spacing.component}px</Label>
                  <Slider
                    value={[layout.spacing.component]}
                    onValueChange={(value) => setLayout(prev => ({ 
                      ...prev, 
                      spacing: { ...prev.spacing, component: value[0] } 
                    }))}
                    min={4}
                    max={32}
                    step={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Element Margin: {layout.spacing.element}px</Label>
                  <Slider
                    value={[layout.spacing.element]}
                    onValueChange={(value) => setLayout(prev => ({ 
                      ...prev, 
                      spacing: { ...prev.spacing, element: value[0] } 
                    }))}
                    min={2}
                    max={16}
                    step={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spacing Presets</CardTitle>
                <CardDescription>
                  Quick spacing configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {spacingPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    onClick={() => applySpacingPreset(preset)}
                    className="w-full justify-between"
                  >
                    <span>{preset.name}</span>
                    <Badge variant="secondary">{preset.multiplier}x</Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="borders" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CornerUpLeft className="w-4 h-4" />
                  Border Radius
                </CardTitle>
                <CardDescription>
                  Customize corner roundness
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Small Radius: {layout.borderRadius.small}px</Label>
                  <Slider
                    value={[layout.borderRadius.small]}
                    onValueChange={(value) => setLayout(prev => ({ 
                      ...prev, 
                      borderRadius: { ...prev.borderRadius, small: value[0] } 
                    }))}
                    min={0}
                    max={12}
                    step={2}
                  />
                  <div 
                    className="w-full h-8 bg-primary/20 border-2 border-primary"
                    style={{ borderRadius: `${layout.borderRadius.small}px` }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Medium Radius: {layout.borderRadius.medium}px</Label>
                  <Slider
                    value={[layout.borderRadius.medium]}
                    onValueChange={(value) => setLayout(prev => ({ 
                      ...prev, 
                      borderRadius: { ...prev.borderRadius, medium: value[0] } 
                    }))}
                    min={0}
                    max={20}
                    step={2}
                  />
                  <div 
                    className="w-full h-8 bg-primary/20 border-2 border-primary"
                    style={{ borderRadius: `${layout.borderRadius.medium}px` }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Large Radius: {layout.borderRadius.large}px</Label>
                  <Slider
                    value={[layout.borderRadius.large]}
                    onValueChange={(value) => setLayout(prev => ({ 
                      ...prev, 
                      borderRadius: { ...prev.borderRadius, large: value[0] } 
                    }))}
                    min={0}
                    max={24}
                    step={2}
                  />
                  <div 
                    className="w-full h-8 bg-primary/20 border-2 border-primary"
                    style={{ borderRadius: `${layout.borderRadius.large}px` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Border Presets</CardTitle>
                <CardDescription>
                  Quick border radius styles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {borderRadiusPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    onClick={() => applyBorderRadiusPreset(preset)}
                    className="w-full justify-between"
                  >
                    <span>{preset.name}</span>
                    <div className="flex gap-1">
                      {preset.multiplier === 0 ? (
                        <Square className="w-4 h-4" />
                      ) : preset.multiplier <= 0.5 ? (
                        <Square className="w-4 h-4" />
                      ) : preset.multiplier <= 1 ? (
                        <Circle className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-4 h-4" />
                  Layout Dimensions
                </CardTitle>
                <CardDescription>
                  Control main layout dimensions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Max Content Width</Label>
                  <Select 
                    value={layout.maxWidth} 
                    onValueChange={(value) => setLayout(prev => ({ ...prev, maxWidth: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Small (640px)</SelectItem>
                      <SelectItem value="md">Medium (768px)</SelectItem>
                      <SelectItem value="lg">Large (1024px)</SelectItem>
                      <SelectItem value="xl">Extra Large (1280px)</SelectItem>
                      <SelectItem value="2xl">2XL (1536px)</SelectItem>
                      <SelectItem value="full">Full Width</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sidebar Width: {layout.sidebarWidth}px</Label>
                  <Slider
                    value={[layout.sidebarWidth]}
                    onValueChange={(value) => setLayout(prev => ({ ...prev, sidebarWidth: value[0] }))}
                    min={200}
                    max={400}
                    step={20}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Header Height: {layout.headerHeight}px</Label>
                  <Slider
                    value={[layout.headerHeight]}
                    onValueChange={(value) => setLayout(prev => ({ ...prev, headerHeight: value[0] }))}
                    min={48}
                    max={96}
                    step={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Grid Gap: {layout.gridGap}px</Label>
                  <Slider
                    value={[layout.gridGap]}
                    onValueChange={(value) => setLayout(prev => ({ ...prev, gridGap: value[0] }))}
                    min={8}
                    max={48}
                    step={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Layout Preview
                </CardTitle>
                <CardDescription>
                  Visualize your layout configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="grid grid-cols-12 gap-2 mb-4">
                    {/* Header */}
                    <div 
                      className="col-span-12 bg-primary/20 rounded"
                      style={{ 
                        height: `${layout.headerHeight / 4}px`,
                        borderRadius: `${layout.borderRadius.small}px`
                      }}
                    />
                    
                    {/* Sidebar + Content */}
                    <div 
                      className="col-span-3 bg-secondary/20 rounded"
                      style={{ 
                        height: '80px',
                        borderRadius: `${layout.borderRadius.medium}px`
                      }}
                    />
                    <div 
                      className="col-span-9 bg-accent/20 rounded grid grid-cols-2 gap-1 p-2"
                      style={{ 
                        borderRadius: `${layout.borderRadius.medium}px`,
                        gap: `${layout.gridGap / 8}px`
                      }}
                    >
                      <div 
                        className="bg-background rounded"
                        style={{ borderRadius: `${layout.borderRadius.small}px` }}
                      />
                      <div 
                        className="bg-background rounded"
                        style={{ borderRadius: `${layout.borderRadius.small}px` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Badge variant="outline" className="text-xs">
                      Max Width: {layout.maxWidth}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="effects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Visual Effects
              </CardTitle>
              <CardDescription>
                Control shadows, animations, and visual enhancements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Shadow Effects</Label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(layout.shadows).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="capitalize">{key} Shadow</Label>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => setLayout(prev => ({
                          ...prev,
                          shadows: { ...prev.shadows, [key]: checked }
                        }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Smooth Animations</Label>
                  <p className="text-sm text-muted-foreground">Enable smooth transitions and micro-interactions</p>
                </div>
                <Switch
                  checked={layout.animations}
                  onCheckedChange={(checked) => setLayout(prev => ({ ...prev, animations: checked }))}
                />
              </div>

              {/* Shadow Preview */}
              <div className="space-y-3">
                <Label>Shadow Preview</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg bg-background border ${layout.shadows.small ? 'shadow-sm' : ''}`}>
                    <p className="text-sm">Small Shadow</p>
                  </div>
                  <div className={`p-4 rounded-lg bg-background border ${layout.shadows.medium ? 'shadow-md' : ''}`}>
                    <p className="text-sm">Medium Shadow</p>
                  </div>
                  <div className={`p-4 rounded-lg bg-background border ${layout.shadows.large ? 'shadow-lg' : ''}`}>
                    <p className="text-sm">Large Shadow</p>
                  </div>
                  <div className={`p-4 rounded-lg bg-background border ${layout.shadows.glow ? 'shadow-2xl shadow-primary/20' : ''}`}>
                    <p className="text-sm">Glow Effect</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
