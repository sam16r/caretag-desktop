import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User, Lock, Bell, Shield, FileText, Save, Eye, EyeOff,
} from 'lucide-react';

export default function Settings() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Profile form
  const [profileForm, setProfileForm] = useState<Record<string, string>>({});
  const filledProfile = {
    full_name: profileForm.full_name ?? profile?.full_name ?? '',
    phone: profileForm.phone ?? profile?.phone ?? '',
    specialization: profileForm.specialization ?? profile?.specialization ?? '',
    clinic_name: profileForm.clinic_name ?? profile?.clinic_name ?? '',
    clinic_address: profileForm.clinic_address ?? profile?.clinic_address ?? '',
    city: profileForm.city ?? profile?.city ?? '',
    state: profileForm.state ?? profile?.state ?? '',
  };

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: filledProfile.full_name,
          phone: filledProfile.phone,
          specialization: filledProfile.specialization,
          clinic_name: filledProfile.clinic_name,
          clinic_address: filledProfile.clinic_address,
          city: filledProfile.city,
          state: filledProfile.state,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Profile updated');
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      setProfileForm({});
    },
    onError: () => toast.error('Failed to update profile'),
  });

  // Password change
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const changePassword = useMutation({
    mutationFn: async () => {
      if (passwords.new !== passwords.confirm) throw new Error('Passwords do not match');
      if (passwords.new.length < 6) throw new Error('Password must be at least 6 characters');
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Notification prefs (stored locally for now)
  const [notifPrefs, setNotifPrefs] = useState({
    appointments: true,
    labResults: true,
    emergencies: true,
    messages: true,
  });

  const initials = filledProfile.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" />Profile</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Lock className="h-4 w-4" />Security</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" />Notifications</TabsTrigger>
          {role === 'admin' && (
            <TabsTrigger value="admin" className="gap-2"><Shield className="h-4 w-4" />Admin</TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal and professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{filledProfile.full_name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Badge variant="secondary" className="mt-1 capitalize">{role?.replace('_', ' ') ?? 'Doctor'}</Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={filledProfile.full_name} onChange={(e) => setProfileForm(p => ({ ...p, full_name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={filledProfile.phone} onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                {(role === 'doctor') && (
                  <>
                    <div className="space-y-2">
                      <Label>Specialization</Label>
                      <Input value={filledProfile.specialization} onChange={(e) => setProfileForm(p => ({ ...p, specialization: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Clinic Name</Label>
                      <Input value={filledProfile.clinic_name} onChange={(e) => setProfileForm(p => ({ ...p, clinic_name: e.target.value }))} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Clinic Address</Label>
                      <Input value={filledProfile.clinic_address} onChange={(e) => setProfileForm(p => ({ ...p, clinic_address: e.target.value }))} />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={filledProfile.city} onChange={(e) => setProfileForm(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={filledProfile.state} onChange={(e) => setProfileForm(p => ({ ...p, state: e.target.value }))} />
                </div>
              </div>

              <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending} className="gap-2">
                <Save className="h-4 w-4" />
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          {profile?.verification_status && (
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Badge variant={profile.verification_status === 'verified' ? 'success' : profile.verification_status === 'rejected' ? 'destructive' : 'warning'} className="capitalize">
                    {profile.verification_status}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {profile.verification_status === 'verified'
                      ? 'Your account has been verified.'
                      : profile.verification_status === 'rejected'
                      ? 'Your verification was rejected. Please update your documents.'
                      : 'Your verification is in progress.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Input
                    type={showPw ? 'text' : 'password'}
                    value={passwords.new}
                    onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Confirm new password"
                />
              </div>
              <Button onClick={() => changePassword.mutate()} disabled={changePassword.isPending || !passwords.new}>
                {changePassword.isPending ? 'Changing...' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Role</span>
                <Badge variant="outline" className="capitalize">{role?.replace('_', ' ')}</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Account created</span>
                <span className="text-sm font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose which notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'appointments', label: 'Appointments', desc: 'Upcoming appointment reminders and status changes' },
                { key: 'labResults', label: 'Lab Results', desc: 'New lab results and report notifications' },
                { key: 'emergencies', label: 'Emergencies', desc: 'Critical patient alerts and emergency records' },
                { key: 'messages', label: 'Messages', desc: 'New secure messages from colleagues' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifPrefs[item.key as keyof typeof notifPrefs]}
                    onCheckedChange={(checked) => setNotifPrefs(p => ({ ...p, [item.key]: checked }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Tab */}
        {role === 'admin' && (
          <TabsContent value="admin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Admin Controls</CardTitle>
                <CardDescription>System-wide administration tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.location.href = '/settings'}>
                  <FileText className="h-4 w-4" /> View Audit Logs (in Dashboard)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
