import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { UserPlus, Search, Mail, Shield, MoreHorizontal, Edit, Trash } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';

// Mock data for demonstration
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active',
    lastActive: '2 hours ago',
    avatar: ''
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Manager',
    status: 'Active',
    lastActive: '1 day ago',
    avatar: ''
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    role: 'Viewer',
    status: 'Inactive',
    lastActive: '1 week ago',
    avatar: ''
  }
];

const mockInvites = [
  {
    id: '1',
    email: 'newuser@example.com',
    role: 'Manager',
    status: 'Pending',
    sentAt: '2 days ago'
  }
];

export const UsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const getRoleBadge = (role: string) => {
    const variants = {
      'Admin': 'destructive',
      'Manager': 'default',
      'Viewer': 'secondary'
    } as const;
    return <Badge variant={variants[role as keyof typeof variants] || 'outline'}>{role}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === 'Active' ? 'default' : 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <PageLayout>
      <PageHeader
        title="User Management"
        description="Manage team members and their permissions"
        actions={
          <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                  Send an invitation to a new team member
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input placeholder="user@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <select className="w-full px-3 py-2 border rounded-md">
                    <option value="viewer">Viewer</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsInviteModalOpen(false)}>
                    Send Invitation
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <PageContent>
        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Active Users</TabsTrigger>
            <TabsTrigger value="invites">Pending Invitations</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage your organization's team members and their access levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
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
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-muted-foreground">{user.lastActive}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invites">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>
                  Users who have been invited but haven't accepted yet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockInvites.map((invite) => (
                      <TableRow key={invite.id}>
                        <TableCell className="font-medium">{invite.email}</TableCell>
                        <TableCell>{getRoleBadge(invite.role)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{invite.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{invite.sentAt}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-500" />
                    Admin
                  </CardTitle>
                  <CardDescription>Full system access</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• Manage all users</li>
                    <li>• Access all features</li>
                    <li>• Billing management</li>
                    <li>• Organization settings</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    Manager
                  </CardTitle>
                  <CardDescription>Operational management</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• Manage farmers</li>
                    <li>• Create campaigns</li>
                    <li>• View analytics</li>
                    <li>• Export data</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    Viewer
                  </CardTitle>
                  <CardDescription>Read-only access</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• View dashboards</li>
                    <li>• Read reports</li>
                    <li>• Basic analytics</li>
                    <li>• Export permissions</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </PageContent>
    </PageLayout>
  );
};

export default UsersPage;
