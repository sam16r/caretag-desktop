import { Check, User, Building2, Shield, Microscope } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { AccountType } from '../AccountTypeSelector';
import type { CenterDetailsData } from './CenterDetailsStep';
import type { CenterVerificationData } from './CenterVerificationStep';
import type { HospitalDetailsData } from './HospitalDetailsStep';
import type { HospitalVerificationData } from './HospitalVerificationStep';

interface OrgReviewStepProps {
  accountType: AccountType;
  accountData: { fullName: string; email: string; mobileNumber: string };
  centerDetails?: CenterDetailsData;
  centerVerification?: CenterVerificationData;
  hospitalDetails?: HospitalDetailsData;
  hospitalVerification?: HospitalVerificationData;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  error?: string;
}

function SectionCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b border-border">
        <Icon className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <div className="p-4 space-y-2 text-sm">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | string[] }) {
  const displayValue = Array.isArray(value) ? value.join(', ') : value;
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{displayValue || '—'}</span>
    </div>
  );
}

export function OrgReviewStep({
  accountType,
  accountData,
  centerDetails,
  centerVerification,
  hospitalDetails,
  hospitalVerification,
  termsAccepted,
  onTermsChange,
  error,
}: OrgReviewStepProps) {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <Check className="h-3.5 w-3.5 text-white" />
        </div>
        <p className="text-sm">
          <span className="font-medium">Almost there!</span> Review your information before submitting.
        </p>
      </div>

      <SectionCard icon={User} title="Owner / Admin Account">
        <InfoRow label="Full Name" value={accountData.fullName} />
        <InfoRow label="Email" value={accountData.email} />
        <InfoRow label="Mobile" value={accountData.mobileNumber} />
      </SectionCard>

      {accountType === 'diagnostic_center' && centerDetails && (
        <SectionCard icon={Microscope} title="Center Details">
          <InfoRow label="Name" value={centerDetails.centerName} />
          <InfoRow label="Email" value={centerDetails.email} />
          <InfoRow label="Phone" value={centerDetails.phone} />
          <InfoRow label="Address" value={centerDetails.address} />
          <InfoRow label="Location" value={`${centerDetails.city}, ${centerDetails.state}`} />
        </SectionCard>
      )}

      {accountType === 'diagnostic_center' && centerVerification && (
        <SectionCard icon={Shield} title="Verification">
          <InfoRow label="Accreditation" value={centerVerification.accreditationType} />
          <InfoRow label="License No." value={centerVerification.accreditationNumber} />
          <InfoRow label="GST" value={centerVerification.gstNumber} />
          <InfoRow
            label="Documents"
            value={[
              centerVerification.registrationCertificate ? '✓ Certificate' : '',
              centerVerification.ownerIdProof ? '✓ ID Proof' : '',
            ].filter(Boolean).join(', ')}
          />
        </SectionCard>
      )}

      {accountType === 'hospital' && hospitalDetails && (
        <SectionCard icon={Building2} title="Hospital Details">
          <InfoRow label="Name" value={hospitalDetails.hospitalName} />
          <InfoRow label="Email" value={hospitalDetails.email} />
          <InfoRow label="Phone" value={hospitalDetails.phone} />
          <InfoRow label="Address" value={hospitalDetails.address} />
          <InfoRow label="Location" value={`${hospitalDetails.city}, ${hospitalDetails.state}`} />
          <InfoRow label="Beds" value={hospitalDetails.numBeds} />
          <InfoRow label="Departments" value={hospitalDetails.departments} />
        </SectionCard>
      )}

      {accountType === 'hospital' && hospitalVerification && (
        <SectionCard icon={Shield} title="Verification">
          <InfoRow label="Registration No." value={hospitalVerification.registrationNumber} />
          <InfoRow label="NABH" value={hospitalVerification.accreditationNumber || 'Not provided'} />
          <InfoRow label="GST" value={hospitalVerification.gstNumber} />
          <InfoRow
            label="Documents"
            value={[
              hospitalVerification.clinicalEstablishmentLicense ? '✓ License' : '',
              hospitalVerification.registrationCertificate ? '✓ Certificate' : '',
              hospitalVerification.ownerIdProof ? '✓ ID Proof' : '',
              hospitalVerification.letterhead ? '✓ Letterhead' : '',
            ].filter(Boolean).join(', ')}
          />
        </SectionCard>
      )}

      <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
        termsAccepted ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      } ${error ? 'border-destructive' : ''}`}>
        <Checkbox
          checked={termsAccepted}
          onCheckedChange={(checked) => onTermsChange(checked === true)}
          className="mt-0.5"
        />
        <div>
          <p className="text-sm">
            I confirm that all the information provided is accurate and I agree to the{' '}
            <button type="button" className="text-primary font-medium hover:underline">Terms of Service</button>
            {' '}and{' '}
            <button type="button" className="text-primary font-medium hover:underline">Privacy Policy</button>.
          </p>
        </div>
      </label>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
