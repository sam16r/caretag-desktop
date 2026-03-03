import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Plus, MapPin, Phone, Mail } from 'lucide-react';

export default function HospitalBranches() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<any>(null);

  const [form, setForm] = useState({
    name: '', address: '', city: '', state: '', pincode: '',
    phone: '', email: '', is_main_branch: false,
  });

  const { data: org } = useQuery({
    queryKey: ['my-organization', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('owner_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: branches, isLoading } = useQuery({
    queryKey: ['hospital-branches', org?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('org_branches')
        .select('*')
        .eq('organization_id', org!.id)
        .order('is_main_branch', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!org?.id,
  });

  const saveBranch = useMutation({
    mutationFn: async () => {
      if (!form.name || !form.address || !form.city) throw new Error('Name, address and city are required');
      if (editBranch) {
        const { error } = await supabase
          .from('org_branches')
          .update({ ...form })
          .eq('id', editBranch.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('org_branches').insert({
          ...form,
          organization_id: org!.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editBranch ? 'Branch updated' : 'Branch added');
      queryClient.invalidateQueries({ queryKey: ['hospital-branches'] });
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('org_branches')
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Branch status updated');
      queryClient.invalidateQueries({ queryKey: ['hospital-branches'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const resetForm = () => {
    setForm({ name: '', address: '', city: '', state: '', pincode: '', phone: '', email: '', is_main_branch: false });
    setEditBranch(null);
    setOpen(false);
  };

  const openEdit = (branch: any) => {
    setEditBranch(branch);
    setForm({
      name: branch.name, address: branch.address, city: branch.city,
      state: branch.state || '', pincode: branch.pincode || '',
      phone: branch.phone || '', email: branch.email || '',
      is_main_branch: branch.is_main_branch,
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hospital Branches</h1>
          <p className="text-muted-foreground text-sm">Manage branch locations for your hospital</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Branch</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editBranch ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Branch Name *</Label>
                <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Main Hospital" />
              </div>
              <div className="space-y-2">
                <Label>Address *</Label>
                <Input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full address" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input value={form.pincode} onChange={(e) => setForm(f => ({ ...f, pincode: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_main_branch} onCheckedChange={(v) => setForm(f => ({ ...f, is_main_branch: v }))} />
                <Label>Main Branch</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={() => saveBranch.mutate()} disabled={saveBranch.isPending}>
                  {editBranch ? 'Update' : 'Add'} Branch
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading branches...</div>
      ) : branches && branches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((branch: any) => (
            <Card key={branch.id} className={!branch.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    {branch.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {branch.is_main_branch && <Badge>Main</Badge>}
                    <Badge variant={branch.is_active ? 'default' : 'secondary'}>
                      {branch.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {branch.address}, {branch.city}{branch.state ? `, ${branch.state}` : ''} {branch.pincode || ''}
                </p>
                {branch.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> {branch.phone}
                  </p>
                )}
                {branch.email && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {branch.email}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(branch)}>Edit</Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive.mutate({ id: branch.id, isActive: !branch.is_active })}
                  >
                    {branch.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <Building2 className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">No branches configured yet</p>
            <Button onClick={() => setOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Add Branch
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
