import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  FileText,
  Phone,
  Mail,
  MapPin,
  Building2,
  ExternalLink,
  Loader2,
  Globe,
  Bed,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type OrgVerificationFilter = 'pending' | 'under_review' | 'verified' | 'rejected' | 'all';
type OrgTypeFilter = 'all' | 'diagnostic_center' | 'hospital';

interface Organization {
  id: string;
  name: string;
  type: 'diagnostic_center' | 'hospital';
  email: string | null;
  phone: string | null;
  address: string;
  city: string;
  state: string | null;
  pincode: string | null;
  website: string | null;
  owner_id: string;
  verification_status: string;
  verification_notes: string | null;
  registration_number: string | null;
  registration_certificate_url: string | null;
  clinical_establishment_license_url: string | null;
  accreditation_number: string | null;
  accreditation_type: string | null;
  gst_number: string | null;
  owner_id_proof_url: string | null;
  logo_url: string | null;
  letterhead_url: string | null;
  departments: string[] | null;
  num_beds: number | null;
  created_at: string;
  verified_at: string | null;
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  under_review: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  verified: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5" />,
  under_review: <Search className="h-3.5 w-3.5" />,
  verified: <CheckCircle className="h-3.5 w-3.5" />,
  rejected: <XCircle className="h-3.5 w-3.5" />,
};

export function OrgVerificationPanel() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrgVerificationFilter>('pending');
  const [typeFilter, setTypeFilter] = useState<OrgTypeFilter>('all');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  // Fetch organizations
  const { data: orgs, isLoading } = useQuery({
    queryKey: ['org-verifications', statusFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('verification_status', statusFilter);
      }
      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Organization[];
    },
  });

  // Fetch owner profiles for display
  const ownerIds = orgs?.map(o => o.owner_id) ?? [];
  const { data: ownerProfiles } = useQuery({
    queryKey: ['org-owner-profiles', ownerIds],
    queryFn: async () => {
      if (ownerIds.length === 0) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .in('id', ownerIds);
      if (error) throw error;
      return data;
    },
    enabled: ownerIds.length > 0,
  });

  const getOwner = (ownerId: string) => ownerProfiles?.find(p => p.id === ownerId);

  // Update verification status
  const updateStatus = useMutation({
    mutationFn: async ({ orgId, status, notes }: { orgId: string; status: string; notes?: string }) => {
      const currentUser = (await supabase.auth.getUser()).data.user;
      const updateData: any = {
        verification_status: status,
        verification_notes: notes || null,
      };
      if (status === 'verified') {
        updateData.verified_at = new Date().toISOString();
        updateData.verified_by = currentUser?.id;
      }
      const { error } = await supabase
        .from('organizations')
        .update(updateData)
        .eq('id', orgId);
      if (error) throw error;

      // Audit log
      await supabase.from('audit_logs').insert({
        user_id: currentUser?.id,
        action: `org_verification_${status}`,
        entity_type: 'organization',
        entity_id: orgId,
        details: { status, notes },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['org-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['pending-org-count'] });
      toast.success(`Organization ${variables.status === 'verified' ? 'verified' : variables.status === 'rejected' ? 'rejected' : 'updated'} successfully`);
      setIsReviewOpen(false);
      setSelectedOrg(null);
      setReviewNotes('');
    },
    onError: () => toast.error('Failed to update verification status'),
  });

  const filteredOrgs = orgs?.filter(org => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      org.name.toLowerCase().includes(s) ||
      org.email?.toLowerCase().includes(s) ||
      org.registration_number?.toLowerCase().includes(s) ||
      org.city.toLowerCase().includes(s)
    );
  });

  const pendingCount = orgs?.filter(o => o.verification_status === 'pending').length || 0;

  const openDocument = (url: string | null, bucket = 'org-documents') => {
    if (!url) { toast.error('Document not available'); return; }
    const { data } = supabase.storage.from(bucket).getPublicUrl(url);
    window.open(data.publicUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Organization Verification
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Review and verify diagnostic centers & hospitals
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1.5 px-3 py-1.5">
            <Clock className="h-3.5 w-3.5" />
            {pendingCount} pending verification{pendingCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, registration..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrgVerificationFilter)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as OrgTypeFilter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="diagnostic_center">Diagnostic Centers</SelectItem>
            <SelectItem value="hospital">Hospitals</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Org List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : filteredOrgs && filteredOrgs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrgs.map((org) => {
            const owner = getOwner(org.owner_id);
            return (
              <Card
                key={org.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => { setSelectedOrg(org); setReviewNotes(org.verification_notes || ''); setIsReviewOpen(true); }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold truncate">{org.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {org.type.replace('_', ' ')}
                          </p>
                        </div>
                        <Badge variant="outline" className={`${statusColors[org.verification_status]} gap-1 flex-shrink-0 capitalize`}>
                          {statusIcons[org.verification_status]}
                          {org.verification_status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">{org.city}{org.state ? `, ${org.state}` : ''}</span>
                        </div>
                        {org.registration_number && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-3.5 w-3.5" />
                            <span className="font-mono text-xs">{org.registration_number}</span>
                          </div>
                        )}
                        {owner && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            <span className="text-xs">Owner: {owner.full_name}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Applied: {format(new Date(org.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 text-success/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No organizations to verify</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {statusFilter === 'pending'
                ? 'All pending verifications have been processed'
                : 'No organizations found with the selected filters'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Review Organization Application
            </DialogTitle>
            <DialogDescription>
              Verify credentials and documents before approving
            </DialogDescription>
          </DialogHeader>

          {selectedOrg && (
            <div className="space-y-6 py-4">
              {/* Org Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Organization Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs">Name</p>
                    <p className="font-medium">{selectedOrg.name}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs">Type</p>
                    <p className="font-medium capitalize">{selectedOrg.type.replace('_', ' ')}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs">Email</p>
                    <p className="font-medium flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {selectedOrg.email || 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs">Phone</p>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> {selectedOrg.phone || 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 col-span-2">
                    <p className="text-muted-foreground text-xs">Address</p>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {selectedOrg.address}, {selectedOrg.city}{selectedOrg.state ? `, ${selectedOrg.state}` : ''} {selectedOrg.pincode || ''}
                    </p>
                  </div>
                  {selectedOrg.website && (
                    <div className="p-3 rounded-lg bg-muted/50 col-span-2">
                      <p className="text-muted-foreground text-xs">Website</p>
                      <a href={selectedOrg.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5" /> {selectedOrg.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Hospital-specific */}
              {selectedOrg.type === 'hospital' && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    Hospital Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-muted-foreground text-xs">Bed Capacity</p>
                      <p className="font-medium">{selectedOrg.num_beds ?? 'Not specified'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-muted-foreground text-xs">Departments</p>
                      <p className="font-medium">{selectedOrg.departments?.length ?? 0} configured</p>
                    </div>
                  </div>
                  {selectedOrg.departments && selectedOrg.departments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedOrg.departments.map((d: string) => (
                        <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Registration & Accreditation */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Registration & Accreditation
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-muted-foreground text-xs">Registration Number</p>
                    <p className="font-mono font-semibold text-primary">
                      {selectedOrg.registration_number || 'Not provided'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs">GST Number</p>
                    <p className="font-mono font-medium">{selectedOrg.gst_number || 'Not provided'}</p>
                  </div>
                  {selectedOrg.accreditation_number && (
                    <div className="p-3 rounded-lg bg-muted/50 col-span-2">
                      <p className="text-muted-foreground text-xs">
                        Accreditation ({selectedOrg.accreditation_type || 'Type N/A'})
                      </p>
                      <p className="font-mono font-medium">{selectedOrg.accreditation_number}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Owner Info */}
              {(() => {
                const owner = getOwner(selectedOrg.owner_id);
                return owner ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Owner Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-muted-foreground text-xs">Name</p>
                        <p className="font-medium">{owner.full_name}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-muted-foreground text-xs">Email</p>
                        <p className="font-medium">{owner.email}</p>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Documents */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Uploaded Documents
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: 'Registration Certificate', url: selectedOrg.registration_certificate_url },
                    { label: 'Clinical Establishment License', url: selectedOrg.clinical_establishment_license_url },
                    { label: 'Owner ID Proof', url: selectedOrg.owner_id_proof_url },
                    { label: 'Logo', url: selectedOrg.logo_url },
                    { label: 'Letterhead', url: selectedOrg.letterhead_url },
                  ].map((doc, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center gap-2"
                      onClick={(e) => { e.stopPropagation(); openDocument(doc.url); }}
                      disabled={!doc.url}
                    >
                      <FileText className="h-5 w-5" />
                      <span className="text-xs text-center">{doc.label}</span>
                      {doc.url ? (
                        <Badge variant="outline" className="text-[10px]">Available</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Missing</Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Verification Notes</h4>
                <Textarea
                  placeholder="Add notes about this verification (visible internally only)..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex gap-2">
                  {selectedOrg.verification_status !== 'under_review' && (
                    <Button
                      variant="outline"
                      onClick={() => updateStatus.mutate({ orgId: selectedOrg.id, status: 'under_review', notes: reviewNotes })}
                      disabled={updateStatus.isPending}
                    >
                      Mark Under Review
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (!reviewNotes.trim()) {
                        toast.error('Please add notes explaining the rejection');
                        return;
                      }
                      updateStatus.mutate({ orgId: selectedOrg.id, status: 'rejected', notes: reviewNotes });
                    }}
                    disabled={updateStatus.isPending}
                    className="gap-1"
                  >
                    {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    Reject
                  </Button>
                  <Button
                    onClick={() => updateStatus.mutate({ orgId: selectedOrg.id, status: 'verified', notes: reviewNotes })}
                    disabled={updateStatus.isPending}
                    className="gap-1"
                  >
                    {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Verify & Approve
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
