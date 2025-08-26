
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, Send, Users, Package, 
  UserPlus, Download, Calendar, Mail,
  Phone, FileText, Target, Tag, X
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useCreateBulkOperationMutation, useFarmerSegmentsQuery } from '@/hooks/data/useEnhancedFarmerQuery';
import { toast } from 'sonner';

interface BulkOperationsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFarmers: string[];
  onComplete: () => void;
}

export const BulkOperationsPanel = ({
  open,
  onOpenChange,
  selectedFarmers,
  onComplete,
}: BulkOperationsPanelProps) => {
  const [selectedOperation, setSelectedOperation] = useState('messaging');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [selectedSegment, setSelectedSegment] = useState('');

  const createBulkOperationMutation = useCreateBulkOperationMutation();
  const { data: segments = [] } = useFarmerSegmentsQuery();

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsProcessing(true);
    
    try {
      await createBulkOperationMutation.mutateAsync({
        operation_type: 'mass_messaging',
        target_farmer_ids: selectedFarmers,
        operation_data: {
          message: message,
          channel: 'sms' // Could be made configurable
        }
      });

      // Simulate progress
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10;
        setProgress(currentProgress);
        
        if (currentProgress >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setProgress(0);
          setMessage('');
          onComplete();
          onOpenChange(false);
          toast.success(`Message sent to ${selectedFarmers.length} farmers`);
        }
      }, 300);
      
    } catch (error) {
      setIsProcessing(false);
      setProgress(0);
      toast.error('Failed to send messages');
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Please enter a tag name');
      return;
    }

    setIsProcessing(true);
    
    try {
      await createBulkOperationMutation.mutateAsync({
        operation_type: 'add_tags',
        target_farmer_ids: selectedFarmers,
        operation_data: {
          tag_name: newTagName,
          tag_color: newTagColor
        }
      });

      setNewTagName('');
      setNewTagColor('#3B82F6');
      onComplete();
      toast.success(`Tag added to ${selectedFarmers.length} farmers`);
      
    } catch (error) {
      toast.error('Failed to add tags');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssignSegment = async () => {
    if (!selectedSegment) {
      toast.error('Please select a segment');
      return;
    }

    setIsProcessing(true);
    
    try {
      await createBulkOperationMutation.mutateAsync({
        operation_type: 'assign_segment',
        target_farmer_ids: selectedFarmers,
        operation_data: {
          segment_id: selectedSegment
        }
      });

      setSelectedSegment('');
      onComplete();
      toast.success(`Segment assigned to ${selectedFarmers.length} farmers`);
      
    } catch (error) {
      toast.error('Failed to assign segment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportSelected = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate export process
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 20;
        setProgress(currentProgress);
        
        if (currentProgress >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setProgress(0);
          
          // Create and download a sample CSV
          const csvContent = `Farmer Code,Land Size,Crops,Engagement
${selectedFarmers.map(id => `FARMER_${id.substring(0, 6)},${Math.random() * 10 + 1},Rice;Wheat,Medium`).join('\n')}`;
          
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `farmers_export_${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          
          toast.success(`Exported ${selectedFarmers.length} farmers`);
        }
      }, 500);
      
    } catch (error) {
      setIsProcessing(false);
      setProgress(0);
      toast.error('Export failed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Operations
            <Badge variant="outline" className="ml-2">
              {selectedFarmers.length} farmers selected
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Perform actions on multiple farmers at once
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedOperation} onValueChange={setSelectedOperation}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="messaging">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="tags">
              <Tag className="h-4 w-4 mr-2" />
              Tags
            </TabsTrigger>
            <TabsTrigger value="segments">
              <Target className="h-4 w-4 mr-2" />
              Segments
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </TabsTrigger>
            <TabsTrigger value="campaigns">
              <Calendar className="h-4 w-4 mr-2" />
              Campaigns
            </TabsTrigger>
          </TabsList>

          {isProcessing && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span>Processing operation...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <TabsContent value="messaging" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Send Bulk Messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Select defaultValue="sms">
                    <SelectTrigger>
                      <SelectValue placeholder="Message Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="app">App Notification</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select defaultValue="immediate">
                    <SelectTrigger>
                      <SelectValue placeholder="Schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Send Now</SelectItem>
                      <SelectItem value="schedule">Schedule Later</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Textarea
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-32"
                />
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {message.length}/160 characters
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline">Save Template</Button>
                    <Button onClick={handleSendMessage} disabled={isProcessing}>
                      <Send className="h-4 w-4 mr-2" />
                      Send to {selectedFarmers.length} farmers
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tags" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tagName">Tag Name</Label>
                    <Input
                      id="tagName"
                      placeholder="Enter tag name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagColor">Tag Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tagColor"
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="w-16"
                      />
                      <Input
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleAddTag} disabled={isProcessing}>
                    <Tag className="h-4 w-4 mr-2" />
                    Add Tag to {selectedFarmers.length} farmers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="segments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assign Segment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Segment</Label>
                  <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a segment" />
                    </SelectTrigger>
                    <SelectContent>
                      {segments.map(segment => (
                        <SelectItem key={segment.id} value={segment.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: segment.color }}
                            />
                            {segment.segment_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleAssignSegment} disabled={isProcessing}>
                    <Target className="h-4 w-4 mr-2" />
                    Assign to {selectedFarmers.length} farmers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Selected Farmers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Select defaultValue="csv">
                    <SelectTrigger>
                      <SelectValue placeholder="Export Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV File</SelectItem>
                      <SelectItem value="excel">Excel File</SelectItem>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="json">JSON Data</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Data Fields" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Fields</SelectItem>
                      <SelectItem value="basic">Basic Info</SelectItem>
                      <SelectItem value="contact">Contact Details</SelectItem>
                      <SelectItem value="farming">Farming Details</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleExportSelected} disabled={isProcessing}>
                    <Download className="h-4 w-4 mr-2" />
                    Export {selectedFarmers.length} farmers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campaign Enrollment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Campaign enrollment feature coming soon...
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
