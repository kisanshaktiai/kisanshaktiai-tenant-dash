
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, MessageSquare, Phone, Mail, 
  UserPlus, Edit, Package, TrendingUp 
} from 'lucide-react';
import { format } from 'date-fns';

interface FarmerInteractionTimelineProps {
  farmerId: string;
}

interface TimelineEvent {
  id: string;
  type: 'registration' | 'communication' | 'update' | 'purchase' | 'activity';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export const FarmerInteractionTimeline: React.FC<FarmerInteractionTimelineProps> = ({ farmerId }) => {
  // Mock data - replace with actual query
  const timeline: TimelineEvent[] = [
    {
      id: '1',
      type: 'activity',
      title: 'App Login',
      description: 'Farmer logged into the mobile app',
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'communication',
      title: 'SMS Campaign Response',
      description: 'Responded to seasonal advisory SMS',
      timestamp: '2024-01-14T16:45:00Z'
    },
    {
      id: '3',
      type: 'purchase',
      title: 'Product Purchase',
      description: 'Purchased fertilizer package via dealer',
      timestamp: '2024-01-10T14:20:00Z',
      metadata: { amount: 2500, product: 'NPK Fertilizer' }
    },
    {
      id: '4',
      type: 'update',
      title: 'Profile Updated',
      description: 'Updated land holding information',
      timestamp: '2024-01-05T11:15:00Z'
    },
    {
      id: '5',
      type: 'registration',
      title: 'Farmer Registered',
      description: 'Initial registration completed',
      timestamp: '2023-12-20T09:00:00Z'
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'registration': return <UserPlus className="w-4 h-4" />;
      case 'communication': return <MessageSquare className="w-4 h-4" />;
      case 'update': return <Edit className="w-4 h-4" />;
      case 'purchase': return <Package className="w-4 h-4" />;
      case 'activity': return <TrendingUp className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'registration': return 'bg-green-500';
      case 'communication': return 'bg-blue-500';
      case 'update': return 'bg-yellow-500';
      case 'purchase': return 'bg-purple-500';
      case 'activity': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Interaction Timeline</h3>
        <Badge variant="outline">{timeline.length} Events</Badge>
      </div>

      <div className="space-y-4">
        {timeline.map((event, index) => (
          <div key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full ${getTypeColor(event.type)} flex items-center justify-center text-white`}>
                {getIcon(event.type)}
              </div>
              {index < timeline.length - 1 && (
                <div className="w-0.5 h-12 bg-gray-200 mt-2" />
              )}
            </div>
            
            <Card className="flex-1">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{event.title}</h4>
                  <span className="text-sm text-gray-500">
                    {format(new Date(event.timestamp), 'MMM dd, HH:mm')}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                
                {event.metadata && (
                  <div className="flex gap-2 text-xs">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <Badge key={key} variant="outline">
                        {key}: {value}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {timeline.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No interaction history found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
