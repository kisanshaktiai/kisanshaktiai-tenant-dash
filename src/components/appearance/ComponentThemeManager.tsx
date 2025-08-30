
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Puzzle,
  MousePointer,
  Square,
  Type,
  Layers,
  Zap,
  Eye,
  Copy,
  Palette
} from 'lucide-react';

const componentStyles = {
  buttons: {
    primary: {
      background: '#10B981',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: 8,
      padding: '12px 24px',
      fontWeight: 600
    },
    secondary: {
      background: 'transparent',
      color: '#10B981',
      border: '2px solid #10B981',
      borderRadius: 8,
      padding: '12px 24px',
      fontWeight: 600
    },
    ghost: {
      background: 'transparent',
      color: '#6B7280',
      border: 'none',
      borderRadius: 8,
      padding: '12px 24px',
      fontWeight: 500
    }
  },
  cards: {
    default: {
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      padding: 24,
      shadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    elevated: {
      background: '#FFFFFF',
      border: 'none',
      borderRadius: 16,
      padding: 32,
      shadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    }
  },
  forms: {
    input: {
      background: '#FFFFFF',
      border: '2px solid #E5E7EB',
      borderRadius: 8,
      padding: '12px 16px',
      fontSize: 16
    },
    label: {
      color: '#374151',
      fontSize: 14,
      fontWeight: 500,
      marginBottom: 8
    }
  }
};

export const ComponentThemeManager: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState('buttons');
  const [customStyles, setCustomStyles] = useState(componentStyles);

  const componentTabs = [
    { value: 'buttons', label: 'Buttons', icon: MousePointer },
    { value: 'cards', label: 'Cards', icon: Square },
    { value: 'forms', label: 'Forms', icon: Type },
    { value: 'navigation', label: 'Navigation', icon: Layers }
  ];

  const buttonVariants = ['primary', 'secondary', 'ghost', 'destructive'] as const;
  const cardVariants = ['default', 'elevated', 'outlined'] as const;

  return (
    <div className="space-y-6">
      <Tabs value={activeComponent} onValueChange={setActiveComponent}>
        <TabsList className="grid w-full grid-cols-4">
          {componentTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="buttons" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="w-4 h-4" />
                  Button Styles
                </CardTitle>
                <CardDescription>
                  Customize button appearance and behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Primary Button</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Background</Label>
                      <Input
                        type="color"
                        value={customStyles.buttons.primary.background}
                        onChange={(e) => setCustomStyles(prev => ({
                          ...prev,
                          buttons: {
                            ...prev.buttons,
                            primary: { ...prev.buttons.primary, background: e.target.value }
                          }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Text Color</Label>
                      <Input
                        type="color"
                        value={customStyles.buttons.primary.color}
                        onChange={(e) => setCustomStyles(prev => ({
                          ...prev,
                          buttons: {
                            ...prev.buttons,
                            primary: { ...prev.buttons.primary, color: e.target.value }
                          }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Border Radius: {customStyles.buttons.primary.borderRadius}px</Label>
                    <Slider
                      value={[customStyles.buttons.primary.borderRadius]}
                      onValueChange={(value) => setCustomStyles(prev => ({
                        ...prev,
                        buttons: {
                          ...prev.buttons,
                          primary: { ...prev.buttons.primary, borderRadius: value[0] }
                        }
                      }))}
                      min={0}
                      max={20}
                      step={2}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Secondary Button</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Border Color</Label>
                      <Input
                        type="color"
                        value={customStyles.buttons.secondary.color}
                        onChange={(e) => setCustomStyles(prev => ({
                          ...prev,
                          buttons: {
                            ...prev.buttons,
                            secondary: { ...prev.buttons.secondary, color: e.target.value }
                          }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Text Color</Label>
                      <Input
                        type="color"
                        value={customStyles.buttons.secondary.color}
                        onChange={(e) => setCustomStyles(prev => ({
                          ...prev,
                          buttons: {
                            ...prev.buttons,
                            secondary: { ...prev.buttons.secondary, color: e.target.value }
                          }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Button Preview
                </CardTitle>
                <CardDescription>
                  See how your buttons will look
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Primary Button</Label>
                    <button
                      className="w-full text-center transition-all hover:opacity-90"
                      style={{
                        ...customStyles.buttons.primary,
                        borderRadius: `${customStyles.buttons.primary.borderRadius}px`
                      }}
                    >
                      Primary Action
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Secondary Button</Label>
                    <button
                      className="w-full text-center transition-all hover:bg-gray-50"
                      style={{
                        ...customStyles.buttons.secondary,
                        borderRadius: `${customStyles.buttons.secondary.borderRadius}px`,
                        border: `2px solid ${customStyles.buttons.secondary.color}`
                      }}
                    >
                      Secondary Action
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Ghost Button</Label>
                    <button
                      className="w-full text-center transition-all hover:bg-gray-50"
                      style={{
                        ...customStyles.buttons.ghost,
                        borderRadius: `${customStyles.buttons.ghost.borderRadius}px`
                      }}
                    >
                      Ghost Action
                    </button>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Copy className="w-3 h-3" />
                    Copy CSS
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Palette className="w-3 h-3" />
                    Save Theme
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Square className="w-4 h-4" />
                  Card Styles
                </CardTitle>
                <CardDescription>
                  Customize card appearance and layout
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Default Card</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Background</Label>
                      <Input
                        type="color"
                        value={customStyles.cards.default.background}
                        onChange={(e) => setCustomStyles(prev => ({
                          ...prev,
                          cards: {
                            ...prev.cards,
                            default: { ...prev.cards.default, background: e.target.value }
                          }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Border</Label>
                      <Input
                        type="color"
                        value={customStyles.cards.default.border.split(' ')[2]}
                        onChange={(e) => setCustomStyles(prev => ({
                          ...prev,
                          cards: {
                            ...prev.cards,
                            default: { ...prev.cards.default, border: `1px solid ${e.target.value}` }
                          }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Border Radius: {customStyles.cards.default.borderRadius}px</Label>
                    <Slider
                      value={[customStyles.cards.default.borderRadius]}
                      onValueChange={(value) => setCustomStyles(prev => ({
                        ...prev,
                        cards: {
                          ...prev.cards,
                          default: { ...prev.cards.default, borderRadius: value[0] }
                        }
                      }))}
                      min={0}
                      max={24}
                      step={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Padding: {customStyles.cards.default.padding}px</Label>
                    <Slider
                      value={[customStyles.cards.default.padding]}
                      onValueChange={(value) => setCustomStyles(prev => ({
                        ...prev,
                        cards: {
                          ...prev.cards,
                          default: { ...prev.cards.default, padding: value[0] }
                        }
                      }))}
                      min={8}
                      max={48}
                      step={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Card Preview
                </CardTitle>
                <CardDescription>
                  Preview your card styles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    style={{
                      ...customStyles.cards.default,
                      borderRadius: `${customStyles.cards.default.borderRadius}px`,
                      padding: `${customStyles.cards.default.padding}px`
                    }}
                  >
                    <h4 className="font-semibold mb-2">Sample Card</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      This is how your cards will appear throughout the application.
                    </p>
                    <Badge>Card Content</Badge>
                  </div>

                  <div
                    style={{
                      ...customStyles.cards.elevated,
                      borderRadius: `${customStyles.cards.elevated.borderRadius}px`,
                      padding: `${customStyles.cards.elevated.padding}px`
                    }}
                  >
                    <h4 className="font-semibold mb-2">Elevated Card</h4>
                    <p className="text-sm text-muted-foreground">
                      Enhanced with shadow and larger padding.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forms" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Form Styles
                </CardTitle>
                <CardDescription>
                  Customize form elements and inputs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Input Fields</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Background</Label>
                      <Input
                        type="color"
                        value={customStyles.forms.input.background}
                        onChange={(e) => setCustomStyles(prev => ({
                          ...prev,
                          forms: {
                            ...prev.forms,
                            input: { ...prev.forms.input, background: e.target.value }
                          }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Border</Label>
                      <Input
                        type="color"
                        value={customStyles.forms.input.border.split(' ')[2]}
                        onChange={(e) => setCustomStyles(prev => ({
                          ...prev,
                          forms: {
                            ...prev.forms,
                            input: { ...prev.forms.input, border: `2px solid ${e.target.value}` }
                          }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Border Radius: {customStyles.forms.input.borderRadius}px</Label>
                    <Slider
                      value={[customStyles.forms.input.borderRadius]}
                      onValueChange={(value) => setCustomStyles(prev => ({
                        ...prev,
                        forms: {
                          ...prev.forms,
                          input: { ...prev.forms.input, borderRadius: value[0] }
                        }
                      }))}
                      min={0}
                      max={16}
                      step={2}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Form Labels</Label>
                  <div className="space-y-2">
                    <Label className="text-xs">Label Color</Label>
                    <Input
                      type="color"
                      value={customStyles.forms.label.color}
                      onChange={(e) => setCustomStyles(prev => ({
                        ...prev,
                        forms: {
                          ...prev.forms,
                          label: { ...prev.forms.label, color: e.target.value }
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Font Size: {customStyles.forms.label.fontSize}px</Label>
                    <Slider
                      value={[customStyles.forms.label.fontSize]}
                      onValueChange={(value) => setCustomStyles(prev => ({
                        ...prev,
                        forms: {
                          ...prev.forms,
                          label: { ...prev.forms.label, fontSize: value[0] }
                        }
                      }))}
                      min={12}
                      max={18}
                      step={1}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Form Preview
                </CardTitle>
                <CardDescription>
                  See your form styling in action
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label
                      style={{
                        ...customStyles.forms.label,
                        fontSize: `${customStyles.forms.label.fontSize}px`,
                        display: 'block',
                        marginBottom: `${customStyles.forms.label.marginBottom}px`
                      }}
                    >
                      Sample Input Field
                    </label>
                    <input
                      type="text"
                      placeholder="Enter some text..."
                      style={{
                        ...customStyles.forms.input,
                        borderRadius: `${customStyles.forms.input.borderRadius}px`,
                        fontSize: `${customStyles.forms.input.fontSize}px`,
                        width: '100%'
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        ...customStyles.forms.label,
                        fontSize: `${customStyles.forms.label.fontSize}px`,
                        display: 'block',
                        marginBottom: `${customStyles.forms.label.marginBottom}px`
                      }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      style={{
                        ...customStyles.forms.input,
                        borderRadius: `${customStyles.forms.input.borderRadius}px`,
                        fontSize: `${customStyles.forms.input.fontSize}px`,
                        width: '100%'
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        ...customStyles.forms.label,
                        fontSize: `${customStyles.forms.label.fontSize}px`,
                        display: 'block',
                        marginBottom: `${customStyles.forms.label.marginBottom}px`
                      }}
                    >
                      Message
                    </label>
                    <textarea
                      placeholder="Enter your message..."
                      rows={3}
                      style={{
                        ...customStyles.forms.input,
                        borderRadius: `${customStyles.forms.input.borderRadius}px`,
                        fontSize: `${customStyles.forms.input.fontSize}px`,
                        width: '100%',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Navigation Styles
              </CardTitle>
              <CardDescription>
                Customize navigation and menu elements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Navigation customization coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
