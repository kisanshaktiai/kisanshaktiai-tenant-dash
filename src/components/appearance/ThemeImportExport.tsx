
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  Upload,
  FileText,
  Copy,
  Check,
  Share,
  BookOpen,
  AlertCircle,
  Palette,
  Code
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ThemeImportExport: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [themeJson, setThemeJson] = useState('');

  const sampleThemeJson = `{
  "name": "AgriTech Pro",
  "version": "1.0.0",
  "colors": {
    "primary": "#10B981",
    "secondary": "#065F46",
    "accent": "#34D399",
    "background": "#FFFFFF",
    "foreground": "#111827"
  },
  "typography": {
    "headingFont": "Inter",
    "bodyFont": "Inter",
    "accentFont": "JetBrains Mono"
  },
  "layout": {
    "borderRadius": 8,
    "spacing": 16,
    "shadows": true
  }
}`;

  const handleExportTheme = async () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          
          // Create and download file
          const themeData = {
            name: "Custom Theme",
            version: "1.0.0",
            timestamp: new Date().toISOString(),
            colors: {
              primary: "#10B981",
              secondary: "#065F46",
              accent: "#34D399"
            },
            typography: {
              headingFont: "Inter",
              bodyFont: "Inter"
            }
          };
          
          const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'custom-theme.json';
          a.click();
          URL.revokeObjectURL(url);
          
          toast({
            title: "Theme exported successfully",
            description: "Your theme configuration has been downloaded",
          });
          
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  const handleImportTheme = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      const text = await file.text();
      const themeData = JSON.parse(text);
      
      // Validate theme structure
      if (!themeData.colors || !themeData.name) {
        throw new Error('Invalid theme format');
      }
      
      setThemeJson(JSON.stringify(themeData, null, 2));
      
      toast({
        title: "Theme imported successfully",
        description: `${themeData.name} theme has been loaded`,
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Invalid theme file format",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const copyThemeCode = async () => {
    try {
      await navigator.clipboard.writeText(sampleThemeJson);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast({
        title: "Code copied",
        description: "Theme JSON copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareTheme = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Custom Theme',
        text: 'Check out this custom theme configuration',
        url: window.location.href
      });
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Theme URL copied to clipboard",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Import & Export
          </CardTitle>
          <CardDescription>
            Save, share, and load theme configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Export Section */}
          <div className="space-y-3">
            <Label className="font-medium">Export Theme</Label>
            <Button
              onClick={handleExportTheme}
              disabled={isExporting}
              className="w-full gap-2"
            >
              {isExporting ? (
                <>
                  <Download className="w-4 h-4 animate-pulse" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Theme
                </>
              )}
            </Button>
            {isExporting && (
              <div className="space-y-2">
                <Progress value={exportProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  Preparing theme file... {exportProgress}%
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Import Section */}
          <div className="space-y-3">
            <Label className="font-medium">Import Theme</Label>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full gap-2"
            >
              {isImporting ? (
                <>
                  <Upload className="w-4 h-4 animate-pulse" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Theme File
                </>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportTheme}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">
              Supports .json theme files
            </p>
          </div>

          <Separator />

          {/* Share Section */}
          <div className="space-y-3">
            <Label className="font-medium">Share Theme</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={shareTheme} className="gap-2">
                <Share className="w-4 h-4" />
                Share
              </Button>
              <Button variant="outline" className="gap-2" disabled>
                <BookOpen className="w-4 h-4" />
                Gallery
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Theme Code
          </CardTitle>
          <CardDescription>
            Manual theme configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Theme JSON</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyThemeCode}
                className="gap-1"
              >
                {copiedCode ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {copiedCode ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <Textarea
              value={themeJson || sampleThemeJson}
              onChange={(e) => setThemeJson(e.target.value)}
              placeholder="Paste theme JSON here..."
              rows={8}
              className="font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Paste a valid theme JSON configuration above and apply changes
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Palette className="w-3 h-3" />
              Apply Theme
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Check className="w-3 h-3" />
              Validate JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Theme Templates */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
          <CardDescription>
            Professional theme templates to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            {[
              { name: 'AgriTech Pro', desc: 'Professional agricultural theme' },
              { name: 'Modern SaaS', desc: 'Clean and modern design' },
              { name: 'Dark Professional', desc: 'Elegant dark mode theme' },
              { name: 'Vibrant Growth', desc: 'Energetic and colorful' }
            ].map((template) => (
              <div
                key={template.name}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
              >
                <div>
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <p className="text-xs text-muted-foreground">{template.desc}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Apply
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
