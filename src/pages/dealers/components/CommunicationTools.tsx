import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Send, MessageSquare, Mail, Phone, Users, 
  Calendar, Paperclip, Eye, Check, X
} from 'lucide-react';

export const CommunicationTools = () => {
  const [activeTab, setActiveTab] = useState('compose');
  const [selectedDealers, setSelectedDealers] = useState<string[]>([]);

  const communications = [
    {
      id: '1',
      title: 'Monthly Product Update',
      type: 'announcement',
      recipients: 12,
      sent_at: '2024-01-15T10:30:00Z',
      delivery_status: { delivered: 10, pending: 2 },
      priority: 'medium'
    },
    {
      id: '2',
      title: 'Training Session Reminder',
      type: 'reminder',
      recipients: 8,
      sent_at: '2024-01-14T09:00:00Z',
      delivery_status: { delivered: 8, pending: 0 },
      priority: 'high'
    }
  ];

  const dealers = [
    { id: 'd1', name: 'Green Valley Seeds', email: 'info@greenvalley.com', phone: '+91 9876543210' },
    { id: 'd2', name: 'Krishi Kendra', email: 'contact@krishikendra.com', phone: '+91 9876543211' }
  ];

  const handleDealerSelect = (dealerId: string) => {
    setSelectedDealers(prev =>
      prev.includes(dealerId)
        ? prev.filter(id => id !== dealerId)
        : [...prev, dealerId]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const renderComposeTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compose Message</CardTitle>
          <CardDescription>
            Send announcements, reminders, or updates to your dealer network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Communication Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="update">Product Update</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Subject</label>
            <Input placeholder="Enter message subject" />
          </div>

          <div>
            <label className="text-sm font-medium">Message Content</label>
            <Textarea 
              placeholder="Type your message here..."
              className="min-h-32"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Select Recipients</label>
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-3">
              {dealers.map((dealer) => (
                <div key={dealer.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={dealer.id}
                    checked={selectedDealers.includes(dealer.id)}
                    onCheckedChange={() => handleDealerSelect(dealer.id)}
                  />
                  <label htmlFor={dealer.id} className="text-sm font-medium cursor-pointer">
                    {dealer.name}
                  </label>
                  <span className="text-xs text-muted-foreground">({dealer.email})</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedDealers.length} dealer(s) selected
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              Send Now
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button variant="outline">
              <Paperclip className="h-4 w-4 mr-2" />
              Attach File
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-4">
      {communications.map((comm) => (
        <Card key={comm.id}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{comm.title}</h3>
                  <Badge variant={getPriorityColor(comm.priority)}>
                    {comm.priority}
                  </Badge>
                  <Badge variant="outline">
                    {comm.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sent to {comm.recipients} dealers on {new Date(comm.sent_at).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-green-600">
                    <Check className="h-3 w-3" />
                    {comm.delivery_status.delivered} delivered
                  </span>
                  {comm.delivery_status.pending > 0 && (
                    <span className="flex items-center gap-1 text-yellow-600">
                      <Calendar className="h-3 w-3" />
                      {comm.delivery_status.pending} pending
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Resend
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex items-center gap-4">
        <Button
          variant={activeTab === 'compose' ? 'default' : 'outline'}
          onClick={() => setActiveTab('compose')}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Compose
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'outline'}
          onClick={() => setActiveTab('history')}
        >
          <Mail className="h-4 w-4 mr-2" />
          History
        </Button>
        <Button
          variant={activeTab === 'templates' ? 'default' : 'outline'}
          onClick={() => setActiveTab('templates')}
        >
          <Users className="h-4 w-4 mr-2" />
          Templates
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'compose' && renderComposeTab()}
      {activeTab === 'history' && renderHistoryTab()}
      {activeTab === 'templates' && (
        <Card>
          <CardHeader>
            <CardTitle>Message Templates</CardTitle>
            <CardDescription>
              Pre-built templates for common communications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Message templates coming soon...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};