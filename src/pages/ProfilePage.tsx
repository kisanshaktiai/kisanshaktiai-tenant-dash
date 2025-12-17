import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';
import {
  Building2,
  Mail,
  Phone,
  Briefcase,
  Save,
  Loader2,
  Shield,
  Users,
  Calendar,
  Award,
  MapPin,
  User,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTenantUserProfile } from '@/hooks/useTenantUserProfile';
import { Modern2025ProfileSkeleton } from '@/components/profile/Modern2025ProfileSkeleton';
import { Modern2025AvatarUploader } from '@/components/profile/Modern2025AvatarUploader';
import { useAppSelector } from '@/store/hooks';
import { format } from 'date-fns';

const ProfilePage = () => {
  const { profile, loading, error, updateProfile, uploadAvatar, changePassword } = useTenantUserProfile();
  const { currentTenant } = useAppSelector((state) => state.tenant);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    department: '',
    designation: '',
    employee_id: '',
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        department: profile.department || '',
        designation: profile.designation || '',
        employee_id: profile.employee_id || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateProfile(formData);
    setIsSaving(false);

    if (success) {
      toast.success('Profile updated successfully');
    } else {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    const success = await changePassword(passwordData.newPassword);
    if (success) {
      toast.success('Password changed successfully');
      setShowPasswordForm(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } else {
      toast.error('Failed to change password');
    }
  };

  if (loading) {
    return (
      <PageLayout maxWidth="7xl">
        <Modern2025ProfileSkeleton />
      </PageLayout>
    );
  }

  if (error || !profile) {
    return (
      <PageLayout maxWidth="7xl">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold text-destructive mb-2">Failed to Load Profile</h3>
            <p className="text-muted-foreground mb-6">Unable to fetch your profile data</p>
            <Button onClick={() => window.location.reload()} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const displayName = profile.full_name || profile.email?.split('@')[0] || 'User';
  const roleLabel = profile.tenant_role?.replace('tenant_', '').replace('_', ' ').toUpperCase() || 'MEMBER';

  return (
    <PageLayout maxWidth="7xl">
      <PageHeader
        title="Profile Settings"
        description="Manage your personal information and tenant account settings"
      />

      <PageContent spacing="lg">
        {/* Profile Hero Card */}
      <Card className="border-border/40 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <CardContent className="relative p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Avatar */}
            <Modern2025AvatarUploader
              currentAvatar={profile.avatar_url}
              userName={displayName}
              onUpload={uploadAvatar}
            />

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-1">{displayName}</h2>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-base">{profile.email}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default" className="px-3 py-1 text-sm font-medium">
                  <Award className="h-3 w-3 mr-1.5" />
                  {roleLabel}
                </Badge>
                {profile.tenant_info && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    <Building2 className="h-3 w-3 mr-1.5" />
                    {profile.tenant_info.name}
                  </Badge>
                )}
                {profile.is_active && (
                  <Badge variant="outline" className="px-3 py-1 text-sm border-success text-success">
                    Active
                  </Badge>
                )}
              </div>

              {/* Quick Stats */}
              {profile.department && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{profile.department}</span>
                  {profile.designation && (
                    <>
                      <span className="text-border">•</span>
                      <span>{profile.designation}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-lg group">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Organization</p>
                <p className="text-lg font-bold">{currentTenant?.name || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-lg group">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Users className="h-7 w-7 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Account Type</p>
                <p className="text-lg font-bold capitalize">{currentTenant?.type?.replace('_', ' ') || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-lg group">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-info/10 flex items-center justify-center group-hover:bg-info/20 transition-colors">
                <Calendar className="h-7 w-7 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Member Since</p>
                <p className="text-lg font-bold">
                  {profile.created_at ? format(new Date(profile.created_at), 'MMM yyyy') : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 h-auto rounded-xl">
          <TabsTrigger value="personal" className="rounded-lg px-6 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <User className="h-4 w-4 mr-2" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="organization" className="rounded-lg px-6 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Building2 className="h-4 w-4 mr-2" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg px-6 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6 mt-6">
          <Card className="border-border/40 shadow-md">
            <CardHeader className="border-b border-border/40 bg-muted/30">
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-semibold">
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter your full name"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="h-11 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation" className="text-sm font-semibold">
                    Designation
                  </Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g., Manager, Team Lead"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-semibold">
                    Department
                  </Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., Operations, Sales"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="employee_id" className="text-sm font-semibold">
                    Employee ID
                  </Label>
                  <Input
                    id="employee_id"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    placeholder="Your employee identification number"
                    className="h-11"
                  />
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (profile) {
                      setFormData({
                        full_name: profile.full_name || '',
                        phone: profile.phone || '',
                        department: profile.department || '',
                        designation: profile.designation || '',
                        employee_id: profile.employee_id || '',
                      });
                    }
                  }}
                  disabled={isSaving}
                >
                  Reset
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="min-w-[120px]">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-6 mt-6">
          <Card className="border-border/40 shadow-md">
            <CardHeader className="border-b border-border/40 bg-muted/30">
              <CardTitle className="text-xl flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Organization Details
              </CardTitle>
              <CardDescription>View your organization and account information</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {profile.tenant_info && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-muted-foreground">Organization Name</Label>
                        <p className="text-base font-medium">{profile.tenant_info.name}</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-muted-foreground">Organization Type</Label>
                        <p className="text-base font-medium capitalize">
                          {profile.tenant_info.type.replace('_', ' ')}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-muted-foreground">Subscription Plan</Label>
                        <Badge variant="default" className="text-sm">
                          {profile.tenant_info.subscription_plan}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-muted-foreground">Account Status</Label>
                        <Badge
                          variant={profile.tenant_info.status === 'active' ? 'default' : 'secondary'}
                          className="text-sm"
                        >
                          {profile.tenant_info.status}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-muted-foreground">Your Role</Label>
                        <Badge variant="outline" className="text-sm">
                          {roleLabel}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-muted-foreground">Account Email</Label>
                        <p className="text-base font-medium">{profile.email}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="bg-muted/30 rounded-lg p-6 border border-border/40">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Account Information
                      </h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>User ID: <span className="font-mono text-foreground">{profile.id}</span></p>
                        <p>
                          Member Since:{' '}
                          <span className="text-foreground font-medium">
                            {format(new Date(profile.created_at), 'MMMM dd, yyyy')}
                          </span>
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card className="border-border/40 shadow-md">
            <CardHeader className="border-b border-border/40 bg-muted/30">
              <CardTitle className="text-xl flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your password and account security</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/40">
                  <div>
                    <h4 className="font-semibold mb-1">Password</h4>
                    <p className="text-sm text-muted-foreground">
                      Change your password to keep your account secure
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setShowPasswordForm(!showPasswordForm)}>
                    {showPasswordForm ? 'Cancel' : 'Change Password'}
                  </Button>
                </div>

                {showPasswordForm && (
                  <Card className="border-border/40 bg-muted/20">
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-semibold">
                          New Password
                        </Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, newPassword: e.target.value })
                          }
                          placeholder="Enter new password (min. 8 characters)"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-semibold">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                          }
                          placeholder="Confirm your new password"
                          className="h-11"
                        />
                      </div>

                      <Button onClick={handlePasswordChange} className="w-full">
                        <Lock className="h-4 w-4 mr-2" />
                        Update Password
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Separator />

              <div className="bg-info/5 border border-info/20 rounded-lg p-6">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-info">
                  <Shield className="h-5 w-5" />
                  Security Tips
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-info mt-0.5">•</span>
                    Use a strong password with at least 8 characters
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-info mt-0.5">•</span>
                    Don't share your password with anyone
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-info mt-0.5">•</span>
                    Enable two-factor authentication for extra security
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </PageContent>
    </PageLayout>
  );
};

export default ProfilePage;
