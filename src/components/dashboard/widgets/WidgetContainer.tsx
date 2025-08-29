
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, X, Settings } from 'lucide-react';

export interface Widget {
  id: string;
  title: string;
  type: 'stat' | 'chart' | 'list' | 'map' | 'activity';
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  data?: any;
}

interface WidgetContainerProps {
  widget: Widget;
  onRemove: (widgetId: string) => void;
  onConfigure: (widgetId: string) => void;
  children: React.ReactNode;
  isDragging?: boolean;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widget,
  onRemove,
  onConfigure,
  children,
  isDragging = false
}) => {
  const getSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'col-span-1 row-span-1';
      case 'medium': return 'col-span-2 row-span-1';
      case 'large': return 'col-span-2 row-span-2';
      default: return 'col-span-1 row-span-1';
    }
  };

  return (
    <Card className={`${getSizeClass(widget.size)} ${isDragging ? 'opacity-50' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={() => onConfigure(widget.id)}>
            <Settings className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm">
            <GripVertical className="h-3 w-3 cursor-move" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onRemove(widget.id)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};
