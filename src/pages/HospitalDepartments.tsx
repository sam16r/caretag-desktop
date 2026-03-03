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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  X,
  Building2,
  Stethoscope,
  FileText,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Bed,
} from 'lucide-react';

export default function HospitalDepartments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newDept, setNewDept] = useState('');
  const [addDeptOpen, setAddDeptOpen] = useState(false);

  const { data: org } = useQuery({
    queryKey: ['my-organization', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: members } = useQuery({
    queryKey: ['hospital-members-dept', org?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', org!.id)
        .eq('is_active', true);
      if (error) throw error;

      const userIds = data.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, department, specialization')
        .in('id', userIds);

      return data.map(m => ({
        ...m,
        profile: profiles?.find(p => p.id === m.user_id),
      }));
    },
    enabled: !!org?.id,
  });

  const addDepartment = useMutation({
    mutationFn: async (deptName: string) => {
      const current = org?.departments ?? [];
      if (current.includes(deptName)) throw new Error('Department already exists');
      const { error } = await supabase
        .from('organizations')
        .update({ departments: [...current, deptName] })
        .eq('id', org!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Department added');
      queryClient.invalidateQueries({ queryKey: ['my-organization'] });
      setNewDept('');
      setAddDeptOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const removeDepartment = useMutation({
    mutationFn: async (deptName: string) => {
      const current = org?.departments ?? [];
      const { error } = await supabase
        .from('organizations')
        .update({ departments: current.filter((d: string) => d !== deptName) })
        .eq('id', org!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Department removed');
      queryClient.invalidateQueries({ queryKey: ['my-organization'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateBedCapacity = useMutation({
    mutationFn: async (numBeds: number) => {
      const { error } = await supabase
        .from('organizations')
        .update({ num_beds: numBeds })
        .eq('id', org!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Bed capacity updated');
      queryClient.invalidateQueries({ queryKey: ['my-organization'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const departments = org?.departments ?? [];

  // Group members by department
  const deptMembers: Record<string, any[]> = {};
  departments.forEach((d: string) => { deptMembers[d] = []; });
  deptMembers['Unassigned'] = [];
  members?.forEach((m: any) => {
    const dept = m.profile?.department;
    if (dept && deptMembers[dept]) {
      deptMembers[dept].push(m);
    } else {
      deptMembers['Unassigned'].push(m);
    }
  });

  // Certificates
  const certificates = [
    { label: 'Registration Certificate', url: org?.registration_certificate_url, number: org?.registration_number },
    { label: 'Clinical Establishment License', url: org?.clinical_establishment_license_url },
    { label: 'Accreditation', url: null, number: org?.accreditation_number, type: org?.accreditation_type },
    { label: 'GST Registration', url: null, number: org?.gst_number },
  ].filter(c => c.url || c.number);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Departments & Certificates</h1>
        <p className="text-muted-foreground text-sm">Manage departments, bed capacity, and view hospital documents</p>
      </div>

      <Tabs defaultValue="departments">
        <TabsList>
          <TabsTrigger value="departments" className="gap-2">
            <Stethoscope className="h-4 w-4" /> Departments
          </TabsTrigger>
          <TabsTrigger value="capacity" className="gap-2">
            <Bed className="h-4 w-4" /> Capacity
          </TabsTrigger>
          <TabsTrigger value="certificates" className="gap-2">
            <ShieldCheck className="h-4 w-4" /> Certificates
          </TabsTrigger>
        </TabsList>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{departments.length} department(s) configured</p>
            <Dialog open={addDeptOpen} onOpenChange={setAddDeptOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Department</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Department</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Department Name</Label>
                    <Input
                      placeholder="e.g. Cardiology, Orthopedics"
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <p className="text-xs text-muted-foreground w-full">Quick add:</p>
                    {['Cardiology', 'Orthopedics', 'Neurology', 'Pediatrics', 'Oncology', 'Radiology', 'Pathology', 'General Medicine', 'Surgery', 'Emergency', 'ICU', 'Gynecology'].map(d => (
                      <Button
                        key={d}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        disabled={departments.includes(d)}
                        onClick={() => addDepartment.mutate(d)}
                      >
                        {d}
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setAddDeptOpen(false)}>Cancel</Button>
                    <Button disabled={!newDept.trim()} onClick={() => addDepartment.mutate(newDept.trim())}>
                      Add
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {departments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departments.map((dept: string) => (
                <Card key={dept}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        {dept}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeDepartment.mutate(dept)}
                      >
                        <X className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Stethoscope className="h-3.5 w-3.5" />
                      {deptMembers[dept]?.length ?? 0} member(s)
                    </div>
                    {deptMembers[dept]?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {deptMembers[dept].slice(0, 3).map((m: any) => (
                          <div key={m.id} className="text-xs flex items-center gap-2">
                            <span className="font-medium">{m.profile?.full_name || 'Unknown'}</span>
                            <Badge variant="outline" className="text-[10px] h-4 capitalize">{m.role}</Badge>
                          </div>
                        ))}
                        {deptMembers[dept].length > 3 && (
                          <p className="text-xs text-muted-foreground">+{deptMembers[dept].length - 3} more</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                <Building2 className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">No departments configured yet</p>
                <Button onClick={() => setAddDeptOpen(true)} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> Add Department
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Capacity Tab */}
        <TabsContent value="capacity" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bed className="h-4 w-4" /> Bed Capacity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="space-y-2 flex-1 max-w-xs">
                  <Label>Total Beds</Label>
                  <Input
                    type="number"
                    min="0"
                    value={org?.num_beds ?? ''}
                    placeholder="Enter total bed count"
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 0) {
                        updateBedCapacity.mutate(val);
                      }
                    }}
                  />
                </div>
                <div className="pt-6">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    <Bed className="h-4 w-4 mr-2" />
                    {org?.num_beds ?? 0} beds
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                This reflects the total capacity across all branches. You can update this anytime.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-4 mt-4">
          {certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <p className="font-medium text-sm">{cert.label}</p>
                    </div>
                    {cert.number && (
                      <p className="text-sm text-muted-foreground">
                        {cert.type && <span className="capitalize">{cert.type}: </span>}
                        {cert.number}
                      </p>
                    )}
                    {cert.url && (
                      <Button variant="outline" size="sm" className="gap-2" asChild>
                        <a href={cert.url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-3.5 w-3.5" /> View Document <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground/30" />
                <div className="text-center">
                  <p className="font-medium text-muted-foreground">No certificates uploaded</p>
                  <p className="text-sm text-muted-foreground/70">
                    Certificates were collected during signup. Contact support to update them.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
