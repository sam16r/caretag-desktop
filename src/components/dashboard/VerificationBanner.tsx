import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, XCircle, ShieldCheck } from 'lucide-react';

type VerificationStatus = 'pending' | 'under_review' | 'verified' | 'rejected';

interface VerificationBannerProps {
  orgId: string | undefined;
  status: VerificationStatus | undefined;
  notes?: string | null;
  type: 'center' | 'hospital';
}

const statusConfig: Record<VerificationStatus, {
  icon: typeof AlertCircle;
  title: string;
  variant: 'default' | 'destructive';
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'warning' | 'success';
  borderClass: string;
  bgClass: string;
}> = {
  pending: {
    icon: Clock,
    title: 'Verification Pending',
    variant: 'default',
    badgeVariant: 'warning',
    borderClass: 'border-yellow-500/50',
    bgClass: 'bg-yellow-500/5',
  },
  under_review: {
    icon: ShieldCheck,
    title: 'Under Review',
    variant: 'default',
    badgeVariant: 'secondary',
    borderClass: 'border-blue-500/50',
    bgClass: 'bg-blue-500/5',
  },
  verified: {
    icon: CheckCircle2,
    title: 'Verified',
    variant: 'default',
    badgeVariant: 'success',
    borderClass: 'border-green-500/50',
    bgClass: 'bg-green-500/5',
  },
  rejected: {
    icon: XCircle,
    title: 'Verification Rejected',
    variant: 'destructive',
    badgeVariant: 'destructive',
    borderClass: 'border-destructive/50',
    bgClass: 'bg-destructive/5',
  },
};

const statusMessages: Record<VerificationStatus, (type: string) => string> = {
  pending: (type) => `Your ${type} is pending verification. Some features may be limited until approved.`,
  under_review: (type) => `Your ${type} is currently being reviewed by our team. You'll be notified once complete.`,
  verified: (type) => `Your ${type} has been verified! All features are now available.`,
  rejected: (type) => `Your ${type} verification was rejected. Please review the notes below and resubmit.`,
};

export function VerificationBanner({ orgId, status, notes, type }: VerificationBannerProps) {
  const queryClient = useQueryClient();

  // Subscribe to real-time updates on this organization
  useEffect(() => {
    if (!orgId) return;

    const channel = supabase
      .channel(`org-verification-${orgId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'organizations',
          filter: `id=eq.${orgId}`,
        },
        () => {
          // Invalidate the org query to refetch updated status
          queryClient.invalidateQueries({ queryKey: ['my-organization'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId, queryClient]);

  if (!status || status === 'verified') {
    // Show a brief success banner that auto-dismisses could be added,
    // but for now show verified state briefly
    if (status === 'verified') {
      return (
        <Alert className={`${statusConfig.verified.borderClass} ${statusConfig.verified.bgClass}`}>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle className="flex items-center gap-2">
            Verified
            <Badge variant="success" className="text-xs">Active</Badge>
          </AlertTitle>
          <AlertDescription className="text-muted-foreground">
            {statusMessages.verified(type === 'center' ? 'diagnostic center' : 'hospital')}
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  }

  const config = statusConfig[status];
  const Icon = config.icon;
  const label = type === 'center' ? 'diagnostic center' : 'hospital';

  return (
    <Alert className={`${config.borderClass} ${config.bgClass}`}>
      <Icon className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        {config.title}
        <Badge variant={config.badgeVariant} className="text-xs capitalize">{status.replace('_', ' ')}</Badge>
      </AlertTitle>
      <AlertDescription className="text-muted-foreground">
        {statusMessages[status](label)}
        {status === 'rejected' && notes && (
          <p className="mt-2 text-sm font-medium text-destructive">
            Reason: {notes}
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
