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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Building2, Plus, Pencil, MapPin, Phone, Mail } from 'lucide-react';

interface BranchForm {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  is_main_branch: boolean;
}

const emptyForm: BranchForm = {
  name: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  phone: '',
  email: '',
  is_main_branch: false,
};

export default function CenterBranches() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BranchForm>(emptyForm);

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
    queryKey: ['center-branches', org?.id],
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
      if (!org) throw new Error('No organization');
      if (!form.name || !form.address || !form.city) throw new Error('Name, address, and city are required');

      if (editingId) {
        const { error } = await supabase
          .from('org_branches')
          .update({
            name: form.name,
            address: form.address,
            city: form.city,
            state: form.state || null,
            pincode: form.pincode || null,
            phone: form.phone || null,
            email: form.email || null,
            is_main_branch: form.is_main_branch,
          })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('org_branches').insert({
          organization_id: org.id,
          name: form.name,
          address: form.address,
          city: form.city,
          state: form.state || null,
          pincode: form.pincode || null,
          phone: form.phone || null,
          email: form.email || null,
          is_main_branch: form.is_main_branch,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingId ? 'Branch updated' : 'Branch added');
      queryClient.invalidateQueries({ queryKey: ['center-branches'] });
      queryClient.invalidateQueries({ queryKey: ['my-organization'] });
      closeDialog();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('org_branches')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Branch status updated');
      queryClient.invalidateQueries({ queryKey: ['center-branches'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const openEdit = (branch: any) => {
    setEditingId(branch.id);
    setForm({
      name: branch.name,
      address: branch.address,
      city: branch.city,
      state: branch.state || '',
      pincode: branch.pincode || '',
      phone: branch.phone || '',
      email: branch.email || '',
      is_main_branch: branch.is_main_branch,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Branch Management</h1>
          <p className="text-sm text-muted-foreground">Add, edit, and manage your center's branches</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              <Plus className="h-4 w-4" /> Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Branch Name *</Label>
                <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Main Lab" />
              </div>
              <div className="space-y-2">
                <Label>Address *</Label>
                <Input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Medical St" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Mumbai" />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))} placeholder="Maharashtra" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input value={form.pincode} onChange={(e) => setForm(f => ({ ...f, pincode: e.target.value }))} placeholder="400001" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 9876543210" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="branch@center.com" />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.is_main_branch} onCheckedChange={(v) => setForm(f => ({ ...f, is_main_branch: v }))} />
                <Label>Main Branch</Label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button onClick={() => saveBranch.mutate()} disabled={saveBranch.isPending || !form.name || !form.address || !form.city}>
                  {saveBranch.isPending ? 'Saving...' : editingId ? 'Update' : 'Add Branch'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading branches...</p>
      ) : !branches?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
            <Building2 className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">No branches yet. Add your first branch.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <Card key={branch.id} className={!branch.is_active ? 'opacity-60' : ''}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base">{branch.name}</CardTitle>
                  <div className="flex gap-2">
                    {branch.is_main_branch && <Badge variant="default" className="text-xs">Main</Badge>}
                    <Badge variant={branch.is_active ? 'secondary' : 'outline'} className="text-xs">
                      {branch.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(branch)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{branch.address}, {branch.city}{branch.state ? `, ${branch.state}` : ''}{branch.pincode ? ` - ${branch.pincode}` : ''}</span>
                </div>
                {branch.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" /> {branch.phone}
                  </div>
                )}
                {branch.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" /> {branch.email}
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Active</span>
                  <Switch
                    checked={branch.is_active}
                    onCheckedChange={(checked) => toggleActive.mutate({ id: branch.id, is_active: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
