import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ScanLine,
  FileText,
  Users,
  Building2,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Search,
  X,
  Timer,
  Plus,
  ClipboardList,
  Camera,
  Smartphone,
  Paperclip,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNfcScanner } from '@/hooks/useNfcScanner';
import { useQrScanner } from '@/hooks/useQrScanner';

export function CenterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Patient lookup state
  const [manualId, setManualId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundPatient, setFoundPatient] = useState<{ id: string; full_name: string; caretag_id: string } | null>(null);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('lookup');

  // Scan mode state
  const [scanMode, setScanMode] = useState<'idle' | 'nfc' | 'qr' | 'simulated'>('idle');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedTimer, setSimulatedTimer] = useState(5);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Report upload form state
  const [reportForm, setReportForm] = useState({
    report_type: '',
    title: '',
    description: '',
    findings: '',
    conclusion: '',
    template_id: '',
  });

  // Fetch organization
  const { data: org } = useQuery({
    queryKey: ['my-organization', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*, org_branches(*)')
        .eq('owner_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch report stats
  const { data: reportsStats } = useQuery({
    queryKey: ['center-report-stats', org?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diagnostic_reports')
        .select('status')
        .eq('organization_id', org!.id);
      if (error) throw error;
      const total = data.length;
      const draft = data.filter(r => r.status === 'draft').length;
      const finalized = data.filter(r => r.status === 'finalized').length;
      const delivered = data.filter(r => r.status === 'delivered').length;
      return { total, draft, finalized, delivered };
    },
    enabled: !!org?.id,
  });

  // Fetch templates for this org
  const { data: templates } = useQuery({
    queryKey: ['center-templates', org?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .or(`organization_id.eq.${org!.id},is_default.eq.true`)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: !!org?.id,
  });

  // Fetch members
  const { data: members } = useQuery({
    queryKey: ['center-members', org?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', org!.id)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: !!org?.id,
  });

  // Search patient by CareTag ID — only return name & ID
  const searchPatient = useCallback(async (caretagId: string) => {
    if (!caretagId.trim()) return;
    setIsSearching(true);
    setPatientError(null);
    setFoundPatient(null);

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, caretag_id')
        .eq('caretag_id', caretagId.trim().toUpperCase())
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setPatientError(`No patient found with CareTag ID: ${caretagId}`);
        return;
      }

      setFoundPatient(data);
      setActiveTab('upload');
      setScanMode('idle');
      toast.success(`Patient found: ${data.full_name}`);
    } catch (err) {
      console.error('Error searching patient:', err);
      setPatientError('Failed to search for patient. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, []);

  // NFC scanner
  const {
    isSupported: nfcSupported,
    error: nfcError,
    startScan: startNfcScan,
    stopScan: stopNfcScan,
  } = useNfcScanner(searchPatient);

  // QR scanner
  const {
    error: qrError,
    startScan: startQrScan,
    stopScan: stopQrScan,
  } = useQrScanner(searchPatient);

  const handleStartNfc = async () => {
    setScanMode('nfc');
    setPatientError(null);
    await startNfcScan();
  };

  const handleStartQr = async () => {
    setScanMode('qr');
    setPatientError(null);
    await new Promise(resolve => setTimeout(resolve, 100));
    await startQrScan('center-qr-reader');
  };

  const handleStopScan = () => {
    if (scanMode === 'nfc') stopNfcScan();
    else if (scanMode === 'qr') stopQrScan();
    else if (scanMode === 'simulated') setIsSimulating(false);
    setScanMode('idle');
    setSimulatedTimer(5);
  };

  // Simulated scan
  const handleSimulatedScan = () => {
    setScanMode('simulated');
    setIsSimulating(true);
    setSimulatedTimer(5);
    setPatientError(null);
    setFoundPatient(null);

    const interval = setInterval(() => {
      setSimulatedTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsSimulating(false);
          setScanMode('idle');
          supabase
            .from('patients')
            .select('id, full_name, caretag_id')
            .limit(10)
            .then(({ data }) => {
              if (data && data.length > 0) {
                const randomPatient = data[Math.floor(Math.random() * data.length)];
                setFoundPatient(randomPatient);
                setActiveTab('upload');
                toast.success(`Patient found: ${randomPatient.full_name}`);
              } else {
                setPatientError('No patients found in the system.');
              }
            });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be under 10MB');
        return;
      }
      setUploadedFile(file);
    }
  };

  const displayError = patientError || nfcError || qrError;

  // Submit report
  const uploadReport = useMutation({
    mutationFn: async () => {
      if (!foundPatient || !org) throw new Error('Missing patient or org');
      if (!reportForm.report_type || !reportForm.title) throw new Error('Report type and title are required');

      let fileUrl: string | null = null;
      let fileType: string | null = null;

      // Upload file if attached
      if (uploadedFile) {
        const ext = uploadedFile.name.split('.').pop();
        const filePath = `${org.id}/${foundPatient.id}/${Date.now()}.${ext}`;
        const { error: storageError } = await supabase.storage
          .from('org-documents')
          .upload(filePath, uploadedFile);
        if (storageError) throw new Error('File upload failed: ' + storageError.message);
        
        const { data: urlData } = supabase.storage
          .from('org-documents')
          .getPublicUrl(filePath);
        fileUrl = urlData.publicUrl;
        fileType = uploadedFile.type;
      }

      const { error } = await supabase.from('diagnostic_reports').insert({
        organization_id: org.id,
        patient_id: foundPatient.id,
        uploaded_by: user!.id,
        report_type: reportForm.report_type,
        title: reportForm.title,
        description: reportForm.description || null,
        findings: reportForm.findings || null,
        conclusion: reportForm.conclusion || null,
        template_id: reportForm.template_id || null,
        file_url: fileUrl,
        file_type: fileType,
        status: 'draft',
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Report uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['center-report-stats'] });
      setReportForm({ report_type: '', title: '', description: '', findings: '', conclusion: '', template_id: '' });
      setUploadedFile(null);
      setFoundPatient(null);
      setActiveTab('lookup');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to upload report');
    },
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchPatient(manualId);
  };

  const clearPatient = () => {
    setFoundPatient(null);
    setManualId('');
    setUploadedFile(null);
    setActiveTab('lookup');
  };

  const stats = [
    { title: 'Total Reports', value: reportsStats?.total ?? 0, icon: FileText, color: 'text-primary' },
    { title: 'Drafts', value: reportsStats?.draft ?? 0, icon: Clock, color: 'text-yellow-500' },
    { title: 'Finalized', value: reportsStats?.finalized ?? 0, icon: CheckCircle2, color: 'text-green-500' },
    { title: 'Staff', value: members?.length ?? 0, icon: Users, color: 'text-accent-foreground' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{org?.name ?? 'Diagnostic Center'}</h1>
          <p className="text-muted-foreground text-sm">Upload reports for patients using CareTag ID</p>
        </div>
        <Badge
          variant={org?.verification_status === 'verified' ? 'default' : 'secondary'}
          className="capitalize"
        >
          {org?.verification_status ?? 'pending'}
        </Badge>
      </div>

      {org?.verification_status === 'pending' && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Your center is pending verification. Some features may be limited until approved.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Workflow: Scan → Upload */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b px-4 pt-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="lookup" className="gap-2">
                  <ScanLine className="h-4 w-4" />
                  Patient Lookup
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-2" disabled={!foundPatient}>
                  <Upload className="h-4 w-4" />
                  Upload Report
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab 1: Patient Lookup */}
            <TabsContent value="lookup" className="p-4 space-y-4">
              {/* Active patient banner */}
              {foundPatient && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{foundPatient.full_name}</p>
                        <p className="text-xs text-muted-foreground">{foundPatient.caretag_id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setActiveTab('upload')} className="gap-1">
                        <Upload className="h-3 w-3" /> Upload Report
                      </Button>
                      <Button size="sm" variant="ghost" onClick={clearPatient}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Scan / Manual Entry */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CareTag Scanner */}
                <Card className="border-dashed">
                  <CardContent className="p-6 flex flex-col items-center justify-center gap-4 min-h-[250px]">
                    {scanMode === 'simulated' ? (
                      <>
                        <div className="relative">
                          <div className="h-20 w-20 rounded-full border-4 border-primary/20 flex items-center justify-center">
                            <span className="text-3xl font-bold text-primary">{simulatedTimer}</span>
                          </div>
                          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                        </div>
                        <Progress value={(5 - simulatedTimer) * 20} className="h-2 w-full max-w-[180px]" />
                        <p className="text-sm text-muted-foreground">Scanning CareTag...</p>
                        <Button variant="outline" size="sm" onClick={handleStopScan}>
                          <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                      </>
                    ) : scanMode === 'qr' ? (
                      <>
                        <div className="relative w-full aspect-square max-w-[220px] rounded-lg overflow-hidden bg-muted">
                          <div id="center-qr-reader" className="w-full h-full" />
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-36 h-36 relative">
                              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">Point camera at CareTag QR code</p>
                        <Button variant="outline" size="sm" onClick={handleStopScan}>
                          <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                      </>
                    ) : scanMode === 'nfc' ? (
                      <>
                        <div className="relative">
                          <Smartphone className="h-16 w-16 text-primary animate-pulse" />
                          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">Hold CareTag near device...</p>
                        <Button variant="outline" size="sm" onClick={handleStopScan}>
                          <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <ScanLine className="h-12 w-12 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground text-center">Scan patient's CareTag</p>
                        <div className="flex flex-col gap-2 w-full max-w-[200px]">
                          <Button onClick={handleSimulatedScan} className="gap-2 w-full">
                            <Timer className="h-4 w-4" /> Demo Scan (5s)
                          </Button>
                          <Button onClick={handleStartQr} variant="outline" className="gap-2 w-full">
                            <Camera className="h-4 w-4" /> QR Scan
                          </Button>
                          {nfcSupported && (
                            <Button onClick={handleStartNfc} variant="outline" className="gap-2 w-full">
                              <Smartphone className="h-4 w-4" /> NFC Scan
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Manual ID Entry */}
                <Card className="border-dashed">
                  <CardContent className="p-6 flex flex-col items-center justify-center gap-4 min-h-[250px]">
                    <Search className="h-12 w-12 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground text-center">Enter CareTag ID manually</p>
                    <form onSubmit={handleManualSubmit} className="flex gap-2 w-full max-w-[280px]">
                      <Input
                        placeholder="e.g. CT-001"
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value.toUpperCase())}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={!manualId.trim() || isSearching}>
                        {isSearching ? '...' : 'Go'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {displayError && (
                <Card className="border-destructive bg-destructive/10">
                  <CardContent className="p-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="text-sm text-destructive">{displayError}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tab 2: Upload Report */}
            <TabsContent value="upload" className="p-4 space-y-4">
              {foundPatient ? (
                <>
                  {/* Patient info banner (name only) */}
                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Uploading report for: {foundPatient.full_name}</p>
                        <p className="text-xs text-muted-foreground">{foundPatient.caretag_id}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Report Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Report Type *</Label>
                      <Select
                        value={reportForm.report_type}
                        onValueChange={(v) => setReportForm(f => ({ ...f, report_type: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
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

                    <div className="space-y-2">
                      <Label>Template (Optional)</Label>
                      <Select
                        value={reportForm.template_id}
                        onValueChange={(v) => setReportForm(f => ({ ...f, template_id: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {templates?.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Report Title *</Label>
                    <Input
                      placeholder="e.g. Complete Blood Count (CBC)"
                      value={reportForm.title}
                      onChange={(e) => setReportForm(f => ({ ...f, title: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Brief description of the test..."
                      value={reportForm.description}
                      onChange={(e) => setReportForm(f => ({ ...f, description: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Findings</Label>
                    <Textarea
                      placeholder="Enter test findings and results..."
                      value={reportForm.findings}
                      onChange={(e) => setReportForm(f => ({ ...f, findings: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Conclusion</Label>
                    <Textarea
                      placeholder="Summary / conclusion..."
                      value={reportForm.conclusion}
                      onChange={(e) => setReportForm(f => ({ ...f, conclusion: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  {/* File Attachment */}
                  <div className="space-y-2">
                    <Label>Attach Report File (PDF, Image)</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.dicom"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2"
                      >
                        <Paperclip className="h-4 w-4" />
                        {uploadedFile ? 'Change File' : 'Choose File'}
                      </Button>
                      {uploadedFile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span className="truncate max-w-[200px]">{uploadedFile.name}</span>
                          <span className="text-xs">({(uploadedFile.size / 1024).toFixed(0)} KB)</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setUploadedFile(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={clearPatient}>Cancel</Button>
                    <Button
                      onClick={() => uploadReport.mutate()}
                      disabled={uploadReport.isPending || !reportForm.report_type || !reportForm.title}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {uploadReport.isPending ? 'Uploading...' : 'Upload Report'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                  <ScanLine className="h-12 w-12 text-muted-foreground/30" />
                  <div>
                    <p className="font-medium text-muted-foreground">No patient selected</p>
                    <p className="text-sm text-muted-foreground/70">Scan a CareTag or enter an ID to start uploading a report.</p>
                  </div>
                  <Button variant="outline" onClick={() => setActiveTab('lookup')} className="gap-2">
                    <ScanLine className="h-4 w-4" /> Go to Patient Lookup
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Bottom cards: Branches & Recent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" /> Branches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {org?.org_branches && org.org_branches.length > 0 ? (
              <div className="space-y-3">
                {org.org_branches.map((branch: any) => (
                  <div key={branch.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{branch.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {branch.city}{branch.state ? `, ${branch.state}` : ''}
                      </p>
                    </div>
                    <Badge variant={branch.is_main_branch ? 'default' : 'outline'} className="text-xs">
                      {branch.is_main_branch ? 'Main' : 'Branch'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No branches configured yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setActiveTab('lookup')}>
              <ScanLine className="h-4 w-4" /> Scan & Upload Report
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/center/staff')}>
              <Users className="h-4 w-4" /> Manage Staff
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/center/templates')}>
              <Plus className="h-4 w-4" /> Create Report Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
