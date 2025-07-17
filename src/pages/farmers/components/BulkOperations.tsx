import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, Send, Users, Package, 
  UserPlus, Download, Calendar, Mail,
  Phone, FileText, Target
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const BulkOperations = () => {
  const [selectedOperation, setSelectedOperation] = useState('messaging');
  const [message, setMessage] = useState('');
  const [selectedFarmers, setSelectedFarmers] = useState(245);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{selectedFarmers} farmers selected</Badge>
              <Button variant="outline" size="sm">Change Selection</Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Selected
              </Button>
            </div>
          </div>

          <Tabs value={selectedOperation} onValueChange={setSelectedOperation}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="messaging">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messaging
              </TabsTrigger>
              <TabsTrigger value="recommendations">
                <Package className="h-4 w-4 mr-2" />
                Recommendations
              </TabsTrigger>
              <TabsTrigger value="campaigns">
                <Target className="h-4 w-4 mr-2" />
                Campaigns
              </TabsTrigger>
              <TabsTrigger value="updates">
                <FileText className="h-4 w-4 mr-2" />
                Data Updates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="messaging" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Send Message</CardTitle>
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
                      <Button>
                        <Send className="h-4 w-4 mr-2" />
                        Send to {selectedFarmers} farmers
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Bulk product recommendation feature coming soon...
                    </p>
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
                    <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Bulk campaign enrollment feature coming soon...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="updates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bulk Data Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Bulk data update feature coming soon...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};