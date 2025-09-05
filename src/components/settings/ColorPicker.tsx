import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  const [localColor, setLocalColor] = useState(value);

  const handleColorChange = (value: string) => {
    setLocalColor(value);
    onChange(value);
  };

  const presetColors = [
    '#10b981', '#059669', '#14b8a6', '#0ea5e9', '#3b82f6', 
    '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16'
  ];

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            value={localColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="pr-12"
          />
          <div 
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded border border-border cursor-pointer"
            style={{ backgroundColor: localColor }}
            onClick={() => document.getElementById(`color-input-${label}`)?.click()}
          />
          <input
            id={`color-input-${label}`}
            type="color"
            value={localColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="hidden"
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  className={cn(
                    "w-10 h-10 rounded-lg border-2 transition-all",
                    localColor === presetColor ? "border-primary scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: presetColor }}
                  onClick={() => handleColorChange(presetColor)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};