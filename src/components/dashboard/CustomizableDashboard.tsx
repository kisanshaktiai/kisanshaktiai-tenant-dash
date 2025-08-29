
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, Plus } from 'lucide-react';
import { WidgetContainer, Widget } from './widgets/WidgetContainer';
import { WidgetLibrary } from './widgets/WidgetLibrary';
import { useAppSelector } from '@/store/hooks';

interface CustomizableDashboardProps {
  tenantId: string;
}

export const CustomizableDashboard: React.FC<CustomizableDashboardProps> = ({ tenantId }) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  
  const { currentTenant } = useAppSelector((state) => state.tenant);

  // Load widgets from localStorage or default set
  useEffect(() => {
    const savedWidgets = localStorage.getItem(`dashboard-widgets-${tenantId}`);
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets));
    } else {
      // Default widgets
      setWidgets([
        {
          id: 'farmer-count',
          title: 'Total Farmers',
          type: 'stat',
          size: 'small',
          position: { x: 0, y: 0 },
          data: { value: 1234, change: '+12%' }
        },
        {
          id: 'product-count',
          title: 'Product Catalog',
          type: 'stat',
          size: 'small',
          position: { x: 1, y: 0 },
          data: { value: 456, change: '+5%' }
        },
        {
          id: 'recent-activity',
          title: 'Recent Activity',
          type: 'list',
          size: 'medium',
          position: { x: 0, y: 1 },
          data: {
            items: [
              'New farmer registration: Raj Kumar',
              'Product update: Wheat Seeds',
              'Campaign launched: Summer Fertilizer'
            ]
          }
        }
      ]);
    }
  }, [tenantId]);

  // Save widgets to localStorage
  const saveWidgets = (newWidgets: Widget[]) => {
    setWidgets(newWidgets);
    localStorage.setItem(`dashboard-widgets-${tenantId}`, JSON.stringify(newWidgets));
  };

  const addWidget = (template: any) => {
    const newWidget: Widget = {
      id: `${template.id}-${Date.now()}`,
      title: template.title,
      type: template.type,
      size: template.size,
      position: { x: 0, y: widgets.length },
      data: {}
    };
    saveWidgets([...widgets, newWidget]);
    setShowWidgetLibrary(false);
  };

  const removeWidget = (widgetId: string) => {
    saveWidgets(widgets.filter(w => w.id !== widgetId));
  };

  const configureWidget = (widgetId: string) => {
    console.log('Configure widget:', widgetId);
    // TODO: Open widget configuration modal
  };

  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case 'stat':
        return (
          <div className="text-center">
            <div className="text-2xl font-bold">{widget.data?.value || 0}</div>
            <p className="text-xs text-muted-foreground">
              {widget.data?.change || '+0%'} from last month
            </p>
          </div>
        );
      case 'list':
        return (
          <div className="space-y-2">
            {widget.data?.items?.slice(0, 3).map((item: string, index: number) => (
              <div key={index} className="text-sm text-muted-foreground">
                • {item}
              </div>
            ))}
          </div>
        );
      case 'chart':
        return (
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            Chart visualization would go here
          </div>
        );
      default:
        return (
          <div className="text-center text-muted-foreground">
            Widget content loading...
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Welcome back!</h2>
          <p className="text-muted-foreground">
            {currentTenant?.name} Dashboard
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowWidgetLibrary(!showWidgetLibrary)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Widget
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsCustomizing(!isCustomizing)}
          >
            <Settings className="mr-2 h-4 w-4" />
            {isCustomizing ? 'Done' : 'Customize'}
          </Button>
        </div>
      </div>

      {/* Widget Library */}
      {showWidgetLibrary && (
        <WidgetLibrary onAddWidget={addWidget} />
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-min">
        {widgets.map((widget) => (
          <WidgetContainer
            key={widget.id}
            widget={widget}
            onRemove={removeWidget}
            onConfigure={configureWidget}
          >
            {renderWidgetContent(widget)}
          </WidgetContainer>
        ))}
      </div>

      {/* Empty State */}
      {widgets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Customize Your Dashboard</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Add widgets to create your personalized dashboard experience
            </p>
            <Button onClick={() => setShowWidgetLibrary(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Widget
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
