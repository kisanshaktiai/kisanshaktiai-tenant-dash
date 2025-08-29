
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Send, Users, Tag, FileDown, MessageSquare, 
  Phone, Mail, Target, CheckCircle, AlertCircle, Clock 
} from 'lucide-react';

interface BulkOperationsProps {
  selectedFarmers: string[];
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({ selectedFarmers }) => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationProgress, setOperationProgress] = useState(0);
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState('sms');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');

  const bulkOperations = [
    {
      id: 'message',
      title: 'Send Messages',
      description: 'Send SMS, WhatsApp, or Push notifications',
      icon: MessageSquare,
      color: 'bg-blue-500'
    },
    {
      id: 'tag',
      title: 'Add Tags',
      description: 'Tag farmers for better organization',
      icon: Tag,
      color: 'bg-green-500'
    },
    {
      id: 'segment',
      title: 'Add to Segment',
      description: 'Assign farmers to specific segments',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      id: 'export',
      title: 'Export Data',
      description: 'Download farmer data in CSV/Excel format',
      icon: FileDown,
      color: 'bg-orange-500'
    },
    {
      id: 'campaign',
      title: 'Add to Campaign',
      description: 'Enroll farmers in marketing campaigns',
      icon: Target,
      color: 'bg-red-500'
    },
    {
      id: 'update',
      title: 'Update Fields',
      description: 'Bulk update farmer information',
      icon: CheckCircle,
      color: 'bg-teal-500'
    }
  ];

  const recentOperations = [
    {
      id: '1',
      type: 'Message Broadcast',
      status: 'completed',
      targetCount: 1250,
      successCount: 1235,
      failedCount: 15,
      timestamp: '2024-01-20 10:30 AM',
      details: 'Winter crop advisory sent via SMS'
    },
    {
      id: '2',
      type: 'Tag Assignment',
      status: 'in_progress',
      targetCount: 800,
      successCount: 650,
      failedCount: 0,
      timestamp: '2024-01-20 09:15 AM',
      details: 'Adding "High Value" tag to premium farmers'
    },
    {
      id: '3',
      type: 'Data Export',
      status: 'completed',
      targetCount: 2000,
      successCount: 2000,
      failedCount: 0,
      timestamp: '2024-01-19 04:20 PM',
      details: 'Monthly farmer report exported to Excel'
    }
  ];

  const handleStartOperation = async (operationType: string) => {
    if (selectedFarmers.length === 0) {
      alert('Please select farmers first');
      return;
    }

    setActiveOperation(operationType);
    setOperationProgress(0);

    // Simulate operation progress
    const interval = setInterval(() => {
      setOperationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setActiveOperation(null);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Bulk Operations</h2>
          <p className="text-muted-foreground">
            Perform actions on multiple farmers at once
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {selectedFarmers.length} farmers selected
        </Badge>
      </div>

      {selectedFarmers.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Farmers Selected</h3>
              <p className="text-muted-foreground">
                Please select farmers from the directory to perform bulk operations
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedFarmers.length > 0 && (
        <Tabs defaultValue="operations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="operations">Available Operations</TabsTrigger>
            <TabsTrigger value="history">Operation History</TabsTrigger>
          </TabsList>

          <TabsContent value="operations" className="space-y-6">
            {activeOperation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Operation in Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Processing {selectedFarmers.length} farmers...</span>
                      <span>{operationProgress}%</span>
                    </div>
                    <Progress value={operationProgress} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Operations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bulkOperations.map((operation) => (
                <Card key={operation.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${operation.color} rounded-lg`}>
                        <operation.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{operation.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{operation.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      onClick={() => handleStartOperation(operation.id)}
                      disabled={activeOperation !== null}
                    >
                      Start Operation
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detailed Operation Forms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Message Operation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Send Messages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={messageType} onValueChange={setMessageType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select message type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>

                  <Textarea
                    placeholder="Enter your message here..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    rows={4}
                  />

                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Characters: {messageContent.length}/160</span>
                    <span>Cost estimate: ₹{(selectedFarmers.length * 0.5).toFixed(2)}</span>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => handleStartOperation('message')}
                    disabled={!messageContent.trim() || activeOperation !== null}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send to {selectedFarmers.length} farmers
                  </Button>
                </CardContent>
              </Card>

              {/* Tag Operation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Add Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select or create tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-value">High Value</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="new">New Farmer</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm">
                      This tag will be added to all {selectedFarmers.length} selected farmers.
                      Existing tags will be preserved.
                    </p>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => handleStartOperation('tag')}
                    disabled={!selectedTag || activeOperation !== null}
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    Add Tag to {selectedFarmers.length} farmers
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="grid gap-4">
              {recentOperations.map((operation) => (
                <Card key={operation.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getStatusIcon(operation.status)}
                          {operation.type}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {operation.details}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusColor(operation.status)}>
                          {operation.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {operation.timestamp}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Target</p>
                        <p className="text-muted-foreground">{operation.targetCount} farmers</p>
                      </div>
                      <div>
                        <p className="font-medium">Success</p>
                        <p className="text-green-600">{operation.successCount}</p>
                      </div>
                      <div>
                        <p className="font-medium">Failed</p>
                        <p className="text-red-600">{operation.failedCount}</p>
                      </div>
                    </div>

                    {operation.status === 'in_progress' && (
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Progress</span>
                          <span className="text-sm">
                            {Math.round((operation.successCount / operation.targetCount) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={(operation.successCount / operation.targetCount) * 100} 
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
