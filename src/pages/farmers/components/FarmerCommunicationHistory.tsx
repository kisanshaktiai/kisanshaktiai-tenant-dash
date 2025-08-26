
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Phone, Mail, MessageCircle, Clock } from 'lucide-react';
import { useCommunicationHistoryQuery } from '@/hooks/data/useEnhancedFarmerQuery';
import { format } from 'date-fns';

interface FarmerCommunicationHistoryProps {
  farmerId: string;
}

export const FarmerCommunicationHistory: React.FC<FarmerCommunicationHistoryProps> = ({ farmerId }) => {
  const { data: communications = [], isLoading } = useCommunicationHistoryQuery(farmerId);

  const getIcon = (type: string) => {
    switch (type) {
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'call': return <Phone className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500';
      case 'read': return 'bg-blue-500';
      case 'sent': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading communication history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Communication History</h3>
        <Badge variant="outline">{communications.length} Messages</Badge>
      </div>

      <div className="space-y-4">
        {communications.map((comm) => (
          <Card key={comm.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2">
                  {getIcon(comm.communication_type)}
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(comm.status)} text-white`}
                  >
                    {comm.status}
                  </Badge>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium capitalize">
                      {comm.communication_type.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      {format(new Date(comm.sent_at), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                  
                  {comm.message_content && (
                    <p className="text-gray-700 mb-2">{comm.message_content}</p>
                  )}
                  
                  <div className="flex gap-4 text-xs text-gray-500">
                    {comm.delivered_at && (
                      <span>Delivered: {format(new Date(comm.delivered_at), 'HH:mm')}</span>
                    )}
                    {comm.read_at && (
                      <span>Read: {format(new Date(comm.read_at), 'HH:mm')}</span>
                    )}
                    {comm.response_at && (
                      <span>Responded: {format(new Date(comm.response_at), 'HH:mm')}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {communications.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No communication history found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
