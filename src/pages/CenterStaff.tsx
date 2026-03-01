import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Trash2, Users, UserPlus, Mail, Shield } from 'lucide-react';

export default function CenterStaff() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Invite form
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'technician' as 'technician' | 'doctor' | 'receptionist',
    branch_id: '',
  });

  // Fetch org
  const { data: org } = useQuery({
    queryKey: ['my-organization', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, org_branches(*)')
        .eq('owner_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch members with profiles
  const { data: members, isLoading } = useQuery({
    queryKey: ['center-staff', org?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', org!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch profiles for each member
      const userIds = data.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      return data.map(m => ({
        ...m,
        profile: profiles?.find(p => p.id === m.user_id),
      }));
    },
    enabled: !!org?.id,
  });

  // Remove member
  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Staff member removed');
      queryClient.invalidateQueries({ queryKey: ['center-staff'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Update member role
  const updateRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: role as any })
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Role updated');
      queryClient.invalidateQueries({ queryKey: ['center-staff'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Toggle active status
  const toggleActive = useMutation({
    mutationFn: async ({ memberId, isActive }: { memberId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('organization_members')
        .update({ is_active: isActive })
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['center-staff'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'default';
      case 'doctor': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground text-sm">Manage your center's team members and roles</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" /> Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  placeholder="staff@example.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(f => ({ ...f, email: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  The user must already have a CareTag account.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Role *</Label>
                <Select
                  value={inviteForm.role}
                  onValueChange={(v: any) => setInviteForm(f => ({ ...f, role: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {org?.org_branches && org.org_branches.length > 1 && (
                <div className="space-y-2">
                  <Label>Assign to Branch</Label>
                  <Select
                    value={inviteForm.branch_id}
                    onValueChange={(v) => setInviteForm(f => ({ ...f, branch_id: v }))}
                  >
                    <SelectTrigger><SelectValue placeholder="All branches" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Branches</SelectItem>
                      {org.org_branches.map((b: any) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button
                  disabled={!inviteForm.email}
                  onClick={async () => {
                    try {
                      // Look up user by email
                      const { data: profile, error: profileErr } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('email', inviteForm.email)
                        .single();
                      
                      if (profileErr || !profile) {
                        toast.error('No account found with that email. They must sign up first.');
                        return;
                      }

                      const { error } = await supabase.from('organization_members').insert({
                        organization_id: org!.id,
                        user_id: profile.id,
                        role: inviteForm.role as any,
                        branch_id: inviteForm.branch_id || null,
                      });

                      if (error) throw error;
                      toast.success('Staff member added!');
                      queryClient.invalidateQueries({ queryKey: ['center-staff'] });
                      setInviteForm({ email: '', role: 'technician', branch_id: '' });
                      setOpen(false);
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to add staff');
                    }
                  }}
                >
                  Add Member
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{members?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Total Staff</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{members?.filter(m => m.is_active).length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading staff...</div>
      ) : members && members.length > 0 ? (
        <div className="space-y-3">
          {members.map((member: any) => (
            <Card key={member.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {member.profile?.full_name?.substring(0, 2).toUpperCase() || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {member.profile?.full_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {member.profile?.email || 'No email'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getRoleBadgeVariant(member.role)} className="capitalize">
                    {member.role}
                  </Badge>
                  <Badge variant={member.is_active ? 'default' : 'secondary'} className="text-xs">
                    {member.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {member.role !== 'owner' && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive.mutate({
                          memberId: member.id,
                          isActive: !member.is_active,
                        })}
                      >
                        {member.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeMember.mutate(member.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <Users className="h-12 w-12 text-muted-foreground/30" />
            <div className="text-center">
              <p className="font-medium text-muted-foreground">No staff members yet</p>
              <p className="text-sm text-muted-foreground/70">Add team members to your center.</p>
            </div>
            <Button onClick={() => setOpen(true)} className="gap-2">
              <UserPlus className="h-4 w-4" /> Add Staff
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
