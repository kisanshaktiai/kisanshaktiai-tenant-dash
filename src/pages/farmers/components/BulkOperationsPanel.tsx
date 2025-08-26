
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, Users, Tag, Download, 
  Send, X, CheckCircle, AlertCircle 
} from 'lucide-react';
import { useBulkOperationMutation } from '@/hooks/data/useFarmerManagementQuery';
import { toast } from 'sonner';

export interface BulkOperationsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFarmers: string[];
  onComplete: () => void;
}

export const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = ({
  open,
  onOpenChange,
  selectedFarmers,
  onComplete
}) => {
  const [selectedOperation, setSelectedOperation] = useState<string>('');
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState('sms');
  const [tagName, setTagName] = useState('');
  const [segmentName, setSegmentName] = useState('');

  const bulkOperationMutation = useBulkOperationMutation();

  if (!open) return null;

  const handleExecuteOperation = async () => {
    if (!selectedOperation) {
      toast.error('Please select an operation');
      return;
    }

    let operationData: any = {};

    switch (selectedOperation) {
      case 'message':
        if (!messageContent.trim()) {
          toast.error('Please enter message content');
          return;
        }
        operationData = {
          message_content: messageContent,
          communication_type: messageType
        };
        break;
      
      case 'tag':
        if (!tagName.trim()) {
          toast.error('Please enter tag name');
          return;
        }
        operationData = {
          tag_name: tagName,
          tag_color: '#3B82F6'
        };
        break;
      
      case 'segment':
        if (!segmentName.trim()) {
          toast.error('Please enter segment name');
          return;
        }
        operationData = {
          segment_name: segmentName,
          farmer_ids: selectedFarmers
        };
        break;
      
      case 'export':
        operationData = {
          format: 'csv',
          include_fields: ['farmer_code', 'contact_info', 'land_details']
        };
        break;
      
      default:
        toast.error('Invalid operation selected');
        return;
    }

    try {
      await bulkOperationMutation.mutateAsync({
        operation_type: selectedOperation as any,
        farmer_ids: selectedFarmers,
        operation_data: operationData
      });
      
      onComplete();
      toast.success('Bulk operation completed successfully');
    } catch (error) {
      toast.error('Failed to execute bulk operation');
    }
  };

  const renderOperationForm = () => {
    switch (selectedOperation) {
      case 'message':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Message Type</label>
              <Select value={messageType} onValueChange={setMessageType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message Content</label>
              <Textarea
                placeholder="Enter your message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Characters: {messageContent.length}/160
              </p>
            </div>
          </div>
        );
      
      case 'tag':
        return (
          <div>
            <label className="block text-sm font-medium mb-2">Tag Name</label>
            <input
              type="text"
              placeholder="Enter tag name..."
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
        );
      
      case 'segment':
        return (
          <div>
            <label className="block text-sm font-medium mb-2">Segment Name</label>
            <input
              type="text"
              placeholder="Enter segment name..."
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
        );
      
      case 'export':
        return (
          <div className="text-center py-4">
            <Download className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">
              Export {selectedFarmers.length} farmers to CSV format
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Bulk Operations
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{selectedFarmers.length} farmers selected</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Operation Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Operation</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={selectedOperation === 'message' ? 'default' : 'outline'}
                onClick={() => setSelectedOperation('message')}
                className="justify-start"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button
                variant={selectedOperation === 'tag' ? 'default' : 'outline'}
                onClick={() => setSelectedOperation('tag')}
                className="justify-start"
              >
                <Tag className="w-4 h-4 mr-2" />
                Add Tag
              </Button>
              <Button
                variant={selectedOperation === 'segment' ? 'default' : 'outline'}
                onClick={() => setSelectedOperation('segment')}
                className="justify-start"
              >
                <Users className="w-4 h-4 mr-2" />
                Create Segment
              </Button>
              <Button
                variant={selectedOperation === 'export' ? 'default' : 'outline'}
                onClick={() => setSelectedOperation('export')}
                className="justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          {selectedOperation && (
            <>
              <Separator />
              {renderOperationForm()}
            </>
          )}

          {selectedOperation && (
            <>
              <Separator />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleExecuteOperation}
                  disabled={bulkOperationMutation.isPending}
                >
                  {bulkOperationMutation.isPending ? (
                    'Processing...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Execute Operation
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
