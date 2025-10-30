
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3, Users, Package, Activity, MapPin, List } from 'lucide-react';
import { Widget } from './WidgetContainer';

interface WidgetTemplate {
  id: string;
  title: string;
  type: Widget['type'];
  size: Widget['size'];
  icon: React.ComponentType<any>;
  description: string;
}

const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    id: 'farmer-count',
    title: 'Total Farmers',
    type: 'stat',
    size: 'small',
    icon: Users,
    description: 'Display total number of farmers'
  },
  {
    id: 'product-count',
    title: 'Product Catalog',
    type: 'stat',
    size: 'small',
    icon: Package,
    description: 'Display total products available'
  },
  {
    id: 'farmer-growth',
    title: 'Farmer Growth Chart',
    type: 'chart',
    size: 'medium',
    icon: BarChart3,
    description: 'Show farmer acquisition over time'
  },
  {
    id: 'recent-activity',
    title: 'Recent Activity',
    type: 'list',
    size: 'medium',
    icon: Activity,
    description: 'Display recent farmer activities'
  },
  {
    id: 'farmer-locations',
    title: 'Farmer Locations',
    type: 'map',
    size: 'large',
    icon: MapPin,
    description: 'Map showing farmer distribution'
  },
  {
    id: 'top-products',
    title: 'Top Products',
    type: 'list',
    size: 'small',
    icon: List,
    description: 'List of most popular products'
  }
];

interface WidgetLibraryProps {
  onAddWidget: (template: WidgetTemplate) => void;
}

export const WidgetLibrary: React.FC<WidgetLibraryProps> = ({ onAddWidget }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Widget Library</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WIDGET_TEMPLATES.map((template) => {
            const IconComponent = template.icon;
            return (
              <div key={template.id} className="border rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <IconComponent className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <h4 className="font-medium">{template.title}</h4>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </div>
                  <Button size="sm" onClick={() => onAddWidget(template)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
