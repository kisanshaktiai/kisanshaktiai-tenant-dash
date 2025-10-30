import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  UserPlus, Search, Mail, Shield, MoreVertical, Edit, Trash,
  Users, UserCheck, UserX, Clock, Activity, TrendingUp,
  Eye, Download, Filter, SortDesc, Globe, Lock, Key,
  AlertCircle, CheckCircle2, XCircle, RefreshCw, Send,
  Calendar, MapPin, Phone, Briefcase, Award, Star,
  MessageSquare, Video, FileText, Settings
} from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Enhanced mock data with more details
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    department: 'Operations',
    status: 'Active',
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    joinedDate: new Date('2023-01-15'),
    avatar: '',
    phone: '+91 98765 43210',
    location: 'Mumbai, India',
    permissions: ['full_access'],
    activityScore: 95,
    tasksCompleted: 234,
    lastLogin: new Date(Date.now() - 30 * 60 * 1000),
    twoFactorEnabled: true,
    emailVerified: true
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Manager',
    department: 'Sales',
    status: 'Active',
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
    joinedDate: new Date('2023-03-20'),
    avatar: '',
    phone: '+91 98765 43211',
    location: 'Delhi, India',
    permissions: ['manage_farmers', 'view_analytics'],
    activityScore: 78,
    tasksCompleted: 156,
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    twoFactorEnabled: false,
    emailVerified: true
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    role: 'Viewer',
    department: 'Marketing',
    status: 'Inactive',
    lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    joinedDate: new Date('2023-06-10'),
    avatar: '',
    phone: '+91 98765 43212',
    location: 'Bangalore, India',
    permissions: ['view_only'],
    activityScore: 45,
    tasksCompleted: 67,
    lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    twoFactorEnabled: false,
    emailVerified: false
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'Manager',
    department: 'Operations',
    status: 'Active',
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
    joinedDate: new Date('2023-02-28'),
    avatar: '',
    phone: '+91 98765 43213',
    location: 'Chennai, India',
    permissions: ['manage_farmers', 'manage_products'],
    activityScore: 88,
    tasksCompleted: 189,
    lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000),
    twoFactorEnabled: true,
    emailVerified: true
  }
];

const rolePermissions = {
  Admin: [
    { id: 'full_access', name: 'Full System Access', description: 'Complete control over all features' },
    { id: 'manage_org', name: 'Manage Organization', description: 'Modify organization settings' },
    { id: 'manage_billing', name: 'Manage Billing', description: 'Handle subscription and payments' },
    { id: 'manage_security', name: 'Security Settings', description: 'Configure security policies' }
  ],
  Manager: [
    { id: 'manage_farmers', name: 'Manage Farmers', description: 'Add, edit, and remove farmers' },
    { id: 'manage_products', name: 'Manage Products', description: 'Control product catalog' },
    { id: 'view_analytics', name: 'View Analytics', description: 'Access reports and insights' },
    { id: 'manage_campaigns', name: 'Manage Campaigns', description: 'Create and manage campaigns' }
  ],
  Viewer: [
    { id: 'view_only', name: 'View Only', description: 'Read-only access to data' },
    { id: 'export_data', name: 'Export Data', description: 'Download reports and data' }
  ]
};

export const EnhancedUsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [inviteData, setInviteData] = useState({
    emails: '',
    role: 'Viewer',
    sendWelcomeEmail: true,
    customMessage: ''
  });

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [searchTerm, selectedRole, selectedStatus]);

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error('No users selected');
      return;
    }
    
    switch (action) {
      case 'activate':
        toast.success(`${selectedUsers.length} users activated`);
        break;
      case 'deactivate':
        toast.success(`${selectedUsers.length} users deactivated`);
        break;
      case 'delete':
        toast.success(`${selectedUsers.length} users removed`);
        break;
      case 'export':
        toast.success('User data exported');
        break;
    }
    setSelectedUsers([]);
  };

  const handleInviteUsers = () => {
    const emailList = inviteData.emails.split(',').map(e => e.trim()).filter(e => e);
    if (emailList.length === 0) {
      toast.error('Please enter at least one email address');
      return;
    }
    
    toast.success(`Invitations sent to ${emailList.length} user(s)`);
    setIsInviteModalOpen(false);
    setInviteData({ emails: '', role: 'Viewer', sendWelcomeEmail: true, customMessage: '' });
  };

  const UserDetailsModal = () => {
    if (!selectedUser) return null;
    
    return (
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information and activity for {selectedUser.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* User Profile Header */}
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedUser.avatar} />
                <AvatarFallback className="text-lg">
                  {selectedUser.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={selectedUser.status === 'Active' ? 'default' : 'secondary'}>
                    {selectedUser.status}
                  </Badge>
                  <Badge variant="outline">{selectedUser.role}</Badge>
                  {selectedUser.twoFactorEnabled && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Lock className="h-3 w-3 mr-1" />
                      2FA
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Button>
            </div>

            <Separator />

            {/* User Information Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{selectedUser.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedUser.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedUser.location}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Joined Date</p>
                  <p className="font-medium">{format(selectedUser.joinedDate, 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-medium">{format(selectedUser.lastLogin, 'PPp')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Activity Score</p>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedUser.activityScore} className="w-20 h-2" />
                    <span className="font-medium">{selectedUser.activityScore}%</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Permissions */}
            <div>
              <h4 className="text-sm font-medium mb-3">Permissions</h4>
              <div className="space-y-2">
                {selectedUser.permissions.map((perm: string) => (
                  <div key={perm} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{selectedUser.tasksCompleted}</div>
                  <p className="text-xs text-muted-foreground">Tasks Completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{selectedUser.activityScore}%</div>
                  <p className="text-xs text-muted-foreground">Activity Score</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">
                    {Math.floor((Date.now() - selectedUser.joinedDate.getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <p className="text-xs text-muted-foreground">Days Active</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDetailsOpen(false)}>
              Close
            </Button>
            <Button variant="destructive">
              <UserX className="h-4 w-4 mr-2" />
              Deactivate User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <PageLayout>
      <PageHeader
        title="User Management"
        description="Advanced user administration with role-based access control"
        badge={{
          text: `${mockUsers.filter(u => u.status === 'Active').length} Active Users`,
          variant: 'default'
        }}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setIsInviteModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Users
            </Button>
          </div>
        }
      />

      <PageContent>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{mockUsers.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-20" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">8%</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {mockUsers.filter(u => u.status === 'Active').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500 opacity-20" />
              </div>
              <Progress 
                value={(mockUsers.filter(u => u.status === 'Active').length / mockUsers.length) * 100} 
                className="mt-4 h-1"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {mockUsers.filter(u => u.twoFactorEnabled).length}
                  </p>
                  <p className="text-sm text-muted-foreground">2FA Enabled</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500 opacity-20" />
              </div>
              <Progress 
                value={(mockUsers.filter(u => u.twoFactorEnabled).length / mockUsers.length) * 100} 
                className="mt-4 h-1"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round(mockUsers.reduce((acc, u) => acc + u.activityScore, 0) / mockUsers.length)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Activity</p>
                </div>
                <Activity className="h-8 w-8 text-purple-500 opacity-20" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">12%</span>
                <span className="text-muted-foreground ml-1">improvement</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {selectedUsers.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Bulk Actions ({selectedUsers.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Activate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                      <UserX className="h-4 w-4 mr-2" />
                      Deactivate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleBulkAction('delete')}
                      className="text-destructive"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  Manage your organization's team members and their access levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox 
                            checked={selectedUsers.length === filteredUsers.length}
                            onCheckedChange={(checked) => {
                              setSelectedUsers(checked ? filteredUsers.map(u => u.id) : []);
                            }}
                          />
                        </TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead>Security</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow 
                          key={user.id}
                          className={cn(
                            "cursor-pointer hover:bg-muted/50",
                            selectedUsers.includes(user.id) && "bg-muted/30"
                          )}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={(checked) => {
                                setSelectedUsers(
                                  checked
                                    ? [...selectedUsers, user.id]
                                    : selectedUsers.filter(id => id !== user.id)
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell 
                            onClick={() => {
                              setSelectedUser(user);
                              setIsUserDetailsOpen(true);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.department}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                user.role === 'Admin' ? 'destructive' :
                                user.role === 'Manager' ? 'default' : 'secondary'
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.status === 'Active' ? 'default' : 'secondary'}
                              className={cn(
                                user.status === 'Active' && "bg-green-500/10 text-green-600 border-green-500/20"
                              )}
                            >
                              <span className={cn(
                                "mr-1",
                                user.status === 'Active' ? "text-green-500" : "text-gray-500"
                              )}>●</span>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={user.activityScore} className="w-16 h-2" />
                              <span className="text-sm text-muted-foreground">{user.activityScore}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {user.twoFactorEnabled && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0">
                                  <Lock className="h-3 w-3" />
                                </Badge>
                              )}
                              {user.emailVerified && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0">
                                  <Mail className="h-3 w-3" />
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(user.lastActive, 'PP')}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                  setSelectedUser(user);
                                  setIsUserDetailsOpen(true);
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Key className="h-4 w-4 mr-2" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Resend Invitation
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash className="h-4 w-4 mr-2" />
                                  Remove User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Object.entries(rolePermissions).map(([role, permissions]) => (
                <Card key={role} className="relative overflow-hidden">
                  <div className={cn(
                    "absolute inset-x-0 top-0 h-1",
                    role === 'Admin' && "bg-red-500",
                    role === 'Manager' && "bg-blue-500",
                    role === 'Viewer' && "bg-green-500"
                  )} />
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Shield className={cn(
                          "h-5 w-5",
                          role === 'Admin' && "text-red-500",
                          role === 'Manager' && "text-blue-500",
                          role === 'Viewer' && "text-green-500"
                        )} />
                        {role}
                      </span>
                      <Badge variant="secondary">
                        {mockUsers.filter(u => u.role === role).length} users
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {role === 'Admin' && 'Full system access and control'}
                      {role === 'Manager' && 'Operational management capabilities'}
                      {role === 'Viewer' && 'Read-only access to data'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {permissions.map((perm) => (
                        <div key={perm.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">{perm.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground ml-6">
                            {perm.description}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Permissions
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="teams">
            <Card>
              <CardHeader>
                <CardTitle>Team Structure</CardTitle>
                <CardDescription>
                  Organize users into teams for better collaboration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Operations', 'Sales', 'Marketing', 'Support'].map((team) => (
                    <Card key={team}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{team} Team</CardTitle>
                          <Badge variant="secondary">
                            {mockUsers.filter(u => u.department === team).length} members
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {mockUsers
                            .filter(u => u.department === team)
                            .slice(0, 3)
                            .map((user) => (
                              <div key={user.id} className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{user.name}</span>
                                <Badge variant="outline" className="text-xs ml-auto">
                                  {user.role}
                                </Badge>
                              </div>
                            ))}
                        </div>
                        <Button variant="ghost" size="sm" className="w-full mt-3">
                          View All Members
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>User Activity Log</CardTitle>
                <CardDescription>
                  Recent user actions and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {[
                      { user: 'John Doe', action: 'Logged in', time: '10 minutes ago', icon: CheckCircle2, color: 'text-green-500' },
                      { user: 'Jane Smith', action: 'Updated profile', time: '1 hour ago', icon: Edit, color: 'text-blue-500' },
                      { user: 'Bob Wilson', action: 'Password reset requested', time: '2 hours ago', icon: Key, color: 'text-orange-500' },
                      { user: 'Sarah Johnson', action: 'Exported farmer data', time: '3 hours ago', icon: Download, color: 'text-purple-500' },
                      { user: 'John Doe', action: 'Created new campaign', time: '5 hours ago', icon: Mail, color: 'text-indigo-500' },
                      { user: 'Jane Smith', action: 'Modified user permissions', time: '1 day ago', icon: Shield, color: 'text-red-500' },
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={cn("p-2 rounded-full bg-muted")}>
                          <activity.icon className={cn("h-4 w-4", activity.color)} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span>
                            {' '}
                            <span className="text-muted-foreground">{activity.action}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Invite Users Modal */}
        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Invite New Users</DialogTitle>
              <DialogDescription>
                Send invitations to add new team members to your organization
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="emails">Email Addresses *</Label>
                <Textarea
                  id="emails"
                  placeholder="Enter email addresses separated by commas&#10;e.g., user1@example.com, user2@example.com"
                  value={inviteData.emails}
                  onChange={(e) => setInviteData({...inviteData, emails: e.target.value})}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  You can invite multiple users at once by separating emails with commas
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Default Role</Label>
                <Select 
                  value={inviteData.role} 
                  onValueChange={(value) => setInviteData({...inviteData, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Custom Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a personal message to the invitation email"
                  value={inviteData.customMessage}
                  onChange={(e) => setInviteData({...inviteData, customMessage: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="welcome"
                  checked={inviteData.sendWelcomeEmail}
                  onCheckedChange={(checked) => 
                    setInviteData({...inviteData, sendWelcomeEmail: checked as boolean})
                  }
                />
                <Label htmlFor="welcome" className="text-sm font-normal">
                  Send welcome email with getting started guide
                </Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteUsers}>
                <Send className="h-4 w-4 mr-2" />
                Send Invitations
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <UserDetailsModal />
      </PageContent>
    </PageLayout>
  );
};

export default EnhancedUsersPage;