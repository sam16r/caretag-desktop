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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Users, UserPlus, Mail, Shield, Stethoscope, Search } from 'lucide-react';

export default function HospitalStaff() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'doctor' as 'technician' | 'doctor' | 'receptionist' | 'admin',
    branch_id: '',
  });

  const { data: org } = useQuery({
    queryKey: ['my-organization', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, departments, org_branches(*)')
        .eq('owner_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: members, isLoading } = useQuery({
    queryKey: ['hospital-staff', org?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', org!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const userIds = data.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, specialization, department')
        .in('id', userIds);

      return data.map(m => ({
        ...m,
        profile: profiles?.find(p => p.id === m.user_id),
      }));
    },
    enabled: !!org?.id,
  });

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
      queryClient.invalidateQueries({ queryKey: ['hospital-staff'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

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
      queryClient.invalidateQueries({ queryKey: ['hospital-staff'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

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
      queryClient.invalidateQueries({ queryKey: ['hospital-staff'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleAddMember = async () => {
    try {
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
      queryClient.invalidateQueries({ queryKey: ['hospital-staff'] });
      setInviteForm({ email: '', role: 'doctor', branch_id: '' });
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add staff');
    }
  };

  const filteredMembers = members?.filter(m => {
    const matchesSearch = !searchQuery ||
      m.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || m.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const doctors = members?.filter(m => m.role === 'doctor') ?? [];
  const otherStaff = members?.filter(m => m.role !== 'doctor') ?? [];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': case 'admin': return 'default' as const;
      case 'doctor': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

  const MemberCard = ({ member }: { member: any }) => (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {member.profile?.full_name?.substring(0, 2).toUpperCase() || '??'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{member.profile?.full_name || 'Unknown'}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {member.profile?.email || 'No email'}
            </p>
            {member.profile?.specialization && (
              <p className="text-xs text-muted-foreground mt-0.5">{member.profile.specialization}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {member.profile?.department && (
            <Badge variant="outline" className="text-xs">{member.profile.department}</Badge>
          )}
          <Badge variant={getRoleBadgeVariant(member.role)} className="capitalize">{member.role}</Badge>
          <Badge variant={member.is_active ? 'default' : 'secondary'} className="text-xs">
            {member.is_active ? 'Active' : 'Inactive'}
          </Badge>
          {member.role !== 'owner' && (
            <div className="flex gap-1">
              <Select
                value={member.role}
                onValueChange={(v) => updateRole.mutate({ memberId: member.id, role: v })}
              >
                <SelectTrigger className="h-8 w-[110px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleActive.mutate({ memberId: member.id, isActive: !member.is_active })}
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
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Doctors & Staff</h1>
          <p className="text-muted-foreground text-sm">Manage your hospital's doctors, technicians, and staff</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><UserPlus className="h-4 w-4" /> Add Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Staff / Doctor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  placeholder="doctor@example.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(f => ({ ...f, email: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">The user must already have a CareTag account.</p>
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={inviteForm.role} onValueChange={(v: any) => setInviteForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {org?.org_branches && org.org_branches.length > 1 && (
                <div className="space-y-2">
                  <Label>Assign to Branch</Label>
                  <Select value={inviteForm.branch_id} onValueChange={(v) => setInviteForm(f => ({ ...f, branch_id: v }))}>
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
                <Button disabled={!inviteForm.email} onClick={handleAddMember}>Add Member</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Stethoscope className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{doctors.length}</p>
              <p className="text-xs text-muted-foreground">Doctors</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-accent-foreground" />
            <div>
              <p className="text-2xl font-bold">{otherStaff.length}</p>
              <p className="text-xs text-muted-foreground">Other Staff</p>
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
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{members?.filter(m => !m.is_active).length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Inactive</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="doctor">Doctors</SelectItem>
            <SelectItem value="technician">Technicians</SelectItem>
            <SelectItem value="receptionist">Receptionists</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="owner">Owners</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({members?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="doctors">Doctors ({doctors.length})</TabsTrigger>
          <TabsTrigger value="staff">Staff ({otherStaff.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-3 mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredMembers && filteredMembers.length > 0 ? (
            filteredMembers.map((m: any) => <MemberCard key={m.id} member={m} />)
          ) : (
            <EmptyState onAdd={() => setOpen(true)} />
          )}
        </TabsContent>
        <TabsContent value="doctors" className="space-y-3 mt-4">
          {doctors.length > 0 ? doctors.map((m: any) => <MemberCard key={m.id} member={m} />) : (
            <EmptyState label="doctors" onAdd={() => { setInviteForm(f => ({ ...f, role: 'doctor' })); setOpen(true); }} />
          )}
        </TabsContent>
        <TabsContent value="staff" className="space-y-3 mt-4">
          {otherStaff.length > 0 ? otherStaff.map((m: any) => <MemberCard key={m.id} member={m} />) : (
            <EmptyState label="staff" onAdd={() => setOpen(true)} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ label = 'members', onAdd }: { label?: string; onAdd: () => void }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
        <Users className="h-12 w-12 text-muted-foreground/30" />
        <div className="text-center">
          <p className="font-medium text-muted-foreground">No {label} yet</p>
          <p className="text-sm text-muted-foreground/70">Add team members to your hospital.</p>
        </div>
        <Button onClick={onAdd} className="gap-2">
          <UserPlus className="h-4 w-4" /> Add {label}
        </Button>
      </CardContent>
    </Card>
  );
}
