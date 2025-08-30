
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';

const fontFamilies = [
  { name: 'Inter', category: 'Sans Serif', googleFont: true },
  { name: 'Roboto', category: 'Sans Serif', googleFont: true },
  { name: 'Open Sans', category: 'Sans Serif', googleFont: true },
  { name: 'Poppins', category: 'Sans Serif', googleFont: true },
  { name: 'Lato', category: 'Sans Serif', googleFont: true },
  { name: 'Montserrat', category: 'Sans Serif', googleFont: true },
  { name: 'Source Sans Pro', category: 'Sans Serif', googleFont: true },
  { name: 'Nunito', category: 'Sans Serif', googleFont: true },
  { name: 'Playfair Display', category: 'Serif', googleFont: true },
  { name: 'Merriweather', category: 'Serif', googleFont: true },
  { name: 'Lora', category: 'Serif', googleFont: true },
  { name: 'Source Serif Pro', category: 'Serif', googleFont: true },
  { name: 'JetBrains Mono', category: 'Monospace', googleFont: true },
  { name: 'Fira Code', category: 'Monospace', googleFont: true },
  { name: 'Source Code Pro', category: 'Monospace', googleFont: true }
];

const fontPairings = [
  {
    name: 'Modern Professional',
    heading: 'Inter',
    body: 'Inter',
    accent: 'JetBrains Mono'
  },
  {
    name: 'Classic Elegance',
    heading: 'Playfair Display',
    body: 'Source Sans Pro',
    accent: 'Source Code Pro'
  },
  {
    name: 'Contemporary Bold',
    heading: 'Montserrat',
    body: 'Open Sans',
    accent: 'Fira Code'
  },
  {
    name: 'Friendly Approachable',
    heading: 'Poppins',
    body: 'Nunito',
    accent: 'Source Code Pro'
  }
];

export const TypographyManager: React.FC = () => {
  const [typography, setTypography] = useState({
    headingFont: 'Inter',
    bodyFont: 'Inter',
    accentFont: 'JetBrains Mono',
    headingSize: 32,
    bodySize: 16,
    lineHeight: 1.5,
    letterSpacing: 0,
    fontWeight: {
      heading: 600,
      body: 400,
      accent: 500
    }
  });

  const [previewText, setPreviewText] = useState({
    heading: 'Transform Your Agricultural Business',
    subheading: 'Manage your farmers, track performance, and grow your network',
    body: 'Our comprehensive platform provides everything you need to scale your agricultural operations efficiently.',
    accent: 'console.log("Hello World");'
  });

  const applyFontPairing = (pairing: typeof fontPairings[0]) => {
    setTypography(prev => ({
      ...prev,
      headingFont: pairing.heading,
      bodyFont: pairing.body,
      accentFont: pairing.accent
    }));
  };

  const resetToDefaults = () => {
    setTypography({
      headingFont: 'Inter',
      bodyFont: 'Inter',
      accentFont: 'JetBrains Mono',
      headingSize: 32,
      bodySize: 16,
      lineHeight: 1.5,
      letterSpacing: 0,
      fontWeight: {
        heading: 600,
        body: 400,
        accent: 500
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Typography Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Font Selection
              </CardTitle>
              <CardDescription>
                Choose fonts for different text elements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Heading Font</Label>
                <Select 
                  value={typography.headingFont} 
                  onValueChange={(value) => setTypography(prev => ({ ...prev, headingFont: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((font) => (
                      <SelectItem key={font.name} value={font.name}>
                        <div className="flex items-center justify-between w-full">
                          <span style={{ fontFamily: font.name }}>{font.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {font.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Body Font</Label>
                <Select 
                  value={typography.bodyFont} 
                  onValueChange={(value) => setTypography(prev => ({ ...prev, bodyFont: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((font) => (
                      <SelectItem key={font.name} value={font.name}>
                        <div className="flex items-center justify-between w-full">
                          <span style={{ fontFamily: font.name }}>{font.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {font.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Accent Font (Code, Captions)</Label>
                <Select 
                  value={typography.accentFont} 
                  onValueChange={(value) => setTypography(prev => ({ ...prev, accentFont: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((font) => (
                      <SelectItem key={font.name} value={font.name}>
                        <div className="flex items-center justify-between w-full">
                          <span style={{ fontFamily: font.name }}>{font.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {font.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography Scale</CardTitle>
              <CardDescription>
                Adjust font sizes and spacing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Heading Size: {typography.headingSize}px</Label>
                <Slider
                  value={[typography.headingSize]}
                  onValueChange={(value) => setTypography(prev => ({ ...prev, headingSize: value[0] }))}
                  min={24}
                  max={48}
                  step={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Body Size: {typography.bodySize}px</Label>
                <Slider
                  value={[typography.bodySize]}
                  onValueChange={(value) => setTypography(prev => ({ ...prev, bodySize: value[0] }))}
                  min={12}
                  max={20}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Line Height: {typography.lineHeight}</Label>
                <Slider
                  value={[typography.lineHeight]}
                  onValueChange={(value) => setTypography(prev => ({ ...prev, lineHeight: value[0] }))}
                  min={1.2}
                  max={2.0}
                  step={0.1}
                />
              </div>

              <div className="space-y-2">
                <Label>Letter Spacing: {typography.letterSpacing}px</Label>
                <Slider
                  value={[typography.letterSpacing]}
                  onValueChange={(value) => setTypography(prev => ({ ...prev, letterSpacing: value[0] }))}
                  min={-2}
                  max={4}
                  step={0.1}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Font Pairings</CardTitle>
              <CardDescription>
                Professional font combinations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {fontPairings.map((pairing) => (
                <div
                  key={pairing.name}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => applyFontPairing(pairing)}
                >
                  <div>
                    <h4 className="font-medium text-sm">{pairing.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {pairing.heading} + {pairing.body}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Apply
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Preview
              </CardTitle>
              <CardDescription>
                See how your typography choices look in practice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 border rounded-lg bg-background">
                <h1 
                  style={{
                    fontFamily: typography.headingFont,
                    fontSize: `${typography.headingSize}px`,
                    fontWeight: typography.fontWeight.heading,
                    lineHeight: typography.lineHeight,
                    letterSpacing: `${typography.letterSpacing}px`,
                    marginBottom: '12px'
                  }}
                >
                  {previewText.heading}
                </h1>
                
                <h2 
                  style={{
                    fontFamily: typography.headingFont,
                    fontSize: `${typography.headingSize * 0.7}px`,
                    fontWeight: typography.fontWeight.body,
                    lineHeight: typography.lineHeight,
                    letterSpacing: `${typography.letterSpacing}px`,
                    marginBottom: '16px',
                    color: 'hsl(var(--muted-foreground))'
                  }}
                >
                  {previewText.subheading}
                </h2>
                
                <p 
                  style={{
                    fontFamily: typography.bodyFont,
                    fontSize: `${typography.bodySize}px`,
                    fontWeight: typography.fontWeight.body,
                    lineHeight: typography.lineHeight,
                    letterSpacing: `${typography.letterSpacing}px`,
                    marginBottom: '16px'
                  }}
                >
                  {previewText.body}
                </p>
                
                <code 
                  style={{
                    fontFamily: typography.accentFont,
                    fontSize: `${typography.bodySize * 0.9}px`,
                    fontWeight: typography.fontWeight.accent,
                    padding: '8px 12px',
                    backgroundColor: 'hsl(var(--muted))',
                    borderRadius: '4px',
                    display: 'block'
                  }}
                >
                  {previewText.accent}
                </code>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full gap-2">
                <Download className="w-4 h-4" />
                Export Typography CSS
              </Button>
              <Button variant="outline" onClick={resetToDefaults} className="w-full gap-2">
                <RefreshCw className="w-4 h-4" />
                Reset to Defaults
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
