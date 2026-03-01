import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, FileText, Star, StarOff, GripVertical } from 'lucide-react';

interface TemplateField {
  name: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  label: string;
  unit?: string;
  options?: string[];
  reference_min?: number;
  reference_max?: number;
}

export default function CenterTemplates() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    report_type: '',
    category: '',
    description: '',
    header_template: '',
    footer_template: '',
  });
  const [fields, setFields] = useState<TemplateField[]>([]);

  // Fetch org
  const { data: org } = useQuery({
    queryKey: ['my-organization', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['center-templates', org?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('organization_id', org!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!org?.id,
  });

  // Create template
  const createTemplate = useMutation({
    mutationFn: async () => {
      if (!org || !user) throw new Error('Not authenticated');
      if (!form.name || !form.report_type) throw new Error('Name and report type are required');

      const { error } = await supabase.from('report_templates').insert({
        organization_id: org.id,
        created_by: user.id,
        name: form.name,
        report_type: form.report_type,
        category: form.category || null,
        description: form.description || null,
        header_template: form.header_template || null,
        footer_template: form.footer_template || null,
        fields: fields as any,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Template created!');
      queryClient.invalidateQueries({ queryKey: ['center-templates'] });
      resetForm();
      setOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Delete template
  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('report_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Template deleted');
      queryClient.invalidateQueries({ queryKey: ['center-templates'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const resetForm = () => {
    setForm({ name: '', report_type: '', category: '', description: '', header_template: '', footer_template: '' });
    setFields([]);
  };

  const addField = () => {
    setFields([...fields, { name: '', type: 'text', label: '', unit: '' }]);
  };

  const updateField = (index: number, updates: Partial<TemplateField>) => {
    setFields(fields.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Report Templates</h1>
          <p className="text-muted-foreground text-sm">Create standardized templates for diagnostic reports</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Report Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name *</Label>
                  <Input
                    placeholder="e.g. Complete Blood Count"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Report Type *</Label>
                  <Select value={form.report_type} onValueChange={(v) => setForm(f => ({ ...f, report_type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blood_work">Blood Work</SelectItem>
                      <SelectItem value="urine_analysis">Urine Analysis</SelectItem>
                      <SelectItem value="x_ray">X-Ray</SelectItem>
                      <SelectItem value="mri">MRI</SelectItem>
                      <SelectItem value="ct_scan">CT Scan</SelectItem>
                      <SelectItem value="ultrasound">Ultrasound</SelectItem>
                      <SelectItem value="ecg">ECG</SelectItem>
                      <SelectItem value="pathology">Pathology</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    placeholder="e.g. Hematology"
                    value={form.category}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Brief description"
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Header Template</Label>
                <Textarea
                  placeholder="Header text that appears on every report..."
                  value={form.header_template}
                  onChange={(e) => setForm(f => ({ ...f, header_template: e.target.value }))}
                  rows={2}
                />
              </div>

              {/* Template Fields */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Report Fields</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addField} className="gap-1">
                    <Plus className="h-3 w-3" /> Add Field
                  </Button>
                </div>

                {fields.length === 0 && (
                  <div className="border border-dashed rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground">No fields added yet. Add fields to define the report structure.</p>
                  </div>
                )}

                {fields.map((field, i) => (
                  <Card key={i} className="p-3">
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 mt-2 text-muted-foreground/40 shrink-0" />
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        <Input
                          placeholder="Field name"
                          value={field.name}
                          onChange={(e) => updateField(i, { name: e.target.value })}
                        />
                        <Input
                          placeholder="Label"
                          value={field.label}
                          onChange={(e) => updateField(i, { label: e.target.value })}
                        />
                        <Select value={field.type} onValueChange={(v: any) => updateField(i, { type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="textarea">Text Area</SelectItem>
                            <SelectItem value="select">Dropdown</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1">
                          <Input
                            placeholder="Unit"
                            value={field.unit || ''}
                            onChange={(e) => updateField(i, { unit: e.target.value })}
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeField(i)} className="shrink-0">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {field.type === 'number' && (
                      <div className="flex gap-2 ml-6 mt-2">
                        <Input
                          type="number"
                          placeholder="Ref Min"
                          value={field.reference_min ?? ''}
                          onChange={(e) => updateField(i, { reference_min: Number(e.target.value) })}
                          className="w-24"
                        />
                        <Input
                          type="number"
                          placeholder="Ref Max"
                          value={field.reference_max ?? ''}
                          onChange={(e) => updateField(i, { reference_max: Number(e.target.value) })}
                          className="w-24"
                        />
                        <span className="text-xs text-muted-foreground self-center">Reference range</span>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Footer Template</Label>
                <Textarea
                  placeholder="Footer text / disclaimers..."
                  value={form.footer_template}
                  onChange={(e) => setForm(f => ({ ...f, footer_template: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button
                  onClick={() => createTemplate.mutate()}
                  disabled={createTemplate.isPending || !form.name || !form.report_type}
                >
                  {createTemplate.isPending ? 'Creating...' : 'Create Template'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Template List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
      ) : templates && templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => {
            const fieldCount = Array.isArray(t.fields) ? t.fields.length : 0;
            return (
              <Card key={t.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{t.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deleteTemplate.mutate(t.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {t.report_type.replace('_', ' ')}
                    </Badge>
                    {t.category && (
                      <Badge variant="outline" className="text-xs">{t.category}</Badge>
                    )}
                  </div>
                  {t.description && (
                    <p className="text-sm text-muted-foreground mb-2">{t.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {fieldCount} field{fieldCount !== 1 ? 's' : ''} • {t.is_default ? 'Default' : 'Custom'}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <FileText className="h-12 w-12 text-muted-foreground/30" />
            <div className="text-center">
              <p className="font-medium text-muted-foreground">No templates yet</p>
              <p className="text-sm text-muted-foreground/70">Create your first report template to standardize your diagnostic reports.</p>
            </div>
            <Button onClick={() => setOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Create Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
