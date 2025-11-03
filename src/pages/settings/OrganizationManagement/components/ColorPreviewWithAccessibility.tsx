import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertCircle } from 'lucide-react';

interface ColorPreviewProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

const ColorPreviewWithAccessibility = ({ primaryColor, secondaryColor, accentColor }: ColorPreviewProps) => {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const getLuminance = (hex: string) => {
    const rgb = hexToRgb(hex);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const rLum = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gLum = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bLum = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    return 0.2126 * rLum + 0.7152 * gLum + 0.0722 * bLum;
  };

  const getContrastRatio = (color1: string, color2: string) => {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const checkAccessibility = useMemo(() => {
    const white = '#ffffff';
    const black = '#000000';

    const primaryOnWhite = getContrastRatio(primaryColor, white);
    const primaryOnBlack = getContrastRatio(primaryColor, black);
    const secondaryOnWhite = getContrastRatio(secondaryColor, white);
    const accentOnWhite = getContrastRatio(accentColor, white);

    return {
      primaryOnWhite: {
        ratio: primaryOnWhite.toFixed(2),
        wcagAA: primaryOnWhite >= 4.5,
        wcagAAA: primaryOnWhite >= 7,
      },
      primaryOnBlack: {
        ratio: primaryOnBlack.toFixed(2),
        wcagAA: primaryOnBlack >= 4.5,
        wcagAAA: primaryOnBlack >= 7,
      },
      secondaryOnWhite: {
        ratio: secondaryOnWhite.toFixed(2),
        wcagAA: secondaryOnWhite >= 4.5,
        wcagAAA: secondaryOnWhite >= 7,
      },
      accentOnWhite: {
        ratio: accentOnWhite.toFixed(2),
        wcagAA: accentOnWhite >= 4.5,
        wcagAAA: accentOnWhite >= 7,
      },
    };
  }, [primaryColor, secondaryColor, accentColor]);

  const AccessibilityBadge = ({ passed, level }: { passed: boolean; level: string }) => (
    <Badge variant={passed ? 'default' : 'secondary'} className="text-xs">
      {passed ? (
        <Check className="h-3 w-3 mr-1" />
      ) : (
        <X className="h-3 w-3 mr-1" />
      )}
      {level}
    </Badge>
  );

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Color Preview & Accessibility
        </CardTitle>
        <CardDescription>
          Check contrast ratios and WCAG compliance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Preview */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Live Preview</p>
          <div className="grid gap-3">
            <div
              className="p-6 rounded-lg border-2 animate-fade-in"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="space-y-2">
                <p className="text-white font-semibold text-lg">Primary Color</p>
                <p className="text-white/80 text-sm">Sample text on primary background</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div
                className="p-4 rounded-lg border animate-fade-in"
                style={{ backgroundColor: secondaryColor, animationDelay: '100ms' }}
              >
                <p className="text-white font-medium">Secondary</p>
              </div>
              <div
                className="p-4 rounded-lg border animate-fade-in"
                style={{ backgroundColor: accentColor, animationDelay: '200ms' }}
              >
                <p className="text-white font-medium">Accent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contrast Ratios */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Contrast Ratios (WCAG 2.1)</p>
          <div className="space-y-3">
            {/* Primary on White */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Primary on White</span>
                <span className="text-xs text-muted-foreground">
                  {checkAccessibility.primaryOnWhite.ratio}:1
                </span>
              </div>
              <div className="flex gap-2">
                <AccessibilityBadge
                  passed={checkAccessibility.primaryOnWhite.wcagAA}
                  level="AA"
                />
                <AccessibilityBadge
                  passed={checkAccessibility.primaryOnWhite.wcagAAA}
                  level="AAA"
                />
              </div>
            </div>

            {/* Primary on Black */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Primary on Black</span>
                <span className="text-xs text-muted-foreground">
                  {checkAccessibility.primaryOnBlack.ratio}:1
                </span>
              </div>
              <div className="flex gap-2">
                <AccessibilityBadge
                  passed={checkAccessibility.primaryOnBlack.wcagAA}
                  level="AA"
                />
                <AccessibilityBadge
                  passed={checkAccessibility.primaryOnBlack.wcagAAA}
                  level="AAA"
                />
              </div>
            </div>

            {/* Secondary on White */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Secondary on White</span>
                <span className="text-xs text-muted-foreground">
                  {checkAccessibility.secondaryOnWhite.ratio}:1
                </span>
              </div>
              <div className="flex gap-2">
                <AccessibilityBadge
                  passed={checkAccessibility.secondaryOnWhite.wcagAA}
                  level="AA"
                />
                <AccessibilityBadge
                  passed={checkAccessibility.secondaryOnWhite.wcagAAA}
                  level="AAA"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Guidelines */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs space-y-1">
          <p className="font-medium text-blue-600 dark:text-blue-400">Accessibility Guidelines:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-600/80 dark:text-blue-400/80 ml-2">
            <li>AA: Minimum contrast 4.5:1 (normal text)</li>
            <li>AAA: Enhanced contrast 7:1 (normal text)</li>
            <li>Ensure buttons and interactive elements meet AA standards</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorPreviewWithAccessibility;
